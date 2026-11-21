import { NextRequest, NextResponse } from 'next/server'
import { createReport, getAllReports, updateReportStatus, findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const reports = getAllReports()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'Shikoyatlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetType, targetId, targetName, targetUsername, reason, description } = body

    if (!reason || !description?.trim()) {
      return NextResponse.json(
        { error: 'Shikoyat sababi va tavsifini kiritishingiz shart' },
        { status: 400 }
      )
    }

    let reporterId: number | undefined
    let reporterName: string | undefined
    let reporterUsername: string | undefined

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7))
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

    const report = createReport({
      reporterId,
      reporterName: reporterName || 'Anonim foydalanuvchi',
      reporterUsername: reporterUsername || 'anonim',
      targetType: targetType || 'offer',
      targetId: targetId ? String(targetId) : undefined,
      targetName: targetName || undefined,
      targetUsername: targetUsername ? targetUsername.replace(/^@/, '') : undefined,
      reason: reason || 'other',
      reasonTitle: titles[reason] || 'Boshqa shikoyat',
      description: description.trim(),
    })

    return NextResponse.json({
      success: true,
      message: 'Shikoyatingiz qabul qilindi va ma’muriyat tomonidan ko‘rib chiqiladi',
      report,
    })
  } catch (error) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 })
    }

    const body = await request.json()
    const { reportId, status } = body

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Ma’lumotlar yetarli emas' }, { status: 400 })
    }

    const ok = updateReportStatus(reportId, status)
    if (!ok) {
      return NextResponse.json({ error: 'Shikoyat topilmadi' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Holat yangilandi' })
  } catch (error) {
    console.error('Reports PATCH error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
