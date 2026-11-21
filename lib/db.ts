import fs from 'fs'
import path from 'path'

export type User = {
  id: number
  name: string
  username: string // Unikal username: @azizbek, @malika
  email: string
  password: string // bcrypt hash
  avatar: string
  bio: string
  coins: number
  phone?: string
  telegram?: string
  whatsapp?: string
  lastClaimDate?: string
  createdAt: string
}

export type OfferItem = {
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
  createdAt: string
}

export type PublicUser = {
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

export type DatabaseSchema = {
  users: User[]
  offers: OfferItem[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'swaply.json')

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: 'offer-1',
    name: 'Malika Saidova',
    username: 'malika_design',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.9',
    verified: true,
    canTeach: 'UI/UX dizayn',
    wantsToLearn: 'Ingliz tili',
    category: 'UI/UX & 3D',
    description: '3 yillik tajribam bor. Figma’da portfolio va real loyiha ustida birga ishlaymiz.',
    contact: '@malika_design',
    telegram: '@malika_design',
    phone: '+998 90 111 22 33',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-2',
    name: 'Azizbek Rahimov',
    username: 'aziz_codes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '5.0',
    verified: true,
    canTeach: 'React & Next.js',
    wantsToLearn: 'Video montaj',
    category: 'IT & Dasturlash',
    description: 'Frontend’da ishga kirishga tayyorlayman. Siz bilan amaliy loyiha qurishga tayyorman.',
    contact: '@aziz_codes',
    telegram: '@aziz_codes',
    whatsapp: '+998 93 456 78 90',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-3',
    name: 'Sofia Petrova',
    username: 'sofia_speaks',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85',
    language: 'RU',
    rating: '4.8',
    canTeach: 'IELTS speaking',
    wantsToLearn: '3D Blender',
    category: 'Ingliz tili / IELTS',
    description: 'IELTS 8.0 sohibasi. Speaking klub va talaffuz mashg‘ulotlarini olib boraman.',
    contact: '@sofia_speaks',
    telegram: '@sofia_speaks',
    phone: '+998 97 888 77 66',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-4',
    name: 'Javohir Ergashev',
    username: 'javohir_frames',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.9',
    verified: true,
    canTeach: 'Mobilografiya',
    wantsToLearn: 'Python asoslari',
    category: 'Mobilografiya',
    description: 'Telefon bilan cinematic video olish sirlarini ochaman. Ko‘chada amaliy suratga olamiz.',
    contact: '@javohir_frames',
    telegram: '@javohir_frames',
    phone: '+998 94 333 44 55',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-5',
    name: 'Nargiza Usmonova',
    username: 'nargiza_creates',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '5.0',
    verified: true,
    canTeach: 'Grafik dizayn',
    wantsToLearn: 'SMM strategiya',
    category: 'UI/UX & 3D',
    description: 'Brending va vizual tizimlarni noldan yaratishni o‘rgataman. Birga moodboard qilamiz.',
    contact: '@nargiza_creates',
    telegram: '@nargiza_creates',
    whatsapp: '+998 90 999 00 11',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-6',
    name: 'Timur Aliyev',
    username: 'timur_talks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=85',
    language: 'EN',
    rating: '4.7',
    canTeach: 'Rus tili',
    wantsToLearn: 'Git & GitHub',
    category: 'IT & Dasturlash',
    description: 'Native rus tilida so‘zlashuvchiman. Haftada ikki marta erkin muloqot qilamiz.',
    contact: '@timur_talks',
    telegram: '@timur_talks',
    phone: '+998 91 222 33 44',
    createdAt: new Date().toISOString(),
  },
]

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  let data: DatabaseSchema

  if (!fs.existsSync(DB_FILE)) {
    data = {
      users: [],
      offers: DEFAULT_OFFERS,
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return data
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    data = JSON.parse(raw) as DatabaseSchema
    if (!Array.isArray(data.users)) data.users = []
    if (!Array.isArray(data.offers) || data.offers.length === 0) data.offers = DEFAULT_OFFERS
  } catch (error) {
    console.error('Error reading db file, restoring defaults:', error)
    data = {
      users: [],
      offers: DEFAULT_OFFERS,
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return data
  }

  // Mavjud foydalanuvchilarda username yo'q bo'lsa avtomatik yaratish
  let modified = false
  data.users.forEach((u, idx) => {
    if (!u.username || !u.username.trim()) {
      let base = u.email ? u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') : `user_${u.id}`
      if (base.length < 3) base = `user_${base}_${idx}`
      u.username = base
      modified = true
    }
  })

  // Mavjud takliflarda username yo'q bo'lsa foydalanuvchidan to'ldirish
  data.offers.forEach((o) => {
    if (!o.username && o.userId) {
      const author = data.users.find((u) => u.id === o.userId)
      if (author?.username) {
        o.username = author.username
        modified = true
      }
    }
  })

  if (modified) {
    writeDbFile(data)
  }

  return data
}

function writeDbFile(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const tempPath = `${DB_FILE}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tempPath, DB_FILE)
}

// User amallari
export function findUserByEmail(email: string): User | undefined {
  const db = ensureDbFile()
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
}

export function findUserByUsername(username: string): User | undefined {
  const clean = username.toLowerCase().trim().replace(/^@/, '')
  if (!clean) return undefined
  const db = ensureDbFile()
  return db.users.find((u) => u.username?.toLowerCase() === clean)
}

export function findUserByEmailOrUsername(identifier: string): User | undefined {
  const clean = identifier.toLowerCase().trim().replace(/^@/, '')
  const db = ensureDbFile()
  return db.users.find(
    (u) => u.email.toLowerCase() === clean || u.username?.toLowerCase() === clean
  )
}

export function isUsernameAvailable(username: string, excludeUserId?: number): { available: boolean; error?: string } {
  const clean = username.toLowerCase().trim().replace(/^@/, '')

  if (!clean || clean.length < 3) {
    return { available: false, error: 'Username kamida 3 ta belgidan iborat bo‘lishi kerak' }
  }

  if (clean.length > 24) {
    return { available: false, error: 'Username ko‘pi bilan 24 ta belgidan oshmasligi kerak' }
  }

  const validRegex = /^[a-z0-9_]+$/
  if (!validRegex.test(clean)) {
    return { available: false, error: 'Username faqat lotin harflari, raqamlar va _ belgisidan iborat bo‘lishi mumkin' }
  }

  const reserved = ['admin', 'swaply', 'support', 'help', 'root', 'moderator', 'system', 'official']
  if (reserved.includes(clean)) {
    return { available: false, error: 'Bu username zaxiralangan, boshqasini tanlang' }
  }

  const db = ensureDbFile()
  const taken = db.users.some((u) => u.username?.toLowerCase() === clean && u.id !== excludeUserId)
  if (taken) {
    return { available: false, error: 'Bu username allaqachon band. Boshqa username tanlang' }
  }

  return { available: true }
}

export function findUserById(id: number): User | undefined {
  const db = ensureDbFile()
  return db.users.find((u) => u.id === id)
}

export function createUser(data: {
  name: string
  username: string
  email: string
  passwordHash: string
  avatar?: string
  bio?: string
}): User {
  const db = ensureDbFile()
  const nextId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1
  const cleanUsername = data.username.toLowerCase().trim().replace(/^@/, '')

  const newUser: User = {
    id: nextId,
    name: data.name.trim(),
    username: cleanUsername,
    email: data.email.toLowerCase().trim(),
    password: data.passwordHash,
    avatar: data.avatar || '',
    bio: data.bio || '',
    coins: 5,
    createdAt: new Date().toISOString(),
  }
  db.users.push(newUser)
  writeDbFile(db)
  return newUser
}

export function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
): User | undefined {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === id)
  if (!user) return undefined

  if (updates.name !== undefined) user.name = updates.name.trim()
  if (updates.username !== undefined) {
    user.username = updates.username.toLowerCase().trim().replace(/^@/, '')
  }
  if (updates.bio !== undefined) user.bio = updates.bio
  if (updates.avatar !== undefined) user.avatar = updates.avatar
  if (updates.coins !== undefined) user.coins = updates.coins
  if (updates.password !== undefined) user.password = updates.password
  if (updates.phone !== undefined) user.phone = updates.phone
  if (updates.telegram !== undefined) user.telegram = updates.telegram
  if (updates.whatsapp !== undefined) user.whatsapp = updates.whatsapp
  if (updates.lastClaimDate !== undefined) user.lastClaimDate = updates.lastClaimDate

  // Agar foydalanuvchi ismi yoki avatarini o'zgartirsa, uning takliflarida ham yangilaymiz
  if (updates.name || updates.avatar || updates.username) {
    db.offers.forEach((o) => {
      if (o.userId === id) {
        if (updates.name) o.name = updates.name.trim()
        if (updates.avatar) o.avatar = updates.avatar
        if (updates.username) o.username = updates.username.toLowerCase().trim().replace(/^@/, '')
      }
    })
  }

  writeDbFile(db)
  return user
}

// Barcha ommaviy foydalanuvchilar (Qidiruv va hamjamiyat ro'yxati uchun)
export function getAllPublicUsers(): PublicUser[] {
  const db = ensureDbFile()
  return db.users.map((u) => {
    const userOffers = db.offers.filter((o) => o.userId === u.id)
    const skillsTeach = userOffers.map((o) => o.canTeach).filter(Boolean)
    const skillsLearn = userOffers.map((o) => o.wantsToLearn).filter(Boolean)

    return {
      id: u.id,
      name: u.name,
      username: u.username || `user_${u.id}`,
      avatar: u.avatar || '',
      bio: u.bio || '',
      coins: u.coins,
      rating: '5.0',
      verified: true,
      offersCount: userOffers.length,
      skillsTeach,
      skillsLearn,
      phone: u.phone,
      telegram: u.telegram,
      whatsapp: u.whatsapp,
      createdAt: u.createdAt,
    }
  })
}

// Foydalanuvchilarni username va ism orqali qidirish
export function searchUsers(query: string): PublicUser[] {
  const clean = query.toLowerCase().trim().replace(/^@/, '')
  const all = getAllPublicUsers()

  if (!clean) return all

  return all.filter((u) => {
    const nameMatch = u.name.toLowerCase().includes(clean)
    const usernameMatch = u.username.toLowerCase().includes(clean)
    const bioMatch = u.bio.toLowerCase().includes(clean)
    const teachMatch = u.skillsTeach.some((s) => s.toLowerCase().includes(clean))
    const learnMatch = u.skillsLearn.some((s) => s.toLowerCase().includes(clean))
    return nameMatch || usernameMatch || bioMatch || teachMatch || learnMatch
  })
}

// Offer amallari
export function getAllOffers(): OfferItem[] {
  const db = ensureDbFile()
  return db.offers
}

export function createOffer(data: Omit<OfferItem, 'id' | 'createdAt'>): OfferItem {
  const db = ensureDbFile()
  const newOffer: OfferItem = {
    ...data,
    id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  }
  db.offers.unshift(newOffer)
  writeDbFile(db)
  return newOffer
}

export function deleteOffer(offerId: string, userId: number): boolean {
  const db = ensureDbFile()
  const index = db.offers.findIndex((o) => o.id === offerId && o.userId === userId)
  if (index === -1) return false
  db.offers.splice(index, 1)
  writeDbFile(db)
  return true
}

export function claimDailyReward(userId: number): { success: boolean; coins?: number; error?: string; alreadyClaimed?: boolean } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const today = new Date().toISOString().split('T')[0]
  if (user.lastClaimDate === today) {
    return { success: false, error: 'Siz bugungi bonus tangani olgansiz. Ertaga yana kiring!', alreadyClaimed: true }
  }

  user.coins = (user.coins || 0) + 1
  user.lastClaimDate = today
  writeDbFile(db)

  return { success: true, coins: user.coins }
}
