import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/api-helpers'
import { registerChatClient, type ChatBusEvent } from '@/lib/chat-bus'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request, 'Real-time chatga ulanish uchun tizimga kiring')
  if (auth.error) return auth.error

  const encoder = new TextEncoder()
  let cleanup: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: ChatBusEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {}
      }

      cleanup = registerChatClient(auth.user.id, sendEvent)

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          if (heartbeat) clearInterval(heartbeat)
        }
      }, 20000)

      request.signal.addEventListener('abort', () => {
        if (heartbeat) clearInterval(heartbeat)
        cleanup?.()
        try {
          controller.close()
        } catch {}
      })
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat)
      cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
