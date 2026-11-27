'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Check,
  CheckCheck,
  Globe2,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { useSocket } from './socket-context'
import { AuthModal, type AuthUser } from './swaply-modals'
import type {
  AssistantMessageItem,
  ChatMessageItem,
  Locale,
} from './types'

const CHAT_TEXT: Record<
  Locale,
  {
    backHome: string
    title: string
    searchChats: string
    pinnedBot: string
    botSubtitle: string
    communityTitle: string
    communitySubtitle: string
    privateHeading: string
    noPrivateChats: string
    noPrivateHint: string
    onlineLabel: string
    loadOlder: string
    typingSuffix: string
    inputPlaceholder: string
    botPlaceholder: string
    clearHistory: string
    loginTitle: string
    loginDesc: string
    loginBtn: string
    backList: string
    connected: string
    reconnecting: string
  }
> = {
  UZ: {
    backHome: 'Bosh sahifa',
    title: 'Swaply Chat',
    searchChats: 'Suhbat qidirish...',
    pinnedBot: 'Swaply Yordamchi',
    botSubtitle: 'AI & Tezkor yordam',
    communityTitle: 'Community',
    communitySubtitle: 'Swaply hamjamiyat xonasi',
    privateHeading: 'Shaxsiy suhbatlar (1-on-1)',
    noPrivateChats: 'Hozircha shaxsiy chatlar yo‘q',
    noPrivateHint: 'Taklif kartasida kontaktni ochib "Chatni boshlash" tugmasini bosing.',
    onlineLabel: 'onlayn',
    loadOlder: 'Oldingi xabarlarni yuklash',
    typingSuffix: 'yozmoqda...',
    inputPlaceholder: 'Xabar yozing (maks. 1000 belgi)...',
    botPlaceholder: 'Swaply haqida savol bering...',
    clearHistory: 'Tarixni tozalash',
    loginTitle: 'Chatdan foydalanish uchun tizimga kiring',
    loginDesc: 'AI Yordamchi, Community va Shaxsiy 1-on-1 suhbatlar faqat ro‘yxatdan o‘tgan a‘zolar uchun ochiq.',
    loginBtn: 'Kirish / Ro‘yxatdan o‘tish',
    backList: 'Suhbatlar',
    connected: 'Jonli ulangan',
    reconnecting: 'Qayta ulanmoqda...',
  },
  RU: {
    backHome: 'Главная',
    title: 'Swaply Чат',
    searchChats: 'Поиск чата...',
    pinnedBot: 'Swaply Помощник',
    botSubtitle: 'AI и быстрые ответы',
    communityTitle: 'Community',
    communitySubtitle: 'Общая комната сообщества',
    privateHeading: 'Личные чаты (1-на-1)',
    noPrivateChats: 'Пока нет личных чатов',
    noPrivateHint: 'Откройте контакт на карточке и нажмите «Начать чат».',
    onlineLabel: 'онлайн',
    loadOlder: 'Загрузить старые сообщения',
    typingSuffix: 'печатает...',
    inputPlaceholder: 'Напишите сообщение (макс. 1000 символов)...',
    botPlaceholder: 'Задайте вопрос о Swaply...',
    clearHistory: 'Очистить историю',
    loginTitle: 'Войдите для доступа к чату',
    loginDesc: 'AI Помощник, Community и личные диалоги доступны авторизованным участникам.',
    loginBtn: 'Войти / Регистрация',
    backList: 'Чаты',
    connected: 'В сети (Live)',
    reconnecting: 'Переподключение...',
  },
  EN: {
    backHome: 'Home',
    title: 'Swaply Chat',
    searchChats: 'Search chats...',
    pinnedBot: 'Swaply Assistant',
    botSubtitle: 'AI & Instant help',
    communityTitle: 'Community',
    communitySubtitle: 'Public community room',
    privateHeading: 'Direct Messages (1-on-1)',
    noPrivateChats: 'No private chats yet',
    noPrivateHint: 'Unlock a contact on any offer and click "Start Chat".',
    onlineLabel: 'online',
    loadOlder: 'Load older messages',
    typingSuffix: 'is typing...',
    inputPlaceholder: 'Write a message (max 1000 chars)...',
    botPlaceholder: 'Ask anything about Swaply...',
    clearHistory: 'Clear history',
    loginTitle: 'Sign in to access Swaply Chat',
    loginDesc: 'AI Assistant, Community Chat, and 1-on-1 Direct Chats are available for signed-in members.',
    loginBtn: 'Sign in / Register',
    backList: 'Chats',
    connected: 'Live connected',
    reconnecting: 'Reconnecting...',
  },
}

