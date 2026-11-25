import { NextRequest, NextResponse } from 'next/server'
import { topUpUserCoins } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Hamyonni to‘ldirish uchun tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ amount?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { amount } = parsed.data
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { error: 'Noto‘g‘ri tanga miqdori (1 dan 1000 gacha butun son bo‘lishi kerak)' },
        { status: 400 }
      )
    }

    const result = topUpUserCoins(auth.user.id, amount)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coins: result.coins,
      message: `Hamyoningizga +${amount} tanga qo‘shildi!`,
    })
  } catch (error) {
    console.error('Coin topup error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
