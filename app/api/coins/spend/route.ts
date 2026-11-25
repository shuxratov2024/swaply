import { NextRequest, NextResponse } from 'next/server'
import { spendUserCoin } from '@/lib/db'
import { authenticateRequest } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Kontaktni ochish uchun profilingizga kiring')
    if (auth.error) return auth.error

    const body = await request.json().catch(() => ({}))
    const rawAmount = body?.amount
    const amount = rawAmount === undefined ? 1 : rawAmount

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0 || amount > 100) {
      return NextResponse.json(
        { error: 'Noto‘g‘ri tanga miqdori' },
        { status: 400 }
      )
    }

    const result = spendUserCoin(auth.user.id, amount)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Tangalar yetarli emas', coins: result.coins },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      coins: result.coins,
      message: 'Kontakt muvaffaqiyatli ochildi!',
    })
  } catch (error) {
    console.error('Coin spend error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
