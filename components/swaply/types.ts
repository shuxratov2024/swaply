export type Locale = 'UZ' | 'RU' | 'EN'

export type Offer = {
  id: string
  userId?: number
  name: string
  username?: string
  avatar: string
  language: 'UZ' | 'RU' | 'EN'
  rating: string
  verified?: boolean
  canTeach: string
  wantsToLearn: string
  category: string
  description: string
  contact: string
  phone?: string
  telegram?: string
  whatsapp?: string
  createdAt?: string
}

export type MemberUser = {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  coins?: number
  rating?: string
  verified?: boolean
  offersCount: number
  skillsTeach: string[]
  skillsLearn: string[]
  phone?: string
  telegram?: string
  whatsapp?: string
  createdAt: string
}

export const avatarOptions = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
]

