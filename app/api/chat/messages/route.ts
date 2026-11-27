import { NextRequest, NextResponse } from 'next/server'
import { saveChatMessage } from '@/lib/db'
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers'
import { broadcastToConversation } from '@/lib/chat-bus'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Xabar yuborish uchun avval tizimga kiring')
    if (auth.error) return auth.error

    // Spam protection: max 1 message per 1.5s per user
    const rl = checkRateLimit(`chat-msg:${auth.user.id}`, 1, 1500)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Juda tez xabar yuboryapsiz. 1.5 soniya kuting' },
        { status: 429 }
      )
    }

    const parsed = await parseJsonBody<{ conversationId?: unknown; text?: unknown }>(request)
    if (parsed.error) return parsed.error

    const { conversationId, text } = parsed.data
    if (typeof conversationId !== 'string' || !conversationId.trim()) {
      return NextResponse.json({ error: 'conversationId majburiy' }, { status: 400 })
    }
    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Xabar matni majburiy' }, { status: 400 })
    }

    const result = saveChatMessage({
      conversationId: conversationId.trim(),
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
      text,
    })

    if (!result.success || !result.message) {
      return NextResponse.json(
        { error: result.error || 'Xabar yuborilmadi' },
        { status: result.status || 400 }
      )
    }

    broadcastToConversation(conversationId.trim(), result.participants || [], {
      type: 'new_message',
      conversationId: conversationId.trim(),
      message: result.message,
    })

    return NextResponse.json({ success: true, message: result.message }, { status: 201 })
  } catch (error) {
    console.error('Chat messages POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
