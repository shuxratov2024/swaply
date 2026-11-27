import { NextRequest, NextResponse } from 'next/server'
import { canUserAccessConversation } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { broadcastToConversation } from '@/lib/chat-bus'

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request)
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{ conversationId?: unknown; isTyping?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { conversationId, isTyping } = parsed.data
    if (typeof conversationId !== 'string' || !conversationId.trim()) {
      return NextResponse.json({ error: 'conversationId kerak' }, { status: 400 })
    }

    const access = canUserAccessConversation(auth.user.id, conversationId.trim())
    if (!access.allowed || !access.conversation) {
      return NextResponse.json({ error: access.error || 'Ruxsat yo‘q' }, { status: access.status || 403 })
    }

    broadcastToConversation(conversationId.trim(), access.conversation.participants, {
      type: 'typing',
      conversationId: conversationId.trim(),
      userId: auth.user.id,
      username: auth.user.username,
      name: auth.user.name,
      isTyping: Boolean(isTyping),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Typing POST error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
