import type { ChatMessageItem } from '@/components/swaply/types'

export type ChatBusEvent =
  | { type: 'connected'; userId: number; onlineCount: number; onlineUserIds: number[] }
  | { type: 'online_count'; onlineCount: number; onlineUserIds: number[] }
  | { type: 'new_message'; conversationId: string; message: ChatMessageItem }
  | {
      type: 'typing'
      conversationId: string
      userId: number
      username: string
      name: string
      isTyping: boolean
    }
  | { type: 'read_receipt'; conversationId: string; userId: number }

type ClientEntry = {
  id: string
  userId: number
  send: (event: ChatBusEvent) => void
}

type ChatBusState = {
  clients: Map<string, ClientEntry>
  userConnections: Map<number, Set<string>>
}

const globalForBus = globalThis as unknown as {
  __swaplyChatBus?: ChatBusState
}

function getBus(): ChatBusState {
  if (!globalForBus.__swaplyChatBus) {
    globalForBus.__swaplyChatBus = {
      clients: new Map(),
      userConnections: new Map(),
    }
  }
  return globalForBus.__swaplyChatBus
}

export function getOnlineUserIds(): number[] {
  return Array.from(getBus().userConnections.keys())
}

export function getOnlineCount(): number {
  return getBus().userConnections.size
}

export function registerChatClient(
  userId: number,
  send: (event: ChatBusEvent) => void
): () => void {
  const bus = getBus()
  const connId = `conn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  bus.clients.set(connId, { id: connId, userId, send })

  let conns = bus.userConnections.get(userId)
  const wasOffline = !conns || conns.size === 0
  if (!conns) {
    conns = new Set()
    bus.userConnections.set(userId, conns)
  }
  conns.add(connId)

  // Send initial connected state
  send({
    type: 'connected',
    userId,
    onlineCount: bus.userConnections.size,
    onlineUserIds: Array.from(bus.userConnections.keys()),
  })

  if (wasOffline) {
    broadcastAll({
      type: 'online_count',
      onlineCount: bus.userConnections.size,
      onlineUserIds: Array.from(bus.userConnections.keys()),
    })
  }

  return () => {
    const b = getBus()
    b.clients.delete(connId)
    const userSet = b.userConnections.get(userId)
    if (userSet) {
      userSet.delete(connId)
      if (userSet.size === 0) {
        b.userConnections.delete(userId)
        broadcastAll({
          type: 'online_count',
          onlineCount: b.userConnections.size,
          onlineUserIds: Array.from(b.userConnections.keys()),
        })
      }
    }
  }
}

export function broadcastAll(event: ChatBusEvent) {
  const bus = getBus()
  for (const client of bus.clients.values()) {
    try {
      client.send(event)
    } catch {}
  }
}

export function broadcastToConversation(
  conversationId: string,
  participants: number[],
  event: ChatBusEvent
) {
  const bus = getBus()
  if (conversationId === 'community') {
    broadcastAll(event)
    return
  }

  const allowed = new Set(participants)
  for (const client of bus.clients.values()) {
    if (allowed.has(client.userId)) {
      try {
        client.send(event)
      } catch {}
    }
  }
}
