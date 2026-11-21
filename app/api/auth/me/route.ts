import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token topilmadi' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Token yaroqsiz yoki muddati tugagan' },
        { status: 401 }
      )
    }

    const user = findUserById(payload.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
