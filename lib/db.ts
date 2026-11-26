import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export type UserRole = 'admin' | 'supporter' | 'user'

export type User = {
  id: number
  name: string
  username: string // Unikal username: @amir, @azizbek.uz
  email: string
  password: string // bcrypt hash
  avatar: string
  bio: string
  gender?: 'male' | 'female' | 'other'
  role?: UserRole
  verified?: boolean
  banned?: boolean
  coins: number
  phone?: string
  telegram?: string
  whatsapp?: string
  unlockedOfferIds?: string[]
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
  location?: string // Joylashuv: Masalan "Toshkent, Chilonzor"
  gender?: 'male' | 'female' | 'other'
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
  gender?: 'male' | 'female' | 'other'
  role?: UserRole
  coins?: number
  rating?: string
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

export type CoinPackId = 'start' | 'popular' | 'pro' | 'vip'

export type CoinPack = {
  id: CoinPackId
  title: string
  subtitle: string
  baseCoins: number
  bonusCoins: number
  totalCoins: number
  priceUzs: number
  badge?: string
  popular?: boolean
}

export type PromoCode = {
  code: string
  bonusCoins: number
  bonusPercent: number
  maxUses: number
  usedCount: number
  active: boolean
  description?: string
  createdAt: string
}

export type CoinTransaction = {
  id: string
  userId: number
  userName: string
  userUsername: string
  type: 'topup' | 'spend' | 'daily_bonus' | 'admin_adjust'
  packId?: CoinPackId
  packTitle?: string
  coinsDelta: number
  amountUzs: number
  provider?: 'payme' | 'click' | 'uzum'
  paymentRef?: string
  promoCode?: string
  status: 'pending' | 'completed' | 'rejected'
  note?: string
  reviewedBy?: string
  createdAt: string
}

export type AdminLog = {
  id: string
  actorId: number
  actorUsername: string
  actorRole: UserRole
  action: string
  target: string
  details?: string
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

export type OtpChallenge = {
  email: string
  purpose: 'login' | 'register' | 'reset'
  codeHash: string
  expiresAt: number
  attempts: number
}

export type DatabaseSchema = {
  users: User[]
  offers: OfferItem[]
  reports?: ReportItem[]
  transactions?: CoinTransaction[]
  promoCodes?: PromoCode[]
  adminLogs?: AdminLog[]
  otpChallenges?: OtpChallenge[]
}

export const COIN_PRICE_UZS = 1000 // 1 tanga = 1,000 UZS

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'start',
    title: 'Start',
    subtitle: 'Sinab ko‘rish uchun',
    baseCoins: 5,
    bonusCoins: 0,
    totalCoins: 5,
    priceUzs: 5000,
  },
  {
    id: 'popular',
    title: 'Ommabop',
    subtitle: '+20% bepul bonus',
    baseCoins: 15,
    bonusCoins: 3,
    totalCoins: 18,
    priceUzs: 15000,
    badge: 'Mashhur',
    popular: true,
  },
  {
    id: 'pro',
    title: 'Pro',
    subtitle: '+30% bepul bonus',
    baseCoins: 30,
    bonusCoins: 9,
    totalCoins: 39,
    priceUzs: 30000,
    badge: 'Eng foydali',
  },
  {
    id: 'vip',
    title: 'VIP',
    subtitle: '+40% bepul bonus',
    baseCoins: 50,
    bonusCoins: 20,
    totalCoins: 70,
    priceUzs: 50000,
    badge: 'Maksimal',
  },
]

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    code: 'WELCOME',
    bonusCoins: 3,
    bonusPercent: 0,
    maxUses: 1000,
    usedCount: 0,
    active: true,
    description: 'Yangi foydalanuvchilar uchun +3 bonus tanga',
    createdAt: new Date().toISOString(),
  },
  {
    code: 'SWAPLY20',
    bonusCoins: 0,
    bonusPercent: 20,
    maxUses: 500,
    usedCount: 0,
    active: true,
    description: 'Paketga +20% qo‘shimcha bonus tanga',
    createdAt: new Date().toISOString(),
  },
]

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
    location: 'Toshkent, Chilonzor',
    gender: 'female',
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
    location: 'Toshkent, Yunusobod',
    gender: 'male',
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
    location: 'Samarqand',
    gender: 'female',
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
    location: 'Toshkent, Mirzo Ulug‘bek',
    gender: 'male',
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
    location: 'Farg‘ona',
    gender: 'female',
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
    location: 'Toshkent, Mirobod',
    gender: 'male',
    contact: '@timur_talks',
    telegram: '@timur_talks',
    phone: '+998 91 222 33 44',
    createdAt: new Date().toISOString(),
  },
]

// In-memory cache to avoid synchronous disk reads & JSON.parse on every API call
let cachedDb: DatabaseSchema | null = null
let cachedMtimeMs = 0

