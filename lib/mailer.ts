import net from 'net'
import tls from 'tls'

type SendEmailParams = {
  to: string
  subject: string
  text: string
  html: string
}

async function sendViaSmtp(params: SendEmailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user || 'no-reply@swaply.uz'

  if (!host || !user || !pass) return false

  const secure = port === 465 || process.env.SMTP_SECURE === 'true'

  return new Promise((resolve) => {
    let socket: net.Socket | tls.TLSSocket = secure
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port })

    let buffer = ''
    let step = 0
    let done = false

    const finish = (ok: boolean) => {
      if (done) return
      done = true
      try {
        socket.end()
      } catch {}
      resolve(ok)
    }

    socket.setTimeout(10000, () => finish(false))
    socket.on('error', () => finish(false))

    const sendLine = (line: string) => {
      socket.write(`${line}\r\n`)
    }

    const handleResponse = (code: number) => {
      if (code >= 400) {
        finish(false)
        return
      }
      if (step === 0 && code === 220) {
        step = 1
        sendLine(`EHLO swaply.uz`)
      } else if (step === 1 && code === 250) {
        if (!secure && !(socket instanceof tls.TLSSocket)) {
          step = 15
          sendLine('STARTTLS')
        } else {
          step = 2
          sendLine('AUTH LOGIN')
        }
      } else if (step === 15 && code === 220) {
        socket = tls.connect({ socket, servername: host })
        socket.setTimeout(10000, () => finish(false))
        socket.on('error', () => finish(false))
        socket.on('data', onData)
        step = 16
        sendLine('EHLO swaply.uz')
      } else if (step === 16 && code === 250) {
        step = 2
        sendLine('AUTH LOGIN')
      } else if (step === 2 && code === 334) {
        step = 3
        sendLine(Buffer.from(user).toString('base64'))
      } else if (step === 3 && code === 334) {
        step = 4
        sendLine(Buffer.from(pass).toString('base64'))
      } else if (step === 4 && code === 235) {
        step = 5
        sendLine(`MAIL FROM:<${from}>`)
      } else if (step === 5 && code === 250) {
        step = 6
        sendLine(`RCPT TO:<${params.to}>`)
      } else if (step === 6 && (code === 250 || code === 251)) {
        step = 7
        sendLine('DATA')
      } else if (step === 7 && code === 354) {
        step = 8
        const boundary = `swaply_${Date.now()}`
        const message = [
          `From: Swaply <${from}>`,
          `To: <${params.to}>`,
          `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/plain; charset=UTF-8',
          '',
          params.text,
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          '',
          params.html,
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
          handleResponse(code)
        }
      }
    }

    socket.on('data', onData)
  })
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: 'login' | 'register' | 'reset'
): Promise<{ delivered: boolean; devMode: boolean }> {
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
          to: [to],
          subject: title,
          html,
          text,
        }),
      })
      if (res.ok) return { delivered: true, devMode: false }
    } catch (e) {
      console.error('Resend email error:', e)
    }
  }

  // 2. SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const ok = await sendViaSmtp({ to, subject: title, text, html })
    if (ok) return { delivered: true, devMode: false }
  }

  // 3. Development fallback (no SMTP configured)
  console.info(`[Swaply OTP] Email: ${to} | Purpose: ${purpose} | Code: ${code}`)
  return { delivered: false, devMode: process.env.NODE_ENV !== 'production' }
}
