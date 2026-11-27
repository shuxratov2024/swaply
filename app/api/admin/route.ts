import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import {
  getAdminStats,
  getAdminUsersList,
  getAllReports,
  getAllTransactions,
  getAllPromoCodes,
  getAdminLogs,
  adminDeleteOffer,
  adminAdjustUserCoins,
  updateReportStatus,
  reviewTopUpTransaction,
  createUserByAdmin,
  updateUserRole,
  toggleUserVerified,
  toggleUserBanned,
  createPromoCode,
  togglePromoCode,
  deletePromoCode,
  getMaskedSmtpSettings,
  saveSmtpSettings,
  type UserRole,
} from '@/lib/db'
import { isAdminUser, parseJsonBody, requireStaff } from '@/lib/api-helpers'
import { sendTestSmtpEmail } from '@/lib/mailer'

const VALID_REPORT_STATUSES = new Set(['pending', 'reviewed', 'resolved'])
const VALID_ROLES = new Set<UserRole>(['admin', 'supporter', 'user'])

export async function GET(request: NextRequest) {
  try {
    const staffAuth = requireStaff(request)
    if (staffAuth.error) return staffAuth.error

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''

    const stats = getAdminStats()
    const users = getAdminUsersList(query)
    const reports = getAllReports()
    const transactions = getAllTransactions()
    const promoCodes = getAllPromoCodes()
    const logs = getAdminLogs()
    const smtp = isAdminUser(staffAuth.user) ? getMaskedSmtpSettings() : undefined

    return NextResponse.json({
      currentRole: isAdminUser(staffAuth.user) ? 'admin' : 'supporter',
      stats,
      users,
      reports,
      transactions,
      promoCodes,
      logs,
      ...(smtp ? { smtp } : {}),
    })
  } catch (error) {
    console.error('Admin GET error:', error)
    return NextResponse.json({ error: 'Admin ma’lumotlarini yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const staffAuth = requireStaff(request)
    if (staffAuth.error) return staffAuth.error

    const actor = {
      id: staffAuth.user.id,
      username: staffAuth.user.username,
      role: (isAdminUser(staffAuth.user) ? 'admin' : 'supporter') as UserRole,
    }
    const actorIsAdmin = isAdminUser(staffAuth.user)

    const parsed = await parseJsonBody<Record<string, unknown>>(request)
    if (parsed.error) return parsed.error

    const { action } = parsed.data

    // Staff + Admin amallari
    if (action === 'deleteOffer') {
      const { offerId } = parsed.data
      if (typeof offerId !== 'string' || !offerId) {
        return NextResponse.json({ error: 'offerId kerak' }, { status: 400 })
      }
      const ok = adminDeleteOffer(offerId, actor)
      if (!ok) {
        return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'updateReport') {
      const { reportId, status } = parsed.data
      if (
        typeof reportId !== 'string' || !reportId ||
        typeof status !== 'string' || !VALID_REPORT_STATUSES.has(status)
      ) {
        return NextResponse.json({ error: 'reportId va to‘g‘ri status kerak' }, { status: 400 })
      }
      const ok = updateReportStatus(reportId, status as 'pending' | 'reviewed' | 'resolved', actor)
      if (!ok) {
        return NextResponse.json({ error: 'Shikoyat topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'toggleVerified') {
      const { userId } = parsed.data
      if (typeof userId !== 'number' || !Number.isInteger(userId)) {
        return NextResponse.json({ error: 'userId kerak' }, { status: 400 })
      }
      const result = toggleUserVerified(userId, actor)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 404 })
      }
      return NextResponse.json({ success: true, verified: result.verified })
    }

    // Faqat Admin amallari
    if (!actorIsAdmin) {
      return NextResponse.json(
        { error: 'Bu amal faqat bosh adminlar uchun ruxsat etilgan' },
        { status: 403 }
      )
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
      const newCoins = adminAdjustUserCoins(userId, delta, actor)
      if (newCoins === null) {
        return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
      }
      return NextResponse.json({ success: true, coins: newCoins })
    }

    if (action === 'reviewTransaction') {
      const { txId, decision } = parsed.data
      if (
        typeof txId !== 'string' || !txId ||
        (decision !== 'completed' && decision !== 'rejected')
      ) {
        return NextResponse.json({ error: 'txId va qaror (completed/rejected) kerak' }, { status: 400 })
      }
      const result = reviewTopUpTransaction(txId, decision, actor)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, transaction: result.transaction, coins: result.coins })
    }

    if (action === 'createUser') {
      const { name, username, email, password, role, gender, coins } = parsed.data
      if (
        typeof name !== 'string' || name.trim().length < 2 ||
        typeof username !== 'string' || username.trim().length < 3 ||
        typeof email !== 'string' || !email.includes('@') ||
        typeof password !== 'string' || password.length < 6
      ) {
        return NextResponse.json(
          { error: 'Ism, username (min 3), email va parol (min 6) to‘g‘ri kiritilishi shart' },
          { status: 400 }
        )
      }
      const validRole: UserRole =
        typeof role === 'string' && VALID_ROLES.has(role as UserRole) ? (role as UserRole) : 'user'
      const validGender = gender === 'male' || gender === 'female' ? gender : 'other'
      const passwordHash = await bcrypt.hash(password, 10)

      const result = createUserByAdmin(
        {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          passwordHash,
          role: validRole,
          gender: validGender,
          coins: typeof coins === 'number' ? coins : 5,
        },
        actor
      )
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 409 })
      }
      return NextResponse.json({ success: true, userId: result.user?.id }, { status: 201 })
    }

    if (action === 'updateRole') {
      const { userId, role } = parsed.data
      if (
        typeof userId !== 'number' || !Number.isInteger(userId) ||
        typeof role !== 'string' || !VALID_ROLES.has(role as UserRole)
      ) {
        return NextResponse.json({ error: 'userId va to‘g‘ri rol kerak' }, { status: 400 })
      }
      const result = updateUserRole(userId, role as UserRole, actor)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'toggleBanned') {
      const { userId } = parsed.data
      if (typeof userId !== 'number' || !Number.isInteger(userId)) {
        return NextResponse.json({ error: 'userId kerak' }, { status: 400 })
      }
      const result = toggleUserBanned(userId, actor)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, banned: result.banned })
    }

    if (action === 'createPromo') {
      const { code, bonusCoins, bonusPercent, maxUses, description } = parsed.data
      if (typeof code !== 'string' || code.trim().length < 3) {
        return NextResponse.json({ error: 'Promo-kod kamida 3 ta belgi bo‘lishi kerak' }, { status: 400 })
      }
      const result = createPromoCode(
        {
          code,
          bonusCoins: typeof bonusCoins === 'number' ? bonusCoins : 0,
          bonusPercent: typeof bonusPercent === 'number' ? bonusPercent : 0,
          maxUses: typeof maxUses === 'number' ? maxUses : 100,
          description: typeof description === 'string' ? description : '',
        },
        actor
      )
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, promo: result.promo }, { status: 201 })
    }

    if (action === 'togglePromo') {
      const { code } = parsed.data
      if (typeof code !== 'string' || !code) {
        return NextResponse.json({ error: 'code kerak' }, { status: 400 })
      }
      const promo = togglePromoCode(code, actor)
      if (!promo) return NextResponse.json({ error: 'Promo-kod topilmadi' }, { status: 404 })
      return NextResponse.json({ success: true, promo })
    }

    if (action === 'deletePromo') {
      const { code } = parsed.data
      if (typeof code !== 'string' || !code) {
        return NextResponse.json({ error: 'code kerak' }, { status: 400 })
      }
      const ok = deletePromoCode(code, actor)
      if (!ok) return NextResponse.json({ error: 'Promo-kod topilmadi' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'saveSmtp') {
      const { host, port, secure, user, pass, from, enabled } = parsed.data
      if (typeof host !== 'string' || typeof user !== 'string') {
        return NextResponse.json({ error: 'SMTP Host va Email majburiy' }, { status: 400 })
      }
      const result = saveSmtpSettings(
        {
          host,
          port: typeof port === 'number' ? port : Number(port) || 465,
          secure: Boolean(secure),
          user,
          pass: typeof pass === 'string' ? pass : undefined,
          from: typeof from === 'string' ? from : user,
          enabled: Boolean(enabled),
        },
        actor
      )
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, smtp: getMaskedSmtpSettings() })
    }

    if (action === 'testSmtp') {
      const { testEmail } = parsed.data
      const targetEmail =
        typeof testEmail === 'string' && testEmail.includes('@')
          ? testEmail.trim()
          : staffAuth.user.email
      const result = await sendTestSmtpEmail(targetEmail)
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error || 'Test xabar yuborib bo‘lmadi' },
          { status: 502 }
        )
      }
      return NextResponse.json({
        success: true,
        message: `Test xabar ${targetEmail} manziliga yuborildi!`,
      })
    }

    return NextResponse.json({ error: 'Noma’lum amal' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
