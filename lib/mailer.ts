import net from 'net'
import tls from 'tls'
import { getSmtpSettings } from './db'

type SendEmailParams = {
  to: string
  subject: string
  text: string
  html: string
}

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

function resolveSmtpConfig(): SmtpConfig | null {
  const dbCfg = getSmtpSettings()
  if (dbCfg && dbCfg.enabled && dbCfg.host && dbCfg.user && dbCfg.pass) {
    return {
      host: dbCfg.host,
      port: dbCfg.port,
      secure: dbCfg.secure,
      user: dbCfg.user,
      pass: dbCfg.pass,
      from: dbCfg.from || dbCfg.user,
    }
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 465)
    return {
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    }
  }

  return null
}

function wrapBase64(input: string): string {
  const b64 = Buffer.from(input, 'utf8').toString('base64')
  return b64.match(/.{1,76}/g)?.join('\r\n') || ''
}

function formatFromHeader(from: string, user: string): string {
  const trimmed = from.trim()
  if (trimmed.includes('<') && trimmed.includes('>')) return trimmed
  if (trimmed.includes('@')) return `Swaply <${trimmed}>`
  return `${trimmed || 'Swaply'} <${user}>`
}

function extractEmailAddress(from: string, user: string): string {
  const match = from.match(/<([^>]+)>/)
  if (match?.[1]) return match[1].trim()
  if (from.includes('@')) return from.trim()
  return user.trim()
}

async function sendViaSmtp(
  params: SendEmailParams,
  cfg: SmtpConfig
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    let socket: net.Socket | tls.TLSSocket = cfg.secure
      ? tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host })
      : net.connect({ host: cfg.host, port: cfg.port })

    let buffer = ''
    let step = 0
    let done = false

    const finish = (ok: boolean, error?: string) => {
      if (done) return
      done = true
      try {
        socket.removeAllListeners()
        socket.end()
      } catch {}
      resolve({ ok, error })
    }

    const onError = (err: Error) => finish(false, err.message || 'SMTP ulanish xatosi')

    socket.setTimeout(12000, () => finish(false, 'SMTP server javob bermadi (timeout)'))
    socket.on('error', onError)

    const sendLine = (line: string) => {
      socket.write(`${line}\r\n`)
    }

    const handleResponse = (code: number, lineText: string) => {
      if (code >= 400) {
        finish(false, `SMTP ${code}: ${lineText}`)
        return
      }
      if (step === 0 && code === 220) {
        step = 1
        sendLine('EHLO swaply.uz')
      } else if (step === 1 && code === 250) {
        if (!cfg.secure && !(socket instanceof tls.TLSSocket)) {
          step = 15
          sendLine('STARTTLS')
        } else {
          step = 2
          sendLine('AUTH LOGIN')
        }
      } else if (step === 15 && code === 220) {
        const rawSocket = socket
        rawSocket.removeListener('data', onData)
        rawSocket.removeListener('error', onError)
        const tlsSocket = tls.connect({ socket: rawSocket, servername: cfg.host })
        socket = tlsSocket
        tlsSocket.setTimeout(12000, () => finish(false, 'SMTP TLS timeout'))
        tlsSocket.on('error', onError)
        tlsSocket.on('data', onData)
        buffer = ''
        step = 16
        sendLine('EHLO swaply.uz')
      } else if (step === 16 && code === 250) {
        step = 2
        sendLine('AUTH LOGIN')
      } else if (step === 2 && code === 334) {
        step = 3
        sendLine(Buffer.from(cfg.user, 'utf8').toString('base64'))
      } else if (step === 3 && code === 334) {
        step = 4
        sendLine(Buffer.from(cfg.pass, 'utf8').toString('base64'))
      } else if (step === 4 && code === 235) {
        step = 5
        const envelopeFrom = extractEmailAddress(cfg.from, cfg.user)
        sendLine(`MAIL FROM:<${envelopeFrom}>`)
      } else if (step === 5 && code === 250) {
        step = 6
        sendLine(`RCPT TO:<${params.to}>`)
      } else if (step === 6 && (code === 250 || code === 251)) {
        step = 7
        sendLine('DATA')
      } else if (step === 7 && code === 354) {
        step = 8
        const boundary = `swaply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const fromHeader = formatFromHeader(cfg.from, cfg.user)
        const message = [
          `From: ${fromHeader}`,
          `To: <${params.to}>`,
          `Subject: =?UTF-8?B?${Buffer.from(params.subject, 'utf8').toString('base64')}?=`,
          `Date: ${new Date().toUTCString()}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          wrapBase64(params.text),
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          wrapBase64(params.html),
          '',
          `--${boundary}--`,
          '.',
        ].join('\r\n')
        sendLine(message)
      } else if (step === 8 && code === 250) {
        step = 9
        sendLine('QUIT')
        finish(true)
      }
    }

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8')
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line) continue
        if (/^\d{3} /.test(line)) {
          const code = parseInt(line.slice(0, 3), 10)
          handleResponse(code, line.slice(4).trim())
        }
      }
    }

    socket.on('data', onData)
  })
}

