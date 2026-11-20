export type Locale = 'UZ' | 'RU' | 'EN'

export type Offer = {
  id: string
  name: string
  avatar: string
  language: 'UZ' | 'RU' | 'EN'
  rating: string
  verified?: boolean
  canTeach: string
  wantsToLearn: string
  category: string
  description: string
  contact: string
}
