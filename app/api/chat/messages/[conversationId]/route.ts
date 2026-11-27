import { NextRequest, NextResponse } from 'next/server'
import {
  canUserAccessConversation,
  getConversationMessages,
  saveChatMessage,
} from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { broadcastToConversation } from '@/lib/chat-bus'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const auth = authenticateRequest(request, 'Xabarlarni o‘qish uchun tizimga kiring')
    if (auth.error) return auth.error

    const { conversationId } = await context.params
    const access = canUserAccessConversation(auth.user.id, conversationId)
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.error || 'Ruxsat yo‘q' },
        { status: access.status || 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '30', 10)
    const before = searchParams.get('before')
    const limit = Number.isNaN(limitParam) ? 30 : limitParam

    const result = getConversationMessages(conversationId, limit, before)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Chat conversation messages GET error:', error)
    return NextResponse.json({ error: 'Xabarlarni yuklashda xatolik' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const auth = authenticateRequest(request, 'Xabar yuborish uchun tizimga kiring')
    if (auth.error) return auth.error

    const rl = checkRateLimit(`chat-msg:${auth.user.id}`, 1, 1500)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Juda tez xabar yuboryapsiz. 1.5 soniya kuting' },
        { status: 429 }
      )
    }

    const { conversationId } = await context.params
    const parsed = await parseJsonBody<{ text?: unknown }>(request)
    if (parsed.error) return parsed.error

    if (typeof parsed.data.text !== 'string') {
      return NextResponse.json({ error: 'Xabar matni majburiy' }, { status: 400 })
    }

    const result = saveChatMessage({
      conversationId,
      sender: {
        id: auth.user.id,
        name: auth.user.name,
        username: auth.user.username,
        avatar: auth.user.avatar,
        role: auth.user.role,
        verified: Boolean(
          auth.user.verified || auth.user.role === 'admin' || auth.user.role === 'supporter'
        ),
      },
      text: parsed.data.text,
    })

    if (!result.success || !result.message) {
      return NextResponse.json(
        { error: result.error || 'Xabar yuborilmadi' },
        { status: result.status || 400 }
      )
    }

    broadcastToConversation(conversationId, result.participants || [], {
      type: 'new_message',
      conversationId,
      message: result.message,
    })

    return NextResponse.json({ success: true, message: result.message }, { status: 201 })
  } catch (error) {
    console.error('Chat conversation messages POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
