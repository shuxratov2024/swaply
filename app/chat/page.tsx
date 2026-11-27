import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ChatWorkspace } from '@/components/swaply/chat-workspace'

export const metadata: Metadata = {
  title: 'Swaply — 3-in-1 Chat',
  description: 'Swaply AI Yordamchi, Community va Shaxsiy 1-on-1 suhbatlar.',
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="chat-page-shell" />}>
      <ChatWorkspace />
    </Suspense>
  )
}
