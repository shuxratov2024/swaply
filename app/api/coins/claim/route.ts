import { NextRequest, NextResponse } from 'next/server'
import { claimDailyReward } from '@/lib/db'
import { authenticateRequest } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(
      request,
      "Tangalarni olish uchun ro'yxatdan o'ting yoki tizimga kiring"
    )
    if (auth.error) return auth.error

    const result = claimDailyReward(auth.user.id)

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
