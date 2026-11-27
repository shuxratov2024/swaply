import { NextRequest, NextResponse } from 'next/server'
import { createSwapRequest, getUserSwaps, updateSwapStatus } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const VALID_NEXT_STATUSES = new Set(['accepted', 'declined', 'completed'])

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Almashuvlarni ko‘rish uchun tizimga kiring')
    if (auth.error) return auth.error

    const data = getUserSwaps(auth.user.id, auth.user.username)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Swaps GET error:', error)
    return NextResponse.json({ error: 'Almashuvlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`swaps:${ip}`, 20, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p so‘rov. ${rl.retryAfterSec} soniyadan keyin urinib ko‘ring` },
        { status: 429 }
      )
    }

    const auth = authenticateRequest(request, 'Almashuv taklifi yuborish uchun tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{
      offerId?: unknown
      proposedSkill?: unknown
      message?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { offerId, proposedSkill, message } = parsed.data

    if (typeof offerId !== 'string' || !offerId.trim()) {
      return NextResponse.json({ error: 'Taklif ID si kerak' }, { status: 400 })
    }
    if (typeof proposedSkill !== 'string' || proposedSkill.trim().length < 2) {
      return NextResponse.json({ error: 'Qaysi ko‘nikmani o‘rgatishingizni yozing' }, { status: 400 })
    }
    if (typeof message !== 'string' || message.trim().length < 4) {
      return NextResponse.json({ error: 'Qisqa taklif xabarini yozing' }, { status: 400 })
    }

    const result = createSwapRequest({
      offerId: offerId.trim(),
      sender: {
        id: auth.user.id,
        name: auth.user.name,
        username: auth.user.username,
      },
      proposedSkill,
      message,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Taklif yuborilmadi' }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        swap: result.swap,
        message: 'Almashuv taklifingiz yuborildi!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Swaps POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Almashuv holatini o‘zgartirish uchun tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ swapId?: unknown; status?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { swapId, status } = parsed.data
    if (
      typeof swapId !== 'string' || !swapId.trim() ||
      typeof status !== 'string' || !VALID_NEXT_STATUSES.has(status)
    ) {
      return NextResponse.json({ error: 'swapId va to‘g‘ri status kerak' }, { status: 400 })
    }

    const result = updateSwapStatus(
      swapId.trim(),
      { id: auth.user.id, username: auth.user.username },
      status as 'accepted' | 'declined' | 'completed'
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Yangilab bo‘lmadi' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      swap: result.swap,
      coins: result.coins,
      message:
        status === 'accepted'
          ? 'Almashuv taklifi qabul qilindi!'
          : status === 'declined'
            ? 'Almashuv taklifi rad etildi'
            : 'Almashuv muvaffaqiyatli yakunlandi! +1 bonus tanga berildi!',
    })
  } catch (error) {
    console.error('Swaps PATCH error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