const ASSISTANT_ID = '__assistant__'

export function ChatWorkspace() {
  const searchParams = useSearchParams()
  const initialConvParam = searchParams.get('conversationId')

  const [locale, setLocale] = useState<Locale>('UZ')
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const [activeId, setActiveId] = useState<string>(initialConvParam || 'community')
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(initialConvParam))
  const [sidebarSearch, setSidebarSearch] = useState('')

  // Room messages state
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)

  // AI Assistant state
  const [botMessages, setBotMessages] = useState<AssistantMessageItem[]>([])
  const [quickReplies, setQuickReplies] = useState<Array<{ id: string; label: string }>>([])
  const [botGreeting, setBotGreeting] = useState('')
  const [botLoading, setBotLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stopTypingTimerRef = useRef<number | null>(null)
  const t = CHAT_TEXT[locale]

  const {
    isConnected,
    onlineCount,
    onlineUserIds,
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
  } = useSocket()

  // Load saved user & locale
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('swaply_locale')
      if (savedLocale === 'UZ' || savedLocale === 'RU' || savedLocale === 'EN') {
        setLocale(savedLocale)
      }
      const savedUser = localStorage.getItem('swaply_user')
      const savedToken = localStorage.getItem('swaply_token')
      if (savedUser && savedToken) {
        setAuthUser(JSON.parse(savedUser))
      }
    } catch {}
    setAuthChecked(true)
  }, [])

  useEffect(() => {
    if (initialConvParam) {
      setActiveId(initialConvParam)
      setMobileShowChat(true)
    }
  }, [initialConvParam])

  const loadAssistant = useCallback(async () => {
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    try {
      const res = await fetch(`/api/chat/assistant?locale=${locale}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.messages)) setBotMessages(data.messages)
      if (Array.isArray(data.quickReplies)) setQuickReplies(data.quickReplies)
      if (data.greeting) setBotGreeting(data.greeting)
    } catch {}
  }, [locale])

  const loadMessages = useCallback(
    async (convId: string, before?: string | null) => {
      const token = localStorage.getItem('swaply_token')
      if (!token || convId === ASSISTANT_ID) return

      if (before) setLoadingOlder(true)
      else setLoadingMsgs(true)

      try {
        const qs = new URLSearchParams({ limit: '30' })
        if (before) qs.set('before', before)
        const res = await fetch(`/api/chat/messages/${encodeURIComponent(convId)}?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setSendError(data.error || 'Suhbatga kirib bo‘lmadi')
          return
        }
        const data = await res.json()
        const fetched = Array.isArray(data.messages) ? data.messages : []
        if (before) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id))
            const older = fetched.filter((m: ChatMessageItem) => !seen.has(m.id))
            return [...older, ...prev]
          })
        } else {
          setMessages(fetched)
          markRead(convId)
          window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 40)
        }
        setHasMore(Boolean(data.hasMore))
        setNextCursor(data.nextCursor || null)
      } catch {
        setSendError('Xabarlarni yuklashda xatolik')
      } finally {
        setLoadingMsgs(false)
        setLoadingOlder(false)
      }
    },
    [markRead]
  )

  useEffect(() => {
    if (!authUser) return
    refreshConversations()
    loadAssistant()
  }, [authUser, refreshConversations, loadAssistant])

  useEffect(() => {
    if (!authUser) return
    setSendError('')
    if (activeId === ASSISTANT_ID) {
      loadAssistant()
    } else {
      loadMessages(activeId, null)
    }
  }, [activeId, authUser, loadAssistant, loadMessages])

  // Real-time message subscription
  useEffect(() => {
    const unsubscribe = subscribeMessages((convId, msg) => {
      if (convId === activeId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        markRead(convId)
        window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30)
      }
    })
    return unsubscribe
  }, [activeId, markRead, subscribeMessages])

  const filteredPrivateChats = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
    )
  }, [conversations, sidebarSearch])

  const activeConversation = useMemo(() => {
    if (activeId === ASSISTANT_ID) {
      return {
        id: ASSISTANT_ID,
        title: t.pinnedBot,
        subtitle: t.botSubtitle,
        type: 'assistant' as const,
      }
    }
    if (activeId === 'community') {
      return {
        id: 'community',
        title: t.communityTitle,
        subtitle: `${onlineCount} ${t.onlineLabel}`,
        type: 'community' as const,
      }
    }
    const found = conversations.find((c) => c.id === activeId)
    return {
      id: activeId,
      title: found?.title || 'Shaxsiy Chat',
      subtitle: found?.subtitle || '',
      avatar: found?.avatar,
      targetUserId: found?.targetUserId,
      targetRole: found?.targetRole,
      targetVerified: found?.targetVerified,
      type: 'private' as const,
    }
  }, [activeId, conversations, onlineCount, t])

  const activeTyping = typingByConv[activeId] || []

  async function handleSendAssistant(textToSend: string) {
    const clean = textToSend.trim()
    if (!clean || botLoading) return
    const token = localStorage.getItem('swaply_token')
    if (!token) return

    setBotLoading(true)
    setSendError('')
    try {
      const res = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: clean, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSendError(data.error || 'Yordamchi javob bera olmadi')
        return
      }
      setBotMessages((prev) => [...prev, data.userMessage, data.assistantMessage])
      setDraft('')
      window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 40)
    } catch {
      setSendError('Server bilan bog‘lanishda xatolik')
    } finally {
      setBotLoading(false)
    }
  }

  async function handleClearAssistant() {
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    try {
      const res = await fetch('/api/chat/assistant', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setBotMessages([])
    } catch {}
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSendError('')
    const trimmed = draft.trim()
    if (!trimmed) return

    if (activeId === ASSISTANT_ID) {
      await handleSendAssistant(trimmed)
      return
    }

    if (sending) return
    setSending(true)
    emitStopTyping(activeId)

    const res = await sendMessage(activeId, trimmed)
    setSending(false)

    if (!res.ok) {
      setSendError(res.error || 'Xabar yuborilmadi')
      return
    }

    setDraft('')
    if (res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev
        return [...prev, res.message!]
      })
      window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30)
    }
  }

  function handleDraftChange(val: string) {
    setDraft(val)
    if (activeId !== ASSISTANT_ID && val.trim()) {
      emitTyping(activeId)
      if (stopTypingTimerRef.current) window.clearTimeout(stopTypingTimerRef.current)
      stopTypingTimerRef.current = window.setTimeout(() => emitStopTyping(activeId), 1800)
    }
  }

  if (!authChecked) {
    return (
      <div className="chat-page-shell">
        <div className="chat-loading-center">
          <Loader2 className="spin-icon" size={26} />
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="chat-page-shell">
        <div className="chat-guest-card surface-card">
          <div className="chat-guest-icon">
            <MessageSquare size={28} />
          </div>
          <h1>{t.loginTitle}</h1>
          <p>{t.loginDesc}</p>
          <div className="chat-guest-actions">
            <button
              className="button button-primary"
              onClick={() => setShowAuthModal(true)}
              type="button"
            >
              {t.loginBtn}
            </button>
            <Link className="button button-cream" href="/">
              <ArrowLeft size={14} /> {t.backHome}
            </Link>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onDone={(user) => {
              setAuthUser(user)
              setShowAuthModal(false)
              window.dispatchEvent(new Event('swaply-auth-changed'))
              connect()
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="chat-page-shell">
      <div className={`chat-app-container surface-card ${mobileShowChat ? 'show-chat-pane' : ''}`}>
        {/* LEFT SIDEBAR: 3-in-1 CHATS */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <Link className="chat-back-home-btn" href="/" title={t.backHome}>
              <ArrowLeft size={15} />
              <span>{t.backHome}</span>
            </Link>
            <div className="language-switcher" role="group">
              <Globe2 size={13} />
              {(['UZ', 'RU', 'EN'] as Locale[]).map((loc) => (
                <button
                  className={locale === loc ? 'language-active' : ''}
                  key={loc}
                  onClick={() => {
                    setLocale(loc)
                    localStorage.setItem('swaply_locale', loc)
                  }}
                  type="button"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-sidebar-title-row">
            <h1>
              <MessageSquare size={18} /> {t.title}
            </h1>
            <span className={`chat-conn-pill ${isConnected ? 'on' : 'off'}`}>
              <i /> {isConnected ? t.connected : t.reconnecting}
            </span>
          </div>

          <div className="chat-sidebar-search">
            <Search size={14} />
            <input
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder={t.searchChats}
              type="text"
              value={sidebarSearch}
            />
          </div>

          <div className="chat-sidebar-list">
            {/* 1. Pinned AI Assistant */}
            <button
              className={`chat-list-item is-bot ${activeId === ASSISTANT_ID ? 'active' : ''}`}
              onClick={() => {
                setActiveId(ASSISTANT_ID)
                setMobileShowChat(true)
              }}
              type="button"
            >
              <span className="chat-item-avatar bot-avatar">
                <Bot size={18} />
              </span>
              <div className="chat-item-meta">
                <div className="chat-item-top">
                  <strong>{t.pinnedBot}</strong>
                  <span className="chat-pin-badge">AI</span>
                </div>
                <small>{t.botSubtitle}</small>
              </div>
            </button>

            {/* 2. Global Community Chat */}
            <button
              className={`chat-list-item ${activeId === 'community' ? 'active' : ''}`}
              onClick={() => {
                setActiveId('community')
                setMobileShowChat(true)
              }}
              type="button"
            >
              <span className="chat-item-avatar community-avatar">
                <Users size={18} />
              </span>
              <div className="chat-item-meta">
                <div className="chat-item-top">
                  <strong>{t.communityTitle}</strong>
                  {(community?.unreadCount ?? 0) > 0 && (
                    <span className="chat-unread-badge">{community?.unreadCount}</span>
                  )}
                </div>
                <small>
                  {onlineCount} {t.onlineLabel} • {community?.lastMessage || t.communitySubtitle}
                </small>
              </div>
            </button>

            {/* 3. Private 1-on-1 Chats */}
            <div className="chat-section-label">{t.privateHeading}</div>

            {filteredPrivateChats.length === 0 ? (
              <div className="chat-empty-private">
                <strong>{t.noPrivateChats}</strong>
                <span>{t.noPrivateHint}</span>
              </div>
            ) : (
              filteredPrivateChats.map((conv) => {
                const isTargetOnline =
                  conv.targetUserId !== undefined && onlineUserIds.includes(conv.targetUserId)
                return (
                  <button
                    className={`chat-list-item ${activeId === conv.id ? 'active' : ''}`}
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id)
                      setMobileShowChat(true)
                    }}
                    type="button"
                  >
                    <div className="chat-item-avatar-wrap">
                      <img
                        alt=""
                        className="chat-item-avatar-img"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-user.jpg'
                        }}
                        src={conv.avatar || '/placeholder-user.jpg'}
                      />
                      {isTargetOnline && <span className="chat-online-dot" />}
                    </div>
                    <div className="chat-item-meta">
                      <div className="chat-item-top">
                        <strong className="chat-name-with-badge">
                          <span>{conv.title}</span>
                          {conv.targetVerified && (
                            <BadgeCheck
                              aria-label="Tasdiqlangan"
                              className={`chat-verified-icon ${conv.targetRole === 'admin' || conv.targetRole === 'supporter' ? 'is-official' : ''}`}
                              size={13}
                            />
                          )}
                        </strong>
                        {conv.unreadCount > 0 && (
                          <span className="chat-unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      <small>{conv.lastMessage || conv.subtitle}</small>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* RIGHT ACTIVE CHAT PANEL */}
        <section className="chat-main-pane">
          <header className="chat-main-header">
            <button
              className="chat-mobile-back"
              onClick={() => setMobileShowChat(false)}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>{t.backList}</span>
            </button>

            <div className="chat-main-header-info">
              <h2 className="chat-name-with-badge">
                <span>{activeConversation.title}</span>
                {activeConversation.type === 'private' && activeConversation.targetVerified && (
                  <BadgeCheck
                    aria-label="Tasdiqlangan"
                    className={`chat-verified-icon ${
                      activeConversation.targetRole === 'admin' ||
                      activeConversation.targetRole === 'supporter'
                        ? 'is-official'
                        : ''
                    }`}
                    size={15}
                  />
                )}
                {activeConversation.type === 'private' &&
                  activeConversation.targetRole === 'supporter' && (
                    <span className="chat-role-badge is-support">Swaply Support</span>
                  )}
                {activeConversation.type === 'private' &&
                  activeConversation.targetRole === 'admin' && (
                    <span className="chat-role-badge is-admin">Admin</span>
                  )}
              </h2>
              <span>
                {activeTyping.length > 0
                  ? `${activeTyping.map((p) => p.name).join(', ')} ${t.typingSuffix}`
                  : activeConversation.type === 'private' &&
                      activeConversation.targetUserId !== undefined &&
                      onlineUserIds.includes(activeConversation.targetUserId)
                    ? `${activeConversation.subtitle} • ${t.onlineLabel}`
                    : activeConversation.subtitle}
              </span>
            </div>

            {activeId === ASSISTANT_ID && botMessages.length > 0 && (
              <button
                className="chat-clear-bot-btn"
                onClick={handleClearAssistant}
                title={t.clearHistory}
                type="button"
              >
                <Trash2 size={14} />
                <span>{t.clearHistory}</span>
              </button>
            )}
          </header>

          {sendError && <div className="chat-error-banner">{sendError}</div>}

          <div className="chat-messages-scroll">
            {activeId === ASSISTANT_ID ? (
              <div className="chat-messages-inner">
                <div className="chat-bubble-row is-incoming">
                  <div className="chat-msg-avatar bot-avatar">
                    <Bot size={15} />
                  </div>
                  <div className="chat-bubble is-bot">
                    <div className="chat-bubble-sender">{t.pinnedBot}</div>
                    <p>{botGreeting || 'Salom! Men Swaply Yordamchisiman.'}</p>
                  </div>
                </div>

                {botMessages.map((bm) => (
                  <div
                    className={`chat-bubble-row ${bm.role === 'user' ? 'is-outgoing' : 'is-incoming'}`}
                    key={bm.id}
                  >
                    {bm.role === 'assistant' && (
                      <div className="chat-msg-avatar bot-avatar">
                        <Bot size={15} />
                      </div>
                    )}
                    <div className={`chat-bubble ${bm.role === 'user' ? 'is-mine' : 'is-bot'}`}>
                      <p style={{ whiteSpace: 'pre-line' }}>{bm.text}</p>
                      <span className="chat-bubble-time">
                        {new Date(bm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {botLoading && (
                  <div className="chat-bubble-row is-incoming">
                    <div className="chat-msg-avatar bot-avatar">
                      <Bot size={15} />
                    </div>
                    <div className="chat-bubble is-bot">
                      <Loader2 className="spin-icon" size={14} />
                    </div>
                  </div>
                )}

                <div className="bot-quick-replies">
                  {quickReplies.map((qr) => (
                    <button
                      className="bot-quick-chip"
                      disabled={botLoading}
                      key={qr.id}
                      onClick={() => handleSendAssistant(qr.label)}
                      type="button"
                    >
                      <Sparkles size={12} /> {qr.label}
                    </button>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
            ) : loadingMsgs ? (
              <div className="chat-loading-center">
                <Loader2 className="spin-icon" size={24} />
              </div>
            ) : (
              <div className="chat-messages-inner">
                {hasMore && (
                  <button
                    className="chat-load-older-btn"
                    disabled={loadingOlder}
                    onClick={() => loadMessages(activeId, nextCursor)}
                    type="button"
                  >
                    {loadingOlder ? <Loader2 className="spin-icon" size={13} /> : t.loadOlder}
                  </button>
                )}

                {messages.length === 0 ? (
                  <div className="chat-empty-room">
                    <MessageSquare size={28} />
                    <p>Hali xabarlar yo‘q. Suhbatni birinchi bo‘lib boshlang!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === authUser.id
                    const isAdmin = msg.senderRole === 'admin'
                    const isSupporter = msg.senderRole === 'supporter'
                    const isOfficial = isAdmin || isSupporter
                    const isVerified = Boolean(msg.senderVerified || isOfficial)
                    const roleLabel = isSupporter ? 'Swaply Support' : isAdmin ? 'Admin' : null
                    return (
                      <div
                        className={`chat-bubble-row ${isMine ? 'is-outgoing' : 'is-incoming'}`}
                        key={msg.id}
                      >
                        {!isMine && (
                          <img
                            alt=""
                            className="chat-msg-avatar-img"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-user.jpg'
                            }}
                            src={msg.senderAvatar || '/placeholder-user.jpg'}
                          />
                        )}
                        <div className={`chat-bubble ${isMine ? 'is-mine' : ''}`}>
                          {(!isMine || (activeId === 'community' && isVerified)) && (
                            <div className={`chat-bubble-sender ${isMine ? 'is-mine-header' : ''}`}>
                              <span className="chat-sender-name">{msg.senderName}</span>
                              {isVerified && (
                                <BadgeCheck
                                  aria-label="Tasdiqlangan"
                                  className={`chat-verified-icon ${isOfficial ? 'is-official' : ''}`}
                                  size={13}
                                />
                              )}
                              {roleLabel && (
                                <span
                                  className={`chat-role-badge ${
                                    isSupporter ? 'is-support' : 'is-admin'
                                  }`}
                                >
                                  {roleLabel}
                                </span>
                              )}
                              <small>@{msg.senderUsername}</small>
                            </div>
                          )}
                          <p>{msg.text}</p>
                          <div className="chat-bubble-foot">
                            <span className="chat-bubble-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMine && (
                              <span className="chat-read-tick">
                                {msg.readBy.length > 1 ? <CheckCheck size={12} /> : <Check size={12} />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form className="chat-input-bar" onSubmit={handleSubmit}>
            <input
              className="form-control"
              maxLength={1000}
              onChange={(e) => handleDraftChange(e.target.value)}
              placeholder={activeId === ASSISTANT_ID ? t.botPlaceholder : t.inputPlaceholder}
              type="text"
              value={draft}
            />
            {draft.length > 800 && (
              <span className="chat-char-count">{draft.length}/1000</span>
            )}
            <button
              className="button button-primary chat-send-btn"
              disabled={!draft.trim() || sending || botLoading}
              type="submit"
            >
              {sending || botLoading ? (
                <Loader2 className="spin-icon" size={16} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
