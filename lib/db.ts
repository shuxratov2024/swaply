import fs from 'fs'
import path from 'path'

export type User = {
  id: number
  name: string
  username: string // Unikal username: @amir, @azizbek.uz
  email: string
  password: string // bcrypt hash
  avatar: string
  bio: string
  gender?: 'male' | 'female' | 'other'
  role?: 'admin' | 'user'
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
  role?: 'admin' | 'user'
  coins?: number
  rating?: string
  verified?: boolean
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

export type DatabaseSchema = {
  users: User[]
  offers: OfferItem[]
  reports?: ReportItem[]
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

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  let data: DatabaseSchema

  if (!fs.existsSync(DB_FILE)) {
    data = {
      users: [],
      offers: DEFAULT_OFFERS,
      reports: [],
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return data
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    data = JSON.parse(raw) as DatabaseSchema
    if (!Array.isArray(data.users)) data.users = []
    if (!Array.isArray(data.offers) || data.offers.length === 0) data.offers = DEFAULT_OFFERS
    if (!Array.isArray(data.reports)) data.reports = []
  } catch (error) {
    console.error('Error reading db file, restoring defaults:', error)
    data = {
      users: [],
      offers: DEFAULT_OFFERS,
      reports: [],
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return data
  }

  let modified = false

  // Foydalanuvchilarda username va gender tekshiruvi
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
    if (u.username === 'amir' || u.email.includes('amir') || u.id === 2) {
      u.role = 'admin'
      modified = true
    }
  })

  // Takliflarda username, location, gender to'ldirish
  data.offers.forEach((o) => {
    if (!o.username && o.userId) {
      const author = data.users.find((u) => u.id === o.userId)
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
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
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
  if (updates.coins !== undefined) user.coins = updates.coins
  if (updates.password !== undefined) user.password = updates.password
  if (updates.phone !== undefined) user.phone = updates.phone
  if (updates.telegram !== undefined) user.telegram = updates.telegram
  if (updates.whatsapp !== undefined) user.whatsapp = updates.whatsapp
  if (updates.lastClaimDate !== undefined) user.lastClaimDate = updates.lastClaimDate

  // Agar foydalanuvchi ismi, avatari yoki jinsi o'zgarsa, takliflarda ham yangilash
  if (updates.name || updates.avatar || updates.username || updates.gender) {
    db.offers.forEach((o) => {
      if (o.userId === id) {
        if (updates.name) o.name = updates.name.trim()
        if (updates.avatar) o.avatar = updates.avatar
        if (updates.username) o.username = updates.username.toLowerCase().trim().replace(/^@/, '')
        if (updates.gender) o.gender = updates.gender
      }
    })
  }

  writeDbFile(db)
  return user
}

// Kontakt ochish uchun tanga yechish
export function spendUserCoin(userId: number, amount: number = 1): { success: boolean; coins?: number; error?: string } {
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
  writeDbFile(db)
  return { success: true, coins: user.coins }
}

// Barcha ommaviy foydalanuvchilar
export function getAllPublicUsers(): PublicUser[] {
  const db = ensureDbFile()
  return db.users.map((u) => {
    const userOffers = db.offers.filter((o) => o.userId === u.id || o.username === u.username)
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
      coins: u.coins,
      rating: '5.0',
      verified: true,
      offersCount: userOffers.length,
      skillsTeach,
      skillsLearn,
      location,
      phone: u.phone,
      telegram: u.telegram,
      whatsapp: u.whatsapp,
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
  let offers = db.offers

  if (genderFilter && genderFilter !== 'all') {
    offers = offers.filter((o) => o.gender === genderFilter)
  }

  if (locationFilter && locationFilter !== 'all') {
    offers = offers.filter((o) => o.location?.toLowerCase().includes(locationFilter.toLowerCase()))
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

export function deleteOffer(offerId: string, userId: number): boolean {
  const db = ensureDbFile()
  const index = db.offers.findIndex((o) => o.id === offerId && (o.userId === userId || userId === 2))
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

export function updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved'): boolean {
  const db = ensureDbFile()
  if (!Array.isArray(db.reports)) return false
  const rep = db.reports.find((r) => r.id === reportId)
  if (!rep) return false
  rep.status = status
  writeDbFile(db)
  return true
}

// ---------------- ADMIN DASHBOARD & ANALYTICS ----------------
export function getAdminStats() {
  const db = ensureDbFile()
  const users = db.users || []
  const offers = db.offers || []
  const reports = db.reports || []

  const maleCount = users.filter((u) => u.gender === 'male').length
  const femaleCount = users.filter((u) => u.gender === 'female').length
  const otherCount = users.filter((u) => !u.gender || u.gender === 'other').length

  const pendingReports = reports.filter((r) => r.status === 'pending').length

  return {
    totalUsers: users.length,
    totalOffers: offers.length,
    totalReports: reports.length,
    pendingReports,
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
      const userOffers = db.offers.filter((o) => o.userId === u.id || o.username === u.username)
      const reportsCount = (db.reports || []).filter(
        (r) => r.targetId === String(u.id) || r.targetUsername === u.username
      ).length

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        gender: u.gender,
        role: u.role,
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

export function adminDeleteOffer(offerId: string): boolean {
  const db = ensureDbFile()
  const index = db.offers.findIndex((o) => o.id === offerId)
  if (index === -1) return false
  db.offers.splice(index, 1)
  writeDbFile(db)
  return true
}

export function adminAdjustUserCoins(userId: number, delta: number): number | null {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return null
  user.coins = Math.max(0, (user.coins || 0) + delta)
  writeDbFile(db)
  return user.coins
}