export async function sendEmailMessage(
  params: SendEmailParams
): Promise<{ delivered: boolean; configured: boolean; error?: string }> {
  // 1. Resend API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'Swaply <onboarding@resend.dev>',
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      })
      if (res.ok) return { delivered: true, configured: true }
      const errText = await res.text().catch(() => '')
      return { delivered: false, configured: true, error: `Resend xatosi: ${errText || res.status}` }
    } catch (e) {
      return {
        delivered: false,
        configured: true,
        error: e instanceof Error ? e.message : 'Resend ulanish xatosi',
      }
    }
  }

  // 2. SMTP (from Admin DB settings or .env.local)
  const smtpConfig = resolveSmtpConfig()
  if (smtpConfig) {
    const result = await sendViaSmtp(params, smtpConfig)
    return {
      delivered: result.ok,
      configured: true,
      error: result.error,
    }
  }

  return { delivered: false, configured: false }
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: 'login' | 'register' | 'reset'
): Promise<{ delivered: boolean; devMode: boolean; configured: boolean; error?: string }> {
  const title =
    purpose === 'register'
      ? 'Swaply — Ro‘yxatdan o‘tish tasdiqlash kodi'
      : purpose === 'reset'
        ? 'Swaply — Parolni tiklash tasdiqlash kodi'
        : 'Swaply — Tizimga kirish tasdiqlash kodi'

  const text = `Swaply tasdiqlash kodingiz: ${code}\nKod 5 daqiqa davomida amal qiladi. Uni hech kimga bermang.`
  const html = `
    <div style="font-family:Arial,sans-serif;background:#162C1F;color:#E8DCC4;padding:28px;border-radius:16px;max-width:460px;margin:0 auto;">
      <h2 style="margin:0 0 12px;color:#E8DCC4;">Swaply — Tasdiqlash kodi</h2>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#d6cbb5;">
        ${
          purpose === 'register'
            ? 'Ro‘yxatdan o‘tishni yakunlash'
            : purpose === 'reset'
              ? 'Parolingizni tiklash'
              : 'Hisobingizga xavfsiz kirish'
        } uchun quyidagi 6 xonali kodni kiriting:
      </p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;padding:16px;background:#244632;border:1px solid #8B5CF6;border-radius:12px;color:#FFFFFF;">
        ${code}
      </div>
      <p style="margin:18px 0 0;font-size:12px;color:#a89f8d;">
        Kod 5 daqiqa amal qiladi. Agar bu so‘rovni siz yubormagan bo‘lsangiz, xabarni e’tiborsiz qoldiring.
      </p>
    </div>
  `

  const res = await sendEmailMessage({ to, subject: title, text, html })
  if (res.delivered) {
    return { delivered: true, devMode: false, configured: true }
  }

  if (res.configured) {
    console.error(`[Swaply SMTP Failed] To: ${to} | Error: ${res.error}`)
    return {
      delivered: false,
      devMode: false,
      configured: true,
      error: res.error || 'Email yuborishda SMTP xatoligi',
    }
  }

  // SMTP hali sozlanmagan holatda lokal dev uchun konsolga chiqarish
  console.info(`[Swaply OTP] Email: ${to} | Purpose: ${purpose} | Code: ${code}`)
  return {
    delivered: false,
    devMode: process.env.NODE_ENV !== 'production',
    configured: false,
  }
}

export async function sendTestSmtpEmail(to: string): Promise<{ ok: boolean; error?: string }> {
  const res = await sendEmailMessage({
    to,
    subject: 'Swaply — SMTP Test Xabari',
    text: 'Tabriklaymiz! Swaply platformasi SMTP pochta serveri muvaffaqiyatli sozlandi. Endi Login, Register va Reset Password kodlari to‘g‘ridan-to‘g‘ri pochtaga boradi.',
    html: `
      <div style="font-family:Arial,sans-serif;background:#162C1F;color:#E8DCC4;padding:24px;border-radius:16px;max-width:460px;margin:0 auto;">
        <h2 style="margin:0 0 10px;color:#E8DCC4;">✓ SMTP muvaffaqiyatli ulandi!</h2>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#d6cbb5;">
          Swaply platformasi endi 6 xonali OTP kodlarni (Kirish, Ro‘yxatdan o‘tish va Parolni tiklash) foydalanuvchilar emailiga yuborishga tayyor.
        </p>
      </div>
    `,
  })
  return {
    ok: res.delivered,
    error: res.configured ? res.error : 'SMTP hali sozlanmagan (Host, Email va App Password kiriting)',
  }
}
