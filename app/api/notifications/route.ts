import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications, markNotificationsRead } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Bildirishnomalarni ko‘rish uchun tizimga kiring')
    if (auth.error) return auth.error

    const data = getUserNotifications(auth.user.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Bildirishnomalarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ notificationId?: unknown }>(request).catch(() => ({
      data: {} as { notificationId?: unknown },
      error: undefined,
    }))
    const notificationId =
      parsed.data && typeof parsed.data.notificationId === 'string'
        ? parsed.data.notificationId
        : undefined

    const updated = markNotificationsRead(auth.user.id, notificationId)
    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
