import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import {
  createOtpChallenge,
  findUserByEmail,
  isUsernameAvailable,
  verifyOtpChallenge,
} from '@/lib/db'
import { signToken } from '@/lib/auth'
import { parseJsonBody, sanitizeUser } from '@/lib/api-helpers'
import { sendOtpEmail } from '@/lib/mailer'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const ipLimit = checkRateLimit(`otp:${ip}`, 15, 60_000)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p so‘rov. ${ipLimit.retryAfterSec} soniyadan keyin urinib ko‘ring` },
        { status: 429 }
      )
    }

    const parsed = await parseJsonBody<{
      action?: unknown
      email?: unknown
      purpose?: unknown
      code?: unknown
      password?: unknown
      username?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { action, email, purpose, code, password, username } = parsed.data

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'To‘g‘ri email manzil kiriting' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPurpose: 'login' | 'register' | 'reset' =
      purpose === 'register' ? 'register' : purpose === 'reset' ? 'reset' : 'login'

    if (action === 'send') {
      const emailLimit = checkRateLimit(`otp-send:${cleanEmail}`, 5, 120_000)
      if (!emailLimit.allowed) {
        return NextResponse.json(
          { error: `Kod qayta yuborish uchun ${emailLimit.retryAfterSec} soniya kuting` },
          { status: 429 }
        )
      }

      if (cleanPurpose === 'login' || cleanPurpose === 'reset') {
        const user = findUserByEmail(cleanEmail)
        if (!user) {
          return NextResponse.json(
            { error: 'Ushbu email bilan hisob topilmadi. Avval ro‘yxatdan o‘ting' },
            { status: 404 }
          )
        }
        if (user.banned) {
          return NextResponse.json(
            { error: 'Hisobingiz bloklangan. Ma’muriyatga murojaat qiling' },
            { status: 403 }
          )
        }
        if (cleanPurpose === 'login' && typeof password === 'string' && password.length > 0) {
          const validPass = await bcrypt.compare(password, user.password)
          if (!validPass) {
            return NextResponse.json({ error: 'Parol noto‘g‘ri' }, { status: 401 })
          }
        }
      } else {
        const existing = findUserByEmail(cleanEmail)
        if (existing) {
          return NextResponse.json(
            { error: 'Bu email allaqachon ro‘yxatdan o‘tgan' },
            { status: 409 }
          )
        }
        if (typeof username === 'string' && username.trim()) {
          const uCheck = isUsernameAvailable(username)
          if (!uCheck.available) {
            return NextResponse.json(
              { error: uCheck.error || 'Bu username band' },
              { status: 409 }
            )
          }
        }
      }

      const otpCode = createOtpChallenge(cleanEmail, cleanPurpose)
      const mailResult = await sendOtpEmail(cleanEmail, otpCode, cleanPurpose)

      return NextResponse.json({
        success: true,
        delivered: mailResult.delivered,
        message: mailResult.delivered
          ? `${cleanEmail} manziliga 6 xonali tasdiqlash kodi yuborildi!`
          : `Tasdiqlash kodi tayyorlandi (${cleanEmail}).`,
        ...(mailResult.devMode ? { devOtp: otpCode } : {}),
      })
    }

    if (action === 'verify') {
      if (cleanPurpose !== 'login') {
        return NextResponse.json({ error: 'Noto‘g‘ri tasdiqlash turi' }, { status: 400 })
      }
      if (typeof code !== 'string') {
        return NextResponse.json({ error: '6 xonali kodni kiriting' }, { status: 400 })
      }

      const check = verifyOtpChallenge(cleanEmail, code, 'login')
      if (!check.valid) {
        return NextResponse.json({ error: check.error || 'Kod noto‘g‘ri' }, { status: 401 })
      }

      const user = findUserByEmail(cleanEmail)
      if (!user) {
        return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
      }
      if (user.banned) {
        return NextResponse.json({ error: 'Hisobingiz bloklangan' }, { status: 403 })
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      })

      return NextResponse.json({
        message: 'Muvaffaqiyatli kirdingiz!',
        token,
        user: sanitizeUser(user),
      })
    }

    return NextResponse.json({ error: 'Noma’lum OTP amali' }, { status: 400 })
  } catch (error) {
    console.error('OTP error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
