import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmailOrUsername } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validatsiya
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email (yoki username) va parol majburiy' },
        { status: 400 }
      )
    }

    // Foydalanuvchini email yoki username orqali topish
    const user = findUserByEmailOrUsername(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email/username yoki parol noto‘g‘ri' },
        { status: 401 }
      )
    }

    // Parolni tekshirish
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email/username yoki parol noto‘g‘ri' },
        { status: 401 }
      )
    }

    // JWT token yaratish
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return NextResponse.json({
      message: 'Muvaffaqiyatli kirdingiz!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        gender: user.gender,
        role: user.role,
        coins: user.coins,
        phone: user.phone,
        telegram: user.telegram,
        whatsapp: user.whatsapp,
        lastClaimDate: user.lastClaimDate,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
