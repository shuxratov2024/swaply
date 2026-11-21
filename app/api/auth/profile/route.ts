import { NextRequest, NextResponse } from 'next/server'
import { updateUser, isUsernameAvailable } from '@/lib/db'
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
    const { name, username, bio, avatar, coins, phone, telegram, whatsapp, lastClaimDate } = body

    // Agar username o'zgartirilayotgan bo'lsa, bandligini tekshiramiz
    if (username !== undefined) {
      const check = isUsernameAvailable(username, payload.userId)
      if (!check.available) {
        return NextResponse.json(
          { error: check.error || 'Bu username band' },
          { status: 409 }
        )
      }
    }

    const updated = updateUser(payload.userId, {
      ...(name ? { name } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(coins !== undefined ? { coins } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(telegram !== undefined ? { telegram } : {}),
      ...(whatsapp !== undefined ? { whatsapp } : {}),
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
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        bio: updated.bio,
        coins: updated.coins,
        phone: updated.phone,
        telegram: updated.telegram,
        whatsapp: updated.whatsapp,
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
