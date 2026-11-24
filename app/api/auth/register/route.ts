import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail, isUsernameAvailable, createUser } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, email, password, gender } = body

    // Validatsiya
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Ismingizni kiriting' },
        { status: 400 }
      )
    }

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { error: 'Username kiriting (masalan, @azizbek)' },
        { status: 400 }
      )
    }

    // Username bandligini tekshirish
    const usernameCheck = isUsernameAvailable(username)
    if (!usernameCheck.available) {
      return NextResponse.json(
        { error: usernameCheck.error || 'Bu username band' },
        { status: 409 }
      )
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email manzil majburiy' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Parol majburiy' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' },
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

    // Email allaqachon mavjudligini tekshirish
    const existing = findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'Bu email allaqachon ro‘yxatdan o‘tgan' },
        { status: 409 }
      )
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10)

    // Foydalanuvchini yaratish
    const newUser = createUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      passwordHash: hashedPassword,
      gender: gender === 'male' || gender === 'female' ? gender : 'other',
    })

    // JWT token yaratish
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })

    const response = NextResponse.json(
      {
        message: 'Ro‘yxatdan muvaffaqiyatli o‘tdingiz!',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          bio: newUser.bio,
          gender: newUser.gender,
          role: newUser.role,
          coins: newUser.coins,
          lastClaimDate: newUser.lastClaimDate,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    )
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)
    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
