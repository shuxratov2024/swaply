import { NextRequest, NextResponse } from 'next/server'
import { updateUser, findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { name, bio, avatar, coins, lastClaimDate } = body

    const updated = updateUser(payload.userId, {
      ...(name ? { name } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatar ? { avatar } : {}),
      ...(coins !== undefined ? { coins } : {}),
      ...(lastClaimDate ? { lastClaimDate } : {}),
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profil yangilandi',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio,
        coins: updated.coins,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
