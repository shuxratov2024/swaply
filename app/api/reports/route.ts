import { NextRequest, NextResponse } from 'next/server'
import { createReport, getAllReports, updateReportStatus, findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { parseJsonBody, requireStaff } from '@/lib/api-helpers'

const VALID_REASONS = new Set(['spam', 'scam', 'offensive', 'fake', 'other'])
const VALID_TARGET_TYPES = new Set(['offer', 'user', 'platform'])
const VALID_STATUSES = new Set(['pending', 'reviewed', 'resolved'])

export async function GET(request: NextRequest) {
  try {
    const staffAuth = requireStaff(request)
    if (staffAuth.error) return staffAuth.error

    const reports = getAllReports()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'Shikoyatlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody<{
      targetType?: unknown
      targetId?: unknown
      targetName?: unknown
      targetUsername?: unknown
      reason?: unknown
      description?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { targetType, targetId, targetName, targetUsername, reason, description } = parsed.data

    if (
      typeof reason !== 'string' || !VALID_REASONS.has(reason) ||
      typeof description !== 'string' || !description.trim()
    ) {
      return NextResponse.json(
        { error: 'Shikoyat sababi va tavsifini kiritishingiz shart' },
        { status: 400 }
      )
    }

    if (description.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Shikoyat tavsifi 1000 ta belgidan oshmasligi kerak' },
        { status: 400 }
      )
    }

    let reporterId: number | undefined
    let reporterName: string | undefined
    let reporterUsername: string | undefined

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7).trim())
      if (payload) {
        const user = findUserById(payload.userId)
        if (user) {
          reporterId = user.id
          reporterName = user.name
          reporterUsername = user.username
        }
      }
    }

    const titles: Record<string, string> = {
      spam: 'Spam yoki reklama',
      scam: 'Firibgarlik yoki shubhali e’lon',
      offensive: 'Haqoratli yoki nojo‘iz mazmun',
      fake: 'Soxta yoki noto‘g‘ri ma’lumot',
      other: 'Boshqa muammo',
    }

    const validTargetType =
      typeof targetType === 'string' && VALID_TARGET_TYPES.has(targetType)
        ? (targetType as 'offer' | 'user' | 'platform')
        : 'offer'

    const report = createReport({
      reporterId,
      reporterName: reporterName || 'Anonim foydalanuvchi',
      reporterUsername: reporterUsername || 'anonim',
      targetType: validTargetType,
      targetId: targetId ? String(targetId).slice(0, 80) : undefined,
      targetName: typeof targetName === 'string' ? targetName.trim().slice(0, 100) : undefined,
      targetUsername:
        typeof targetUsername === 'string'
          ? targetUsername.trim().replace(/^@/, '').slice(0, 40)
          : undefined,
      reason: reason as 'spam' | 'scam' | 'offensive' | 'fake' | 'other',
      reasonTitle: titles[reason] || 'Boshqa shikoyat',
      description: description.trim(),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Shikoyatingiz qabul qilindi va ma’muriyat tomonidan ko‘rib chiqiladi',
        report,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const staffAuth = requireStaff(request)
    if (staffAuth.error) return staffAuth.error

    const parsed = await parseJsonBody<{ reportId?: unknown; status?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { reportId, status } = parsed.data

    if (
      typeof reportId !== 'string' || !reportId ||
      typeof status !== 'string' || !VALID_STATUSES.has(status)
    ) {
      return NextResponse.json({ error: 'Ma’lumotlar noto‘g‘ri yoki yetarli emas' }, { status: 400 })
    }

    const ok = updateReportStatus(reportId, status as 'pending' | 'reviewed' | 'resolved')
    if (!ok) {
      return NextResponse.json({ error: 'Shikoyat topilmadi' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Holat yangilandi' })
  } catch (error) {
    console.error('Reports PATCH error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
