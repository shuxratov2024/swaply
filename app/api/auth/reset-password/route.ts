import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail, updateUserPassword, verifyOtpChallenge } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`reset-pw:${ip}`, 10, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p urinish. ${rl.retryAfterSec} soniyadan keyin urinib ko‘ring` },
        { status: 429 }
      )
    }

    const parsed = await parseJsonBody<{
      email?: unknown
      otpCode?: unknown
      newPassword?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { email, otpCode, newPassword } = parsed.data

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'To‘g‘ri email manzil kiriting' }, { status: 400 })
    }

    if (typeof otpCode !== 'string' || !/^\d{6}$/.test(otpCode.trim())) {
      return NextResponse.json({ error: '6 xonali tasdiqlash kodini kiriting' }, { status: 400 })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: 'Yangi parol 6 dan 128 tagacha belgidan iborat bo‘lishi kerak' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = findUserByEmail(cleanEmail)
    if (!user) {
      return NextResponse.json({ error: 'Bunday email bilan hisob topilmadi' }, { status: 404 })
    }
    if (user.banned) {
      return NextResponse.json({ error: 'Hisobingiz bloklangan' }, { status: 403 })
    }

    const otpCheck = verifyOtpChallenge(cleanEmail, otpCode, 'reset')
    if (!otpCheck.valid) {
      return NextResponse.json(
        { error: otpCheck.error || 'Tasdiqlash kodi noto‘g‘ri' },
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const updated = updateUserPassword(user.id, hashedPassword)
    if (!updated) {
      return NextResponse.json({ error: 'Parolni yangilab bo‘lmadi' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan kirishingiz mumkin.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
