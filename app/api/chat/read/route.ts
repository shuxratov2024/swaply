import { NextRequest, NextResponse } from 'next/server'
import { canUserAccessConversation, markConversationRead } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { broadcastToConversation } from '@/lib/chat-bus'

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request)
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ conversationId?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { conversationId } = parsed.data
    if (typeof conversationId !== 'string' || !conversationId.trim()) {
      return NextResponse.json({ error: 'conversationId kerak' }, { status: 400 })
    }

    const access = canUserAccessConversation(auth.user.id, conversationId.trim())
    if (!access.allowed || !access.conversation) {
      return NextResponse.json({ error: access.error || 'Ruxsat yo‘q' }, { status: access.status || 403 })
    }

    const marked = markConversationRead(auth.user.id, conversationId.trim())
    if (marked > 0) {
      broadcastToConversation(conversationId.trim(), access.conversation.participants, {
        type: 'read_receipt',
        conversationId: conversationId.trim(),
        userId: auth.user.id,
      })
    }

    return NextResponse.json({ success: true, marked })
  } catch (error) {
    console.error('Chat read PATCH error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
