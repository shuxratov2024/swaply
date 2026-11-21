import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { claimDailyReward, findUserById } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Tangalarni olish uchun ro\'yxatdan o\'ting yoki tizimga kiring' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Sessiya muddati tugagan. Qaytadan tizimga kiring' },
        { status: 401 }
      )
    }

    const user = findUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    const result = claimDailyReward(user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, alreadyClaimed: result.alreadyClaimed },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Kunlik bonus: +1 tanga hamyoningizga qo‘shildi!',
      coins: result.coins,
      claimedToday: true,
    })
  } catch (error) {
    console.error('Claim coin error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
