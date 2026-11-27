'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ChatConversationSummary, ChatMessageItem } from './types'

type TypingPerson = {
  userId: number
  name: string
  username: string
}

type MessageListener = (conversationId: string, message: ChatMessageItem) => void

type SocketContextValue = {
  isConnected: boolean
  onlineCount: number
  onlineUserIds: number[]
  totalUnread: number
  community: ChatConversationSummary | null
  conversations: ChatConversationSummary[]
  typingByConv: Record<string, TypingPerson[]>
  refreshConversations: () => Promise<void>
  sendMessage: (
    conversationId: string,
    text: string
  ) => Promise<{ ok: boolean; message?: ChatMessageItem; error?: string }>
  emitTyping: (conversationId: string) => void
  emitStopTyping: (conversationId: string) => void
  markRead: (conversationId: string) => Promise<void>
  subscribeMessages: (listener: MessageListener) => () => void
  connect: () => void
  disconnect: () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [community, setCommunity] = useState<ChatConversationSummary | null>(null)
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [typingByConv, setTypingByConv] = useState<Record<string, TypingPerson[]>>({})

  const abortRef = useRef<AbortController | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const listenersRef = useRef<Set<MessageListener>>(new Set())
  const activeUserIdRef = useRef<number | null>(null)
  const typingThrottleRef = useRef<Record<string, number>>({})

  const refreshConversations = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('swaply_token') : null
    if (!token) {
      setCommunity(null)
      setConversations([])
      setTotalUnread(0)
      return
    }
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.community) setCommunity(data.community)
      if (Array.isArray(data.conversations)) setConversations(data.conversations)
      if (typeof data.totalUnread === 'number') setTotalUnread(data.totalUnread)
      if (typeof data.onlineCount === 'number') setOnlineCount(data.onlineCount)
      if (Array.isArray(data.onlineUserIds)) setOnlineUserIds(data.onlineUserIds)
    } catch {}
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    activeUserIdRef.current = null
    setIsConnected(false)
    setTypingByConv({})
  }, [])

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      disconnect()
      return
    }

    if (abortRef.current) return

    const controller = new AbortController()
    abortRef.current = controller

    refreshConversations()

    ;(async () => {
      try {
        const res = await fetch('/api/chat/stream', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          throw new Error(`Stream status ${res.status}`)
        }

        setIsConnected(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''

          for (const part of parts) {
            const line = part
              .split('\n')
              .find((l) => l.startsWith('data:'))
            if (!line) continue

            try {
              const evt = JSON.parse(line.slice(5).trim())
              if (evt.type === 'connected') {
                activeUserIdRef.current = evt.userId
                setOnlineCount(evt.onlineCount || 0)
                if (Array.isArray(evt.onlineUserIds)) setOnlineUserIds(evt.onlineUserIds)
              } else if (evt.type === 'online_count') {
                setOnlineCount(evt.onlineCount || 0)
                if (Array.isArray(evt.onlineUserIds)) setOnlineUserIds(evt.onlineUserIds)
              } else if (evt.type === 'new_message' && evt.message) {
                for (const listener of listenersRef.current) {
                  listener(evt.conversationId, evt.message)
                }
                refreshConversations()
              } else if (evt.type === 'typing') {
                if (evt.userId === activeUserIdRef.current) continue
                setTypingByConv((prev) => {
                  const list = prev[evt.conversationId] || []
                  const filtered = list.filter((p) => p.userId !== evt.userId)
                  if (evt.isTyping) {
                    return {
                      ...prev,
                      [evt.conversationId]: [
                        ...filtered,
                        { userId: evt.userId, name: evt.name, username: evt.username },
                      ],
                    }
                  }
                  return {
                    ...prev,
                    [evt.conversationId]: filtered,
                  }
                })
              } else if (evt.type === 'read_receipt') {
                refreshConversations()
              }
            } catch {}
          }
        }
      } catch {
        // Reconnect cleanly unless aborted
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
        setIsConnected(false)
        if (!controller.signal.aborted && localStorage.getItem('swaply_token')) {
          reconnectTimerRef.current = window.setTimeout(() => {
            connect()
          }, 3000)
        }
      }
    })()
  }, [disconnect, refreshConversations])

  useEffect(() => {
    if (localStorage.getItem('swaply_token')) {
      connect()
    }

    function onAuthChanged() {
      if (localStorage.getItem('swaply_token')) {
        disconnect()
        connect()
      } else {
        disconnect()
        setCommunity(null)
        setConversations([])
        setTotalUnread(0)
      }
    }

    window.addEventListener('swaply-auth-changed', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('swaply-auth-changed', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
      disconnect()
    }
  }, [connect, disconnect])

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const token = localStorage.getItem('swaply_token')
      if (!token) return { ok: false, error: 'Tizimga kiring' }

      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId, text }),
        })
        const data = await res.json()
        if (!res.ok) {
          return { ok: false, error: data.error || 'Xabar yuborilmadi' }
        }
        refreshConversations()
        return { ok: true, message: data.message as ChatMessageItem }
      } catch {
        return { ok: false, error: 'Server bilan bog‘lanib bo‘lmadi' }
      }
    },
    [refreshConversations]
  )

  const emitTyping = useCallback((conversationId: string) => {
    const now = Date.now()
    if (now - (typingThrottleRef.current[conversationId] || 0) < 1200) return
    typingThrottleRef.current[conversationId] = now
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, isTyping: true }),
    }).catch(() => {})
  }, [])

  const emitStopTyping = useCallback((conversationId: string) => {
    typingThrottleRef.current[conversationId] = 0
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, isTyping: false }),
    }).catch(() => {})
  }, [])

  const markRead = useCallback(
    async (conversationId: string) => {
      const token = localStorage.getItem('swaply_token')
      if (!token) return
      try {
        await fetch('/api/chat/read', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId }),
        })
        refreshConversations()
      } catch {}
    },
    [refreshConversations]
  )

  const subscribeMessages = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        onlineCount,
        onlineUserIds,
        totalUnread,
        community,
        conversations,
        typingByConv,
        refreshConversations,
        sendMessage,
        emitTyping,
        emitStopTyping,
        markRead,
        subscribeMessages,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return ctx
}