function normalizeDbData(data: DatabaseSchema): boolean {
  let modified = false

  if (!Array.isArray(data.users)) {
    data.users = []
    modified = true
  }
  if (!Array.isArray(data.offers) || data.offers.length === 0) {
    data.offers = DEFAULT_OFFERS.map((o) => ({ ...o }))
    modified = true
  }
  if (!Array.isArray(data.reports)) {
    data.reports = []
    modified = true
  }
  if (!Array.isArray(data.transactions)) {
    data.transactions = []
    modified = true
  }
  if (!Array.isArray(data.promoCodes) || data.promoCodes.length === 0) {
    data.promoCodes = DEFAULT_PROMO_CODES.map((p) => ({ ...p }))
    modified = true
  }
  if (!Array.isArray(data.adminLogs)) {
    data.adminLogs = []
    modified = true
  }

  const userById = new Map<number, User>()

  data.users.forEach((u, idx) => {
    if (!u.username || !u.username.trim()) {
      let base = u.email ? u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') : `user_${u.id}`
      if (base.length < 3) base = `user_${base}_${idx}`
      u.username = base
      modified = true
    }
    if (!u.gender) {
      u.gender = 'other'
      modified = true
    }
    if ((u.username === 'amir' || u.email.includes('amir') || u.id === 2) && u.role !== 'admin') {
      u.role = 'admin'
      modified = true
    }
    userById.set(u.id, u)
  })

  data.offers.forEach((o) => {
    if (!o.username && o.userId) {
      const author = userById.get(o.userId)
      if (author?.username) {
        o.username = author.username
        if (!o.gender && author.gender) o.gender = author.gender
        modified = true
      }
    }
    if (!o.location) {
      o.location = 'Toshkent'
      modified = true
    }
    if (!o.gender) {
      o.gender = 'other'
      modified = true
    }
  })

  return modified
}

