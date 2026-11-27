import { NextRequest, NextResponse } from 'next/server'
import {
  findUserByUsername,
  getOrCreatePrivateConversation,
  getUserConversationsSummary,
} from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { getOnlineCount, getOnlineUserIds } from '@/lib/chat-bus'

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Chatlarni ko‘rish uchun avval tizimga kiring')
    if (auth.error) return auth.error

    const summary = getUserConversationsSummary(auth.user.id)
    return NextResponse.json({
      ...summary,
      onlineCount: getOnlineCount(),
      onlineUserIds: getOnlineUserIds(),
    })
  } catch (error) {
    console.error('Chat conversations GET error:', error)
    return NextResponse.json({ error: 'Chatlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Shaxsiy chat ochish uchun avval tizimga kiring')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ targetUserId?: unknown; targetUsername?: unknown }>(request)
    if (parsed.error) return parsed.error

    let resolvedTargetId: number | undefined =
      typeof parsed.data.targetUserId === 'number' && Number.isInteger(parsed.data.targetUserId)
        ? parsed.data.targetUserId
        : undefined

    if (!resolvedTargetId && typeof parsed.data.targetUsername === 'string' && parsed.data.targetUsername.trim()) {
      const found = findUserByUsername(parsed.data.targetUsername)
      if (found) resolvedTargetId = found.id
    }

    if (!resolvedTargetId) {
      return NextResponse.json(
        { error: 'Suhbatdosh foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    const result = getOrCreatePrivateConversation(auth.user.id, resolvedTargetId)
    if (!result.success || !result.conversation) {
      return NextResponse.json(
        { error: result.error || 'Chat ochib bo‘lmadi' },
        { status: result.status || 400 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: result.conversation.id,
        type: result.conversation.type,
        title: result.targetUser?.name || 'Foydalanuvchi',
        subtitle: result.targetUser ? `@${result.targetUser.username}` : '',
        avatar: result.targetUser?.avatar || '',
        targetUserId: result.targetUser?.id,
        targetUsername: result.targetUser?.username,
        targetRole: result.targetUser?.role || 'user',
        targetVerified: Boolean(
          result.targetUser?.verified ||
            result.targetUser?.role === 'admin' ||
            result.targetUser?.role === 'supporter'
        ),
        lastMessage: result.conversation.lastMessage || '',
        lastMessageAt: result.conversation.lastMessageAt,
        unreadCount: 0,
      },
    })
  } catch (error) {
    console.error('Chat conversations POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
