export type Locale = 'UZ' | 'RU' | 'EN'

export type Gender = 'male' | 'female' | 'other'

export type Offer = {
  id: string
  userId?: number
  name: string
  username?: string
  avatar: string
  language: 'UZ' | 'RU' | 'EN'
  rating: string
  reviewsCount?: number
  verified?: boolean
  canTeach: string
  wantsToLearn: string
  category: string
  description: string
  location?: string // Joylashuv: masalan "Toshkent, Chilonzor"
  gender?: Gender
  contact: string
  phone?: string
  telegram?: string
  whatsapp?: string
  createdAt?: string
}

export type UserRole = 'admin' | 'supporter' | 'user'

export type MemberUser = {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  gender?: Gender
  role?: UserRole
  coins?: number
  rating?: string
  reviewsCount?: number
  verified?: boolean
  banned?: boolean
  offersCount: number
  skillsTeach: string[]
  skillsLearn: string[]
  location?: string
  phone?: string
  telegram?: string
  whatsapp?: string
  createdAt: string
}

export type ReportItem = {
  id: string
  reporterId?: number
  reporterName?: string
  reporterUsername?: string
  targetType: 'offer' | 'user' | 'platform'
  targetId?: string
  targetName?: string
  targetUsername?: string
  reason: 'spam' | 'scam' | 'offensive' | 'fake' | 'other'
  reasonTitle: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: string
}

export type UserReview = {
  id: string
  targetUserId?: number
  targetUsername: string
  reviewerId: number
  reviewerName: string
  reviewerUsername: string
  reviewerAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export type SwapRequest = {
  id: string
  offerId: string
  offerCanTeach: string
  offerWantsToLearn: string
  senderId: number
  senderName: string
  senderUsername: string
  receiverId?: number
  receiverName: string
  receiverUsername: string
  proposedSkill: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  createdAt: string
  updatedAt: string
}

export type AppNotification = {
  id: string
  userId: number
  type: 'swap_request' | 'swap_update' | 'review' | 'payment' | 'system'
  title: string
  body: string
  read: boolean
  createdAt: string
}

export type ChatConversationType = 'community' | 'private'

export type ChatConversationSummary = {
  id: string
  type: ChatConversationType
  title: string
  subtitle?: string
  avatar?: string
  targetUserId?: number
  targetUsername?: string
  targetRole?: UserRole
  targetVerified?: boolean
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export type ChatMessageItem = {
  id: string
  conversationId: string
  senderId: number
  senderName: string
  senderUsername: string
  senderAvatar?: string
  senderRole?: UserRole
  senderVerified?: boolean
  text: string
  readBy: number[]
  createdAt: string
}

export type AssistantMessageItem = {
  id: string
  userId: number
  role: 'user' | 'assistant'
  text: string
  locale: Locale
  source?: 'rule' | 'gemini' | 'fallback'
  createdAt: string
}

export const avatarOptions = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
]
