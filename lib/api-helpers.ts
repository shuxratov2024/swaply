import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { findUserById, type User } from '@/lib/db'

export function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    gender: user.gender,
    role: user.role || 'user',
    verified: Boolean(user.verified || user.role === 'admin' || user.role === 'supporter'),
    banned: Boolean(user.banned),
    coins: user.coins,
    phone: user.phone,
    telegram: user.telegram,
    whatsapp: user.whatsapp,
    unlockedOfferIds: user.unlockedOfferIds || [],
    lastClaimDate: user.lastClaimDate,
    createdAt: user.createdAt,
  }
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const data = (await request.json()) as T
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {
        error: NextResponse.json({ error: 'So‘rov ma’lumotlari noto‘g‘ri formatda' }, { status: 400 }),
      }
    }
    return { data }
  } catch {
    return {
      error: NextResponse.json({ error: 'Noto‘g‘ri JSON formati' }, { status: 400 }),
    }
  }
}

export function authenticateRequest(
  request: NextRequest,
  unauthorizedMessage = 'Sessiya muddati tugagan yoki tizimga kirmagansiz'
): { user: User; error?: never } | { user?: never; error: NextResponse } {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: unauthorizedMessage }, { status: 401 }),
    }
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    return {
      error: NextResponse.json({ error: unauthorizedMessage }, { status: 401 }),
    }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Token yaroqsiz yoki muddati tugagan. Qaytadan tizimga kiring' },
        { status: 401 }
      ),
    }
  }

  const user = findUserById(payload.userId)
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 }),
    }
  }

  if (user.banned) {
    return {
      error: NextResponse.json(
        { error: 'Hisobingiz bloklangan. Ma’muriyat bilan bog‘laning' },
        { status: 403 }
      ),
    }
  }

  return { user }
}

export function isAdminUser(user: User): boolean {
  return user.role === 'admin' || user.username === 'amir'
}

export function isStaffUser(user: User): boolean {
  return isAdminUser(user) || user.role === 'supporter'
}

export function requireStaff(
  request: NextRequest
): { user: User; error?: never } | { user?: never; error: NextResponse } {
  const auth = authenticateRequest(request, 'Admin paneliga kirish uchun tizimga kiring')
  if (auth.error) return auth

  if (!isStaffUser(auth.user)) {
    return {
      error: NextResponse.json(
        { error: 'Sizda boshqaruv paneliga kirish huquqi mavjud emas' },
        { status: 403 }
      ),
    }
  }

  return auth
}

export function requireAdmin(
  request: NextRequest
): { user: User; error?: never } | { user?: never; error: NextResponse } {
  const auth = authenticateRequest(request, 'Admin paneliga kirish uchun tizimga kiring')
  if (auth.error) return auth

  if (!isAdminUser(auth.user)) {
    return {
      error: NextResponse.json(
        { error: 'Sizda admin huquqlari mavjud emas' },
        { status: 403 }
      ),
    }
  }

  return auth
}
