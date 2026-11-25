import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail, isUsernameAvailable, createUser } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { parseJsonBody, sanitizeUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody<{
      name?: unknown
      username?: unknown
      email?: unknown
      password?: unknown
      gender?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { name, username, email, password, gender } = parsed.data

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
      return NextResponse.json(
        { error: 'Ism 2 dan 60 tagacha belgidan iborat bo‘lishi kerak' },
        { status: 400 }
      )
    }

    if (typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { error: 'Username kiriting (masalan, @azizbek)' },
        { status: 400 }
      )
    }

    const usernameCheck = isUsernameAvailable(username)
    if (!usernameCheck.available) {
      return NextResponse.json(
        { error: usernameCheck.error || 'Bu username band' },
        { status: 409 }
      )
    }

    if (typeof email !== 'string' || !email.trim() || email.trim().length > 120) {
      return NextResponse.json(
        { error: 'Email manzil majburiy' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: 'Parol 6 dan 128 tagacha belgidan iborat bo‘lishi kerak' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Email formati noto‘g‘ri' },
        { status: 400 }
      )
    }

    const existing = findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'Bu email allaqachon ro‘yxatdan o‘tgan' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = createUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      passwordHash: hashedPassword,
      gender: gender === 'male' || gender === 'female' ? gender : 'other',
    })

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })

    return NextResponse.json(
      {
        message: 'Ro‘yxatdan muvaffaqiyatli o‘tdingiz!',
        token,
        user: sanitizeUser(newUser),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
