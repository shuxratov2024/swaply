import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmailOrUsername } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { parseJsonBody, sanitizeUser } from '@/lib/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`login:${ip}`, 15, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p urinish. ${rl.retryAfterSec} soniyadan keyin qayta urinib ko‘ring` },
        { status: 429 }
      )
    }
    const parsed = await parseJsonBody<{ email?: unknown; password?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { email, password } = parsed.data

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { error: 'Email (yoki username) va parol majburiy' },
        { status: 400 }
      )
    }

    const user = findUserByEmailOrUsername(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email/username yoki parol noto‘g‘ri' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email/username yoki parol noto‘g‘ri' },
        { status: 401 }
      )
    }

    if (user.banned) {
      return NextResponse.json(
        { error: 'Sizning hisobingiz bloklangan. Qo‘llab-quvvatlash xizmatiga murojaat qiling' },
        { status: 403 }
      )
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
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
