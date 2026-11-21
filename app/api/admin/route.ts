import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminStats,
  getAdminUsersList,
  getAllReports,
  adminDeleteOffer,
  adminAdjustUserCoins,
  updateReportStatus,
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''

    const stats = getAdminStats()
    const users = getAdminUsersList(query)
    const reports = getAllReports()

    return NextResponse.json({
      stats,
      users,
      reports,
    })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Admin ma’lumotlarini yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'deleteOffer') {
      const { offerId } = body
      if (!offerId) {
        return NextResponse.json({ error: 'offerId kerak' }, { status: 400 })
      }
      const ok = adminDeleteOffer(offerId)
      return NextResponse.json({ success: ok })
    }

    if (action === 'adjustCoins') {
      const { userId, delta } = body
      if (!userId || delta === undefined) {
        return NextResponse.json({ error: 'userId va delta kerak' }, { status: 400 })
      }
      const newCoins = adminAdjustUserCoins(userId, delta)
      return NextResponse.json({ success: true, coins: newCoins })
    }

    if (action === 'updateReport') {
      const { reportId, status } = body
      if (!reportId || !status) {
        return NextResponse.json({ error: 'reportId va status kerak' }, { status: 400 })
      }
      const ok = updateReportStatus(reportId, status)
      return NextResponse.json({ success: ok })
    }

    return NextResponse.json({ error: 'Noma’lum amal' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
