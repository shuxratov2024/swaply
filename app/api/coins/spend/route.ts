import { NextRequest, NextResponse } from 'next/server'
import { spendUserCoin, findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Kontaktni ochish uchun profilingizga kiring' },
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

    const body = await request.json().catch(() => ({}))
    const amount = body.amount && typeof body.amount === 'number' ? body.amount : 1

    const result = spendUserCoin(user.id, amount)

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
