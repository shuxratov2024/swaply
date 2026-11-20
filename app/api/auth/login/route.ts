import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validatsiya
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email va parol majburiy' },
        { status: 400 }
      )
    }

    // Foydalanuvchini topish
    const user = findUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email yoki parol noto\'g\'ri' },
        { status: 401 }
      )
    }

    // Parolni tekshirish
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email yoki parol noto\'g\'ri' },
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
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        coins: user.coins,
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
