import { NextRequest, NextResponse } from 'next/server'
import { spendUserCoin, unlockOfferContact } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`spend:${ip}`, 30, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p so‘rov yuborildi. ${rl.retryAfterSec} soniyadan keyin urinib ko‘ring` },
        { status: 429 }
      )
    }

    const auth = authenticateRequest(request, 'Kontaktni ochish uchun profilingizga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ offerId?: unknown; amount?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { offerId, amount } = parsed.data

    if (typeof offerId === 'string' && offerId.trim()) {
      const result = unlockOfferContact(auth.user.id, offerId.trim())
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Tangalar yetarli emas', coins: result.coins },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        coins: result.coins,
        alreadyUnlocked: result.alreadyUnlocked,
        contact: result.contact,
        message: result.alreadyUnlocked
          ? 'Kontakt ma’lumotlari yuklandi!'
          : 'Kontakt muvaffaqiyatli ochildi!',
      })
    }

    const numericAmount = amount === undefined ? 1 : amount
    if (typeof numericAmount !== 'number' || !Number.isInteger(numericAmount) || numericAmount <= 0 || numericAmount > 100) {
      return NextResponse.json({ error: 'Noto‘g‘ri tanga miqdori' }, { status: 400 })
    }

    const result = spendUserCoin(auth.user.id, numericAmount)
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
