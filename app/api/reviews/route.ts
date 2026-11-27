import { NextRequest, NextResponse } from 'next/server'
import { getReviewsForUser, upsertUserReview } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || undefined
    const userIdParam = searchParams.get('userId')
    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined

    if (!username && (userId === undefined || Number.isNaN(userId))) {
      return NextResponse.json({ error: 'username yoki userId kerak' }, { status: 400 })
    }

    const result = getReviewsForUser({
      username,
      userId: userId !== undefined && !Number.isNaN(userId) ? userId : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Sharhlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`reviews:${ip}`, 20, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Juda ko‘p so‘rov. ${rl.retryAfterSec} soniyadan keyin urinib ko‘ring` },
        { status: 429 }
      )
    }

    const auth = authenticateRequest(request, 'Baho berish uchun avval tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{
      targetUserId?: unknown
      targetUsername?: unknown
      rating?: unknown
      comment?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { targetUserId, targetUsername, rating, comment } = parsed.data

    if (typeof targetUsername !== 'string' || !targetUsername.trim()) {
      return NextResponse.json({ error: 'Foydalanuvchi username ko‘rsatilishi shart' }, { status: 400 })
    }
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Baho 1 dan 5 gacha butun son bo‘lishi kerak' }, { status: 400 })
    }
    if (typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json({ error: 'Sharh kamida 3 ta belgidan iborat bo‘lishi kerak' }, { status: 400 })
    }

    const result = upsertUserReview({
      targetUserId: typeof targetUserId === 'number' && Number.isInteger(targetUserId) ? targetUserId : undefined,
      targetUsername,
      reviewer: {
        id: auth.user.id,
        name: auth.user.name,
        username: auth.user.username,
        avatar: auth.user.avatar,
      },
      rating,
      comment,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Baho saqlanmadi' }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        review: result.review,
        averageRating: result.averageRating,
        totalCount: result.totalCount,
        message: 'Bahoyingiz va sharhingiz saqlandi!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
