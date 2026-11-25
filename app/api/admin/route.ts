import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminStats,
  getAdminUsersList,
  getAllReports,
  adminDeleteOffer,
  adminAdjustUserCoins,
  updateReportStatus,
} from '@/lib/db'
import { parseJsonBody, requireAdmin } from '@/lib/api-helpers'

const VALID_REPORT_STATUSES = new Set(['pending', 'reviewed', 'resolved'])

export async function GET(request: NextRequest) {
  try {
    const adminAuth = requireAdmin(request)
    if (adminAuth.error) return adminAuth.error

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
    const adminAuth = requireAdmin(request)
    if (adminAuth.error) return adminAuth.error

    const parsed = await parseJsonBody<{
      action?: unknown
      offerId?: unknown
      userId?: unknown
      delta?: unknown
      reportId?: unknown
      status?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { action } = parsed.data

    if (action === 'deleteOffer') {
      const { offerId } = parsed.data
      if (typeof offerId !== 'string' || !offerId) {
        return NextResponse.json({ error: 'offerId kerak' }, { status: 400 })
      }
      const ok = adminDeleteOffer(offerId)
      if (!ok) {
        return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'adjustCoins') {
      const { userId, delta } = parsed.data
      if (
        typeof userId !== 'number' || !Number.isInteger(userId) ||
        typeof delta !== 'number' || !Number.isInteger(delta) ||
        Math.abs(delta) > 10000
      ) {
        return NextResponse.json({ error: 'userId va delta (butun son) kerak' }, { status: 400 })
      }
      const newCoins = adminAdjustUserCoins(userId, delta)
      if (newCoins === null) {
        return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true, coins: newCoins })
    }

    if (action === 'updateReport') {
      const { reportId, status } = parsed.data
      if (
        typeof reportId !== 'string' || !reportId ||
        typeof status !== 'string' || !VALID_REPORT_STATUSES.has(status)
      ) {
        return NextResponse.json({ error: 'reportId va to‘g‘ri status kerak' }, { status: 400 })
      }
      const ok = updateReportStatus(reportId, status as 'pending' | 'reviewed' | 'resolved')
      if (!ok) {
        return NextResponse.json({ error: 'Shikoyat topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Noma’lum amal' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
