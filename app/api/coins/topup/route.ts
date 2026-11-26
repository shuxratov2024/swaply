import { NextRequest, NextResponse } from 'next/server'
import {
  COIN_PACKS,
  COIN_PRICE_UZS,
  createTopUpRequest,
  getUserTransactions,
  validatePromoCode,
  type CoinPackId,
} from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'

const VALID_PACK_IDS = new Set<CoinPackId>(['start', 'popular', 'pro', 'vip'])
const VALID_PROVIDERS = new Set<'payme' | 'click' | 'uzum'>(['payme', 'click', 'uzum'])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promo = searchParams.get('promo')
    const packId = searchParams.get('packId') as CoinPackId | null

    const promoResult = promo
      ? validatePromoCode(promo, packId && VALID_PACK_IDS.has(packId) ? packId : undefined)
      : null

    let transactions: ReturnType<typeof getUserTransactions> = []
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const auth = authenticateRequest(request)
      if (!auth.error) {
        transactions = getUserTransactions(auth.user.id)
      }
    }

    return NextResponse.json({
      coinPriceUzs: COIN_PRICE_UZS,
      packs: COIN_PACKS,
      transactions,
      ...(promoResult ? { promoCheck: promoResult } : {}),
    })
  } catch (error) {
    console.error('Wallet GET error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Hamyonni to‘ldirish uchun tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{
      packId?: unknown
      provider?: unknown
      paymentRef?: unknown
      promoCode?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { packId, provider, paymentRef, promoCode } = parsed.data

    if (typeof packId !== 'string' || !VALID_PACK_IDS.has(packId as CoinPackId)) {
      return NextResponse.json({ error: 'Noto‘g‘ri tanga paketi tanlandi' }, { status: 400 })
    }

    if (typeof provider !== 'string' || !VALID_PROVIDERS.has(provider as 'payme' | 'click' | 'uzum')) {
      return NextResponse.json({ error: 'To‘lov tizimini tanlang (Payme, Click yoki Uzum)' }, { status: 400 })
    }

    if (typeof paymentRef !== 'string' || paymentRef.trim().length < 4) {
      return NextResponse.json(
        { error: 'To‘lov cheki raqami yoki telefon/karta oxirgi 4 raqamini kiriting' },
        { status: 400 }
      )
    }

    const result = createTopUpRequest({
      userId: auth.user.id,
      packId: packId as CoinPackId,
      provider: provider as 'payme' | 'click' | 'uzum',
      paymentRef: paymentRef.trim(),
      promoCode: typeof promoCode === 'string' ? promoCode.trim() : undefined,
    })

    if (!result.success || !result.transaction) {
      return NextResponse.json({ error: result.error || 'So‘rov yaratishda xatolik' }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        pending: true,
        coins: auth.user.coins,
        transaction: result.transaction,
        message: `Buyurtma #${result.transaction.id} qabul qilindi! Admin tasdiqlaganidan so‘ng +${result.transaction.coinsDelta} tanga hisobingizga tushadi.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Coin topup error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