function writeDbFile(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const tempPath = `${DB_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8')
  try {
    fs.renameSync(tempPath, DB_FILE)
  } catch {
    fs.copyFileSync(tempPath, DB_FILE)
    try {
      fs.unlinkSync(tempPath)
    } catch {}
  }
  cachedDb = data
  try {
    cachedMtimeMs = fs.statSync(DB_FILE).mtimeMs
  } catch {
    cachedMtimeMs = Date.now()
  }
}

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [],
      offers: DEFAULT_OFFERS.map((o) => ({ ...o })),
      reports: [],
      transactions: [],
      promoCodes: DEFAULT_PROMO_CODES.map((p) => ({ ...p })),
      adminLogs: [],
    }
    writeDbFile(initialData)
    return initialData
  }

  try {
    const stat = fs.statSync(DB_FILE)
    if (cachedDb && stat.mtimeMs === cachedMtimeMs) {
      return cachedDb
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const data = JSON.parse(raw) as DatabaseSchema
    const modified = normalizeDbData(data)

    if (modified) {
      writeDbFile(data)
    } else {
      cachedDb = data
      cachedMtimeMs = stat.mtimeMs
    }
    return data
  } catch (error) {
    console.error('Error reading db file, restoring defaults:', error)
    const fallbackData: DatabaseSchema = {
      users: [],
      offers: DEFAULT_OFFERS.map((o) => ({ ...o })),
      reports: [],
      transactions: [],
      promoCodes: DEFAULT_PROMO_CODES.map((p) => ({ ...p })),
      adminLogs: [],
    }
    writeDbFile(fallbackData)
    return fallbackData
  }
}

function getTodayTashkent(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date())
}

// ---------------- USERNAME FORMAT VALIDATION ----------------
// Belgilari: faqat lotin harflari, raqamlar, '.' va '_'
// Nuqta va tagchiziq oldida va oxirida kelishi mumkin emas
// Ketma-ket kelishi mumkin emas, faqat so'z o'rtasida bo'lishi mumkin
// Nojo'iz so'zlar taqiqlanadi
export function validateUsernameFormat(rawUsername: string): { valid: boolean; error?: string; clean: string } {
  let clean = (rawUsername || '').trim()
  if (clean.startsWith('@')) {
    clean = clean.slice(1)
  }
  clean = clean.toLowerCase()

  if (!clean || clean.length < 3) {
    return { valid: false, error: 'Username kamida 3 ta belgidan iborat bo‘lishi kerak', clean }
  }

  if (clean.length > 24) {
    return { valid: false, error: 'Username ko‘pi bilan 24 ta belgidan oshmasligi kerak', clean }
  }

  if (clean.startsWith('.') || clean.startsWith('_')) {
    return { valid: false, error: 'Username boshida nuqta (.) yoki tagchiziq (_) bo‘lishi mumkin emas', clean }
  }

  if (clean.endsWith('.') || clean.endsWith('_')) {
    return { valid: false, error: 'Username oxirida nuqta (.) yoki tagchiziq (_) bo‘lishi mumkin emas', clean }
  }

  if (/[._]{2,}/.test(clean)) {
    return { valid: false, error: 'Ketma-ket nuqta yoki tagchiziq qo‘yish mumkin emas', clean }
  }

  const validPattern = /^[a-z0-9]+([._][a-z0-9]+)*$/
  if (!validPattern.test(clean)) {
    return {
      valid: false,
      error: 'Username faqat lotin harflari, raqamlar, nuqta (.) va tagchiziq (_) dan iborat bo‘lishi mumkin',
      clean,
    }
  }

  const forbiddenWords = [
    'admin', 'administrator', 'root', 'swaply', 'support', 'moderator', 'system', 'official',
    'jalap', 'fahiwa', 'fahisha', 'sik', 'sikiw', 'sikish', 'qoxtak', 'qoxtoq', 'qotoq', 'qotog', 'am', 'itvachcha',
    'dalbayob', 'dalbaeb', 'ahmoq', 'mol', 'chmo', 'xuy', 'pizda', 'blyad', 'suka', 'ebat',
    'fuck', 'bitch', 'porn', 'xxx', 'asshole', 'dick', 'pussy', 'cunt', 'sex', 'nude', 'bastard', 'whore',
  ]

  const normalized = clean.replace(/[._]/g, '')
  for (const word of forbiddenWords) {
    if (clean === word || normalized === word || clean.includes(word)) {
      return { valid: false, error: 'Bu username taqiqlangan yoki nojo‘iz so‘zni o‘z ichiga oladi', clean }
    }
  }

  return { valid: true, clean }
}

export function isUsernameAvailable(username: string, excludeUserId?: number): { available: boolean; error?: string } {
  const check = validateUsernameFormat(username)
  if (!check.valid) {
    return { available: false, error: check.error }
  }

  const db = ensureDbFile()
  const taken = db.users.some((u) => u.username?.toLowerCase() === check.clean && u.id !== excludeUserId)
  if (taken) {
    return { available: false, error: 'Bu username allaqachon band qilingan' }
  }

  return { available: true }
}

// User amallari
export function findUserByEmail(email: string): User | undefined {
  const clean = email.toLowerCase().trim()
  const db = ensureDbFile()
  return db.users.find((u) => u.email.toLowerCase() === clean)
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

export function findUserById(id: number): User | undefined {
  const db = ensureDbFile()
  return db.users.find((u) => u.id === id)
}

export function createUser(data: {
  name: string
  username: string
  email: string
  passwordHash: string
  gender?: 'male' | 'female' | 'other'
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
    gender: data.gender || 'other',
    role: cleanUsername === 'amir' ? 'admin' : 'user',
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
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'role' | 'coins' | 'lastClaimDate'>>
): User | undefined {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === id)
  if (!user) return undefined

  if (updates.name !== undefined) user.name = updates.name.trim()
  if (updates.username !== undefined) {
    user.username = updates.username.toLowerCase().trim().replace(/^@/, '')
  }
  if (updates.gender !== undefined) user.gender = updates.gender
  if (updates.bio !== undefined) user.bio = updates.bio
  if (updates.avatar !== undefined) user.avatar = updates.avatar
  if (updates.password !== undefined) user.password = updates.password
  if (updates.phone !== undefined) user.phone = updates.phone
  if (updates.telegram !== undefined) user.telegram = updates.telegram
  if (updates.whatsapp !== undefined) user.whatsapp = updates.whatsapp

  // Agar foydalanuvchi ismi, avatari, username yoki jinsi o'zgarsa, takliflarda ham yangilash
  if (updates.name !== undefined || updates.avatar !== undefined || updates.username !== undefined || updates.gender !== undefined) {
    db.offers.forEach((o) => {
      if (o.userId === id) {
        if (updates.name !== undefined) o.name = user.name
        if (updates.avatar !== undefined) o.avatar = user.avatar
        if (updates.username !== undefined) o.username = user.username
        if (updates.gender !== undefined) o.gender = user.gender
      }
    })
  }

  writeDbFile(db)
  return user
}

function pushTransaction(db: DatabaseSchema, tx: CoinTransaction) {
  if (!Array.isArray(db.transactions)) db.transactions = []
  db.transactions.unshift(tx)
  if (db.transactions.length > 500) {
    db.transactions = db.transactions.slice(0, 500)
  }
}

function pushAdminLog(
  db: DatabaseSchema,
  actor: { id: number; username: string; role?: UserRole },
  action: string,
  target: string,
  details?: string
) {
  if (!Array.isArray(db.adminLogs)) db.adminLogs = []
  db.adminLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId: actor.id,
    actorUsername: actor.username,
    actorRole: actor.role || 'admin',
    action,
    target,
    details,
    createdAt: new Date().toISOString(),
  })
  if (db.adminLogs.length > 300) {
    db.adminLogs = db.adminLogs.slice(0, 300)
  }
}

// Kontakt ochish uchun tanga yechish
export function spendUserCoin(userId: number, amount: number = 1): { success: boolean; coins?: number; error?: string } {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { success: false, error: 'Tanga miqdori noto‘g‘ri' }
  }

  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) {
    return { success: false, error: 'Foydalanuvchi topilmadi' }
  }

  const currentCoins = user.coins || 0
  if (currentCoins < amount) {
    return {
      success: false,
      coins: currentCoins,
      error: `Tangalar yetarli emas. Balansingiz: ${currentCoins} ta tanga. Kontaktni ochish uchun kamida ${amount} ta tanga kerak.`,
    }
  }

  user.coins = currentCoins - amount
  pushTransaction(db, {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    type: 'spend',
    coinsDelta: -amount,
    amountUzs: 0,
    status: 'completed',
    note: 'Kontakt ma’lumotlarini ochish',
    createdAt: new Date().toISOString(),
  })
  writeDbFile(db)
  return { success: true, coins: user.coins }
}

// Taklif kontaktini xavfsiz ochish (faqat tanga yechilgandan keyin kontakt qaytariladi)
export function unlockOfferContact(
  userId: number,
  offerId: string
): {
  success: boolean
  coins?: number
  alreadyUnlocked?: boolean
  contact?: { contact: string; phone?: string; telegram?: string; whatsapp?: string }
  error?: string
} {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const offer = db.offers.find((o) => o.id === offerId)
  if (!offer) return { success: false, error: 'Taklif topilmadi' }

  if (!Array.isArray(user.unlockedOfferIds)) user.unlockedOfferIds = []

  const isOwner = offer.userId === userId
  const alreadyUnlocked = isOwner || user.unlockedOfferIds.includes(offerId)
  const contactPayload = {
    contact: offer.contact || offer.telegram || offer.phone || offer.whatsapp || '',
    phone: offer.phone,
    telegram: offer.telegram,
    whatsapp: offer.whatsapp,
  }

  if (alreadyUnlocked) {
    return {
      success: true,
      coins: user.coins,
      alreadyUnlocked: true,
      contact: contactPayload,
    }
  }

  const currentCoins = user.coins || 0
  if (currentCoins < 1) {
    return {
      success: false,
      coins: currentCoins,
      error: `Tangalar yetarli emas. Balansingiz: ${currentCoins} ta tanga. Kontaktni ochish uchun kamida 1 ta tanga kerak.`,
    }
  }

  user.coins = currentCoins - 1
  user.unlockedOfferIds.push(offerId)
  pushTransaction(db, {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    type: 'spend',
    coinsDelta: -1,
    amountUzs: 0,
    status: 'completed',
    note: `${offer.name} (@${offer.username || 'user'}) kontaktini ochish`,
    createdAt: new Date().toISOString(),
  })
  writeDbFile(db)

  return {
    success: true,
    coins: user.coins,
    alreadyUnlocked: false,
    contact: contactPayload,
  }
}

// Taklifdagi shaxsiy kontaktlarni begonalardan yashirish (ma'lumot sizib chiqishining oldini olish)
export function sanitizeOfferForViewer(
  offer: OfferItem,
  viewerUser?: Pick<User, 'id' | 'unlockedOfferIds'> | null
): OfferItem {
  const isOwner = Boolean(viewerUser && offer.userId === viewerUser.id)
  const isUnlocked = Boolean(viewerUser?.unlockedOfferIds?.includes(offer.id))
  if (isOwner || isUnlocked) {
    return offer
  }
  return {
    ...offer,
    contact: '',
    phone: undefined,
    telegram: undefined,
    whatsapp: undefined,
  }
}

// 6-xonali Email OTP yaratish va tekshirish
function hashOtpCode(email: string, purpose: string, code: string): string {
  const secret = process.env.JWT_SECRET || 'swaply-otp-salt-2026'
  return crypto
    .createHmac('sha256', secret)
    .update(`${email.toLowerCase().trim()}:${purpose}:${code}`)
    .digest('hex')
}

export function createOtpChallenge(email: string, purpose: 'login' | 'register' | 'reset'): string {
  const db = ensureDbFile()
  const cleanEmail = email.toLowerCase().trim()
  const now = Date.now()
  if (!Array.isArray(db.otpChallenges)) db.otpChallenges = []

  // Muddati o'tgan yoki eski OTP larni tozalash
  db.otpChallenges = db.otpChallenges.filter(
    (c) => c.expiresAt > now && !(c.email === cleanEmail && c.purpose === purpose)
  )

  const code = String(crypto.randomInt(100000, 1000000))
  db.otpChallenges.push({
    email: cleanEmail,
    purpose,
    codeHash: hashOtpCode(cleanEmail, purpose, code),
    expiresAt: now + 5 * 60 * 1000, // 5 daqiqa
    attempts: 0,
  })
  writeDbFile(db)
  return code
}

export function verifyOtpChallenge(
  email: string,
  code: string,
  purpose: 'login' | 'register' | 'reset'
): { valid: boolean; error?: string } {
  const db = ensureDbFile()
  const cleanEmail = email.toLowerCase().trim()
  const cleanCode = (code || '').trim()
  if (!/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: '6 xonali raqamli kodni kiriting' }
  }

  if (!Array.isArray(db.otpChallenges)) {
    return { valid: false, error: 'Tasdiqlash kodi topilmadi yoki muddati tugagan' }
  }

  const idx = db.otpChallenges.findIndex(
    (c) => c.email === cleanEmail && c.purpose === purpose
  )
  if (idx === -1) {
    return { valid: false, error: 'Tasdiqlash kodi topilmadi. Qaytadan kod yuboring' }
  }

  const challenge = db.otpChallenges[idx]
  if (Date.now() > challenge.expiresAt) {
    db.otpChallenges.splice(idx, 1)
    writeDbFile(db)
    return { valid: false, error: 'Kodning amal qilish muddati (5 daqiqa) tugagan. Yangi kod oling' }
  }

  if (challenge.attempts >= 5) {
    db.otpChallenges.splice(idx, 1)
    writeDbFile(db)
    return { valid: false, error: 'Juda ko‘p noto‘g‘ri urinish. Yangi kod so‘rang' }
  }

  const expectedBuf = Buffer.from(challenge.codeHash, 'hex')
  const actualBuf = Buffer.from(hashOtpCode(cleanEmail, purpose, cleanCode), 'hex')
  const match = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)

  if (!match) {
    challenge.attempts += 1
    writeDbFile(db)
    return { valid: false, error: `Tasdiqlash kodi noto‘g‘ri (qolgan urinishlar: ${5 - challenge.attempts})` }
  }

  // Bir martalik kod: tasdiqlangandan keyin o'chirish
  db.otpChallenges.splice(idx, 1)
  writeDbFile(db)
  return { valid: true }
}

export function updateUserPassword(userId: number, passwordHash: string): boolean {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return false
  user.password = passwordHash
  writeDbFile(db)
  return true
}

// Promo-kodni tekshirish
export function validatePromoCode(
  rawCode: string,
  packId?: CoinPackId
): { valid: boolean; promo?: PromoCode; bonusCoins: number; error?: string } {
  const clean = (rawCode || '').trim().toUpperCase()
  if (!clean) {
    return { valid: false, bonusCoins: 0, error: 'Promo-kod kiriting' }
  }

  const db = ensureDbFile()
  const promo = (db.promoCodes || []).find((p) => p.code.toUpperCase() === clean)
  if (!promo || !promo.active) {
    return { valid: false, bonusCoins: 0, error: 'Bunday faol promo-kod topilmadi' }
  }
  if (promo.usedCount >= promo.maxUses) {
    return { valid: false, bonusCoins: 0, error: 'Promo-kod limiti tugagan' }
  }

  const pack = packId ? COIN_PACKS.find((p) => p.id === packId) : undefined
  const percentBonus = pack ? Math.round((pack.baseCoins * promo.bonusPercent) / 100) : 0
  const bonusCoins = promo.bonusCoins + percentBonus

  return { valid: true, promo, bonusCoins }
}

// Hamyonni to'ldirish so'rovini yaratish (2-bosqichli to'lov: darhol tanga qo'shmaydi!)
export function createTopUpRequest(data: {
  userId: number
  packId: CoinPackId
  provider: 'payme' | 'click' | 'uzum'
  paymentRef: string
  promoCode?: string
}): { success: boolean; transaction?: CoinTransaction; error?: string } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === data.userId)
  if (!user) {
    return { success: false, error: 'Foydalanuvchi topilmadi' }
  }

  const pack = COIN_PACKS.find((p) => p.id === data.packId)
  if (!pack) {
    return { success: false, error: 'Noto‘g‘ri tanga paketi tanlandi' }
  }

  const cleanRef = data.paymentRef.trim()
  if (cleanRef.length < 4) {
    return { success: false, error: 'To‘lov cheki raqami yoki telefon/karta oxirgi 4 raqamini kiriting' }
  }

  let promoBonus = 0
  let appliedPromo: string | undefined
  if (data.promoCode && data.promoCode.trim()) {
    const check = validatePromoCode(data.promoCode, pack.id)
    if (!check.valid || !check.promo) {
      return { success: false, error: check.error || 'Promo-kod yaroqsiz' }
    }
    promoBonus = check.bonusCoins
    appliedPromo = check.promo.code
  }

  const totalCoins = pack.totalCoins + promoBonus
  const tx: CoinTransaction = {
    id: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    type: 'topup',
    packId: pack.id,
    packTitle: pack.title,
    coinsDelta: totalCoins,
    amountUzs: pack.priceUzs,
    provider: data.provider,
    paymentRef: cleanRef.slice(0, 64),
    promoCode: appliedPromo,
    status: 'pending',
    note: `${pack.title} paketi (${pack.baseCoins} + ${pack.bonusCoins + promoBonus} bonus tanga)`,
    createdAt: new Date().toISOString(),
  }

  pushTransaction(db, tx)
  writeDbFile(db)
  return { success: true, transaction: tx }
}

export function reviewTopUpTransaction(
  txId: string,
  decision: 'completed' | 'rejected',
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; transaction?: CoinTransaction; coins?: number; error?: string } {
  const db = ensureDbFile()
  const tx = (db.transactions || []).find((t) => t.id === txId && t.type === 'topup')
  if (!tx) {
    return { success: false, error: 'To‘lov so‘rovi topilmadi' }
  }
  if (tx.status !== 'pending') {
    return { success: false, error: 'Bu to‘lov so‘rovi allaqachon ko‘rib chiqilgan' }
  }

  const user = db.users.find((u) => u.id === tx.userId)
  if (!user) {
    return { success: false, error: 'Foydalanuvchi topilmadi' }
  }

  tx.status = decision
  tx.reviewedBy = actor.username

  if (decision === 'completed') {
    user.coins = (user.coins || 0) + tx.coinsDelta
    if (tx.promoCode) {
      const promo = (db.promoCodes || []).find((p) => p.code.toUpperCase() === tx.promoCode?.toUpperCase())
      if (promo) promo.usedCount += 1
    }
  }

  pushAdminLog(
    db,
    actor,
    decision === 'completed' ? 'To‘lov tasdiqlandi' : 'To‘lov rad etildi',
    `@${tx.userUsername}`,
    `${tx.id} • ${tx.coinsDelta} ◈ • ${tx.amountUzs.toLocaleString()} UZS`
  )

  writeDbFile(db)
  return { success: true, transaction: tx, coins: user.coins }
}

export function getUserTransactions(userId: number): CoinTransaction[] {
  const db = ensureDbFile()
  return (db.transactions || []).filter((t) => t.userId === userId).slice(0, 20)
}

export function getAllTransactions(): CoinTransaction[] {
  const db = ensureDbFile()
  return db.transactions || []
}

export function getAllPromoCodes(): PromoCode[] {
  const db = ensureDbFile()
  return db.promoCodes || []
}

export function createPromoCode(
  data: { code: string; bonusCoins: number; bonusPercent: number; maxUses: number; description?: string },
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; promo?: PromoCode; error?: string } {
  const db = ensureDbFile()
  if (!Array.isArray(db.promoCodes)) db.promoCodes = []

  const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  if (cleanCode.length < 3 || cleanCode.length > 20) {
    return { success: false, error: 'Promo-kod 3-20 ta lotin harf/raqamdan iborat bo‘lishi kerak' }
  }
  if (db.promoCodes.some((p) => p.code.toUpperCase() === cleanCode)) {
    return { success: false, error: 'Bu promo-kod allaqachon mavjud' }
  }

  const promo: PromoCode = {
    code: cleanCode,
    bonusCoins: Math.max(0, Math.min(100, Math.floor(data.bonusCoins || 0))),
    bonusPercent: Math.max(0, Math.min(100, Math.floor(data.bonusPercent || 0))),
    maxUses: Math.max(1, Math.min(100000, Math.floor(data.maxUses || 100))),
    usedCount: 0,
    active: true,
    description: data.description?.trim().slice(0, 120) || '',
    createdAt: new Date().toISOString(),
  }

  db.promoCodes.unshift(promo)
  pushAdminLog(db, actor, 'Promo-kod yaratildi', cleanCode, `+${promo.bonusCoins} ◈ / +${promo.bonusPercent}%`)
  writeDbFile(db)
  return { success: true, promo }
}

export function togglePromoCode(
  code: string,
  actor: { id: number; username: string; role?: UserRole }
): PromoCode | null {
  const db = ensureDbFile()
  const promo = (db.promoCodes || []).find((p) => p.code.toUpperCase() === code.toUpperCase())
  if (!promo) return null
  promo.active = !promo.active
  pushAdminLog(db, actor, promo.active ? 'Promo-kod faollashtirildi' : 'Promo-kod to‘xtatildi', promo.code)
  writeDbFile(db)
  return promo
}

export function deletePromoCode(
  code: string,
  actor: { id: number; username: string; role?: UserRole }
): boolean {
  const db = ensureDbFile()
  if (!Array.isArray(db.promoCodes)) return false
  const idx = db.promoCodes.findIndex((p) => p.code.toUpperCase() === code.toUpperCase())
  if (idx === -1) return false
  db.promoCodes.splice(idx, 1)
  pushAdminLog(db, actor, 'Promo-kod o‘chirildi', code.toUpperCase())
  writeDbFile(db)
  return true
}

function indexOffersByUser(offers: OfferItem[]) {
  const byUserId = new Map<number, OfferItem[]>()
  const byUsername = new Map<string, OfferItem[]>()

  for (const offer of offers) {
    if (offer.userId !== undefined) {
      const list = byUserId.get(offer.userId)
      if (list) list.push(offer)
      else byUserId.set(offer.userId, [offer])
    }
    if (offer.username) {
      const key = offer.username.toLowerCase()
      const list = byUsername.get(key)
      if (list) list.push(offer)
      else byUsername.set(key, [offer])
    }
  }

  return (u: User): OfferItem[] => {
    const idOffers = byUserId.get(u.id) || []
    const nameKey = u.username?.toLowerCase()
    const nameOffers = nameKey ? byUsername.get(nameKey) || [] : []
    if (nameOffers.length === 0) return idOffers
    if (idOffers.length === 0) return nameOffers
    const seen = new Set(idOffers.map((o) => o.id))
    const merged = [...idOffers]
    for (const o of nameOffers) {
      if (!seen.has(o.id)) merged.push(o)
    }
    return merged
  }
}

// Barcha ommaviy foydalanuvchilar
export function getAllPublicUsers(): PublicUser[] {
  const db = ensureDbFile()
  const getUserOffers = indexOffersByUser(db.offers)

  return db.users
    .filter((u) => !u.banned)
    .map((u) => {
      const userOffers = getUserOffers(u)
      const skillsTeach = userOffers.map((o) => o.canTeach).filter(Boolean)
      const skillsLearn = userOffers.map((o) => o.wantsToLearn).filter(Boolean)
      const location = userOffers.find((o) => o.location)?.location || 'Toshkent'

      return {
        id: u.id,
        name: u.name,
        username: u.username || `user_${u.id}`,
        avatar: u.avatar || '',
        bio: u.bio || '',
        gender: u.gender,
        role: u.role,
        rating: '5.0',
        verified: Boolean(u.verified || u.role === 'admin' || u.role === 'supporter'),
        offersCount: userOffers.length,
        skillsTeach,
        skillsLearn,
        location,
        createdAt: u.createdAt,
      }
    })
}

// Foydalanuvchilarni username va ism orqali qidirish (Header va Search uchun)
export function searchUsers(query: string, genderFilter?: string): PublicUser[] {
  const clean = query.toLowerCase().trim().replace(/^@/, '')
  let all = getAllPublicUsers()

  if (genderFilter && genderFilter !== 'all') {
    all = all.filter((u) => u.gender === genderFilter)
  }

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
export function getAllOffers(genderFilter?: string, locationFilter?: string): OfferItem[] {
  const db = ensureDbFile()
  const bannedUserIds = new Set(db.users.filter((u) => u.banned).map((u) => u.id))
  let offers = db.offers.filter((o) => !(o.userId && bannedUserIds.has(o.userId)))

  if (genderFilter && genderFilter !== 'all') {
    offers = offers.filter((o) => o.gender === genderFilter)
  }

  if (locationFilter && locationFilter !== 'all') {
    const loc = locationFilter.toLowerCase()
    offers = offers.filter((o) => o.location?.toLowerCase().includes(loc))
  }

  return offers
}

export function createOffer(data: Omit<OfferItem, 'id' | 'createdAt'>): OfferItem {
  const db = ensureDbFile()
  const newOffer: OfferItem = {
    ...data,
    location: data.location?.trim() || 'Toshkent',
    gender: data.gender || 'other',
    id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  }
  db.offers.unshift(newOffer)
  writeDbFile(db)
  return newOffer
}

export function deleteOffer(offerId: string, userId: number, isAdmin = false): boolean {
  const db = ensureDbFile()
  const index = db.offers.findIndex(
    (o) => o.id === offerId && (o.userId === userId || isAdmin)
  )
  if (index === -1) return false
  db.offers.splice(index, 1)
  writeDbFile(db)
  return true
}

export function claimDailyReward(userId: number): { success: boolean; coins?: number; error?: string; alreadyClaimed?: boolean } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const today = getTodayTashkent()
  if (user.lastClaimDate === today) {
    return { success: false, error: 'Siz bugungi bonus tangani olgansiz. Ertaga yana kiring!', alreadyClaimed: true }
  }

  user.coins = (user.coins || 0) + 1
  user.lastClaimDate = today
  pushTransaction(db, {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    type: 'daily_bonus',
    coinsDelta: 1,
    amountUzs: 0,
    status: 'completed',
    note: 'Kunlik bepul bonus',
    createdAt: new Date().toISOString(),
  })
  writeDbFile(db)

  return { success: true, coins: user.coins }
}

// ---------------- SHIKOYATLAR (REPORTS) TIZIMI ----------------
export function createReport(data: {
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
}): ReportItem {
  const db = ensureDbFile()
  if (!Array.isArray(db.reports)) db.reports = []

  const newReport: ReportItem = {
    ...data,
    id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  db.reports.unshift(newReport)
  writeDbFile(db)
  return newReport
}

export function getAllReports(): ReportItem[] {
  const db = ensureDbFile()
  return db.reports || []
}

export function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved',
  actor?: { id: number; username: string; role?: UserRole }
): boolean {
  const db = ensureDbFile()
  if (!Array.isArray(db.reports)) return false
  const rep = db.reports.find((r) => r.id === reportId)
  if (!rep) return false
  rep.status = status
  if (actor) {
    pushAdminLog(db, actor, 'Shikoyat holati o‘zgartirildi', rep.id, `Status: ${status}`)
  }
  writeDbFile(db)
  return true
}

// ---------------- ADMIN DASHBOARD & ANALYTICS ----------------
export function getAdminStats() {
  const db = ensureDbFile()
  const users = db.users || []
  const offers = db.offers || []
  const reports = db.reports || []
  const transactions = db.transactions || []

  let maleCount = 0
  let femaleCount = 0
  let otherCount = 0
  let adminsCount = 0
  let supportersCount = 0
  let bannedCount = 0

  for (const u of users) {
    if (u.gender === 'male') maleCount++
    else if (u.gender === 'female') femaleCount++
    else otherCount++

    if (u.role === 'admin' || u.username === 'amir') adminsCount++
    else if (u.role === 'supporter') supportersCount++
    if (u.banned) bannedCount++
  }

  let pendingReports = 0
  for (const r of reports) {
    if (r.status === 'pending') pendingReports++
  }

  let pendingTopups = 0
  let totalRevenueUzs = 0
  for (const tx of transactions) {
    if (tx.type === 'topup') {
      if (tx.status === 'pending') pendingTopups++
      if (tx.status === 'completed') totalRevenueUzs += tx.amountUzs || 0
    }
  }

  return {
    totalUsers: users.length,
    totalOffers: offers.length,
    totalReports: reports.length,
    pendingReports,
    pendingTopups,
    totalRevenueUzs,
    adminsCount,
    supportersCount,
    bannedCount,
    genderStats: {
      male: maleCount,
      female: femaleCount,
      other: otherCount,
    },
  }
}

export function getAdminUsersList(searchQuery?: string) {
  const db = ensureDbFile()
  const clean = (searchQuery || '').toLowerCase().trim().replace(/^@/, '')
  const getUserOffers = indexOffersByUser(db.offers)

  const reports = db.reports || []
  const reportCountsByTargetId = new Map<string, number>()
  const reportCountsByUsername = new Map<string, number>()
  for (const r of reports) {
    if (r.targetId) {
      reportCountsByTargetId.set(r.targetId, (reportCountsByTargetId.get(r.targetId) || 0) + 1)
    }
    if (r.targetUsername) {
      const key = r.targetUsername.toLowerCase()
      reportCountsByUsername.set(key, (reportCountsByUsername.get(key) || 0) + 1)
    }
  }

  return db.users
    .filter((u) => {
      if (!clean) return true
      return (
        u.name.toLowerCase().includes(clean) ||
        u.username.toLowerCase().includes(clean) ||
        u.email.toLowerCase().includes(clean)
      )
    })
    .map((u) => {
      const userOffers = getUserOffers(u)
      const reportsCount =
        (reportCountsByTargetId.get(String(u.id)) || 0) +
        (u.username ? reportCountsByUsername.get(u.username.toLowerCase()) || 0 : 0)

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        gender: u.gender,
        role: u.role || 'user',
        verified: Boolean(u.verified || u.role === 'admin' || u.role === 'supporter'),
        banned: Boolean(u.banned),
        coins: u.coins,
        phone: u.phone,
        telegram: u.telegram,
        whatsapp: u.whatsapp,
        createdAt: u.createdAt,
        offers: userOffers,
        offersCount: userOffers.length,
        reportsCount,
      }
    })
}

export function createUserByAdmin(
  data: {
    name: string
    username: string
    email: string
    passwordHash: string
    role: UserRole
    gender?: 'male' | 'female' | 'other'
    coins?: number
  },
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; user?: User; error?: string } {
  const db = ensureDbFile()
  const cleanUsername = data.username.toLowerCase().trim().replace(/^@/, '')
  const cleanEmail = data.email.toLowerCase().trim()

  if (!/^[a-z0-9._]{3,24}$/.test(cleanUsername)) {
    return { success: false, error: 'Username 3-24 ta lotin harf/raqam/._ dan iborat bo‘lishi kerak' }
  }
  if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'Bu username allaqachon band' }
  }
  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Bu email allaqachon ro‘yxatdan o‘tgan' }
  }

  const nextId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1
  const newUser: User = {
    id: nextId,
    name: data.name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password: data.passwordHash,
    gender: data.gender || 'other',
    role: data.role,
    verified: data.role === 'admin' || data.role === 'supporter',
    banned: false,
    avatar: '',
    bio: data.role === 'supporter' ? 'Swaply qo‘llab-quvvatlash xizmati' : '',
    coins: Math.max(0, Math.min(10000, Math.floor(data.coins ?? 5))),
    createdAt: new Date().toISOString(),
  }

  db.users.push(newUser)
  pushAdminLog(db, actor, 'Yangi foydalanuvchi/xodim qo‘shildi', `@${cleanUsername}`, `Rol: ${data.role}`)
  writeDbFile(db)
  return { success: true, user: newUser }
}

export function updateUserRole(
  userId: number,
  role: UserRole,
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; error?: string } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }
  if (user.username === 'amir' && role !== 'admin') {
    return { success: false, error: 'Bosh admin (@amir) rolini pasaytirib bo‘lmaydi' }
  }
  user.role = role
  if (role === 'admin' || role === 'supporter') user.verified = true
  pushAdminLog(db, actor, 'Foydalanuvchi roli o‘zgartirildi', `@${user.username}`, `Yangi rol: ${role}`)
  writeDbFile(db)
  return { success: true }
}

export function toggleUserVerified(
  userId: number,
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; verified?: boolean; error?: string } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }
  user.verified = !user.verified
  db.offers.forEach((o) => {
    if (o.userId === userId) o.verified = user.verified
  })
  pushAdminLog(
    db,
    actor,
    user.verified ? 'Foydalanuvchi tasdiqlandi' : 'Tasdiqlash bekor qilindi',
    `@${user.username}`
  )
  writeDbFile(db)
  return { success: true, verified: user.verified }
}

export function toggleUserBanned(
  userId: number,
  actor: { id: number; username: string; role?: UserRole }
): { success: boolean; banned?: boolean; error?: string } {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }
  if (user.username === 'amir' || user.id === actor.id) {
    return { success: false, error: 'O‘zingizni yoki bosh adminni bloklab bo‘lmaydi' }
  }
  user.banned = !user.banned
  pushAdminLog(
    db,
    actor,
    user.banned ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
    `@${user.username}`
  )
  writeDbFile(db)
  return { success: true, banned: user.banned }
}

export function adminDeleteOffer(
  offerId: string,
  actor?: { id: number; username: string; role?: UserRole }
): boolean {
  const db = ensureDbFile()
  const index = db.offers.findIndex((o) => o.id === offerId)
  if (index === -1) return false
  const [removed] = db.offers.splice(index, 1)
  if (actor) {
    pushAdminLog(db, actor, 'Taklif o‘chirildi', removed.id, `${removed.canTeach} (@${removed.username || 'noma’lum'})`)
  }
  writeDbFile(db)
  return true
}

export function adminAdjustUserCoins(
  userId: number,
  delta: number,
  actor?: { id: number; username: string; role?: UserRole }
): number | null {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return null
  user.coins = Math.max(0, (user.coins || 0) + delta)
  pushTransaction(db, {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    type: 'admin_adjust',
    coinsDelta: delta,
    amountUzs: 0,
    status: 'completed',
    note: actor ? `Admin (@${actor.username}) tomonidan tuzatish` : 'Admin tuzatishi',
    reviewedBy: actor?.username,
    createdAt: new Date().toISOString(),
  })
  if (actor) {
    pushAdminLog(db, actor, 'Tanga balansi tahrirlandi', `@${user.username}`, `${delta > 0 ? `+${delta}` : delta} ◈`)
  }
  writeDbFile(db)
  return user.coins
}

export function getAdminLogs(): AdminLog[] {
  const db = ensureDbFile()
  return (db.adminLogs || []).slice(0, 100)
}
