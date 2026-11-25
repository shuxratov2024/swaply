import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmailOrUsername } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { parseJsonBody, sanitizeUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
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
