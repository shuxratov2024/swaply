import fs from 'fs'
import path from 'path'

export type User = {
  id: number
  name: string
  email: string
  password: string // bcrypt hash
  avatar: string
  bio: string
  coins: number
  lastClaimDate?: string
  createdAt: string
}

export type OfferItem = {
  id: string
  userId?: number
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.9',
    verified: true,
    canTeach: 'UI/UX dizayn',
    wantsToLearn: 'Ingliz tili',
    category: 'UI/UX & 3D',
    description: '3 yillik tajribam bor. Figma’da portfolio va real loyiha ustida birga ishlaymiz.',
    contact: '@malika_design',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-2',
    name: 'Azizbek Rahimov',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '5.0',
    verified: true,
    canTeach: 'React & Next.js',
    wantsToLearn: 'Video montaj',
    category: 'IT & Dasturlash',
    description: 'Frontend’da ishga kirishga tayyorlayman. Siz bilan amaliy loyiha qurishga tayyorman.',
    contact: '@aziz_codes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-3',
    name: 'Sofia Petrova',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85',
    language: 'RU',
    rating: '4.8',
    canTeach: 'IELTS speaking',
    wantsToLearn: '3D Blender',
    category: 'Ingliz tili / IELTS',
    description: 'IELTS 8.0 sohibasi. Speaking klub va talaffuz mashg‘ulotlarini olib boraman.',
    contact: '@sofia_speaks',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-4',
    name: 'Javohir Ergashev',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.9',
    verified: true,
    canTeach: 'Mobilografiya',
    wantsToLearn: 'Python asoslari',
    category: 'Mobilografiya',
    description: 'Telefon bilan cinematic video olish sirlarini ochaman. Ko‘chada amaliy suratga olamiz.',
    contact: '@javohir.frames',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-5',
    name: 'Nargiza Usmonova',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '5.0',
    verified: true,
    canTeach: 'Grafik dizayn',
    wantsToLearn: 'SMM strategiya',
    category: 'UI/UX & 3D',
    description: 'Brending va vizual tizimlarni noldan yaratishni o‘rgataman. Birga moodboard qilamiz.',
    contact: '@nargiza.creates',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-6',
    name: 'Timur Aliyev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=85',
    language: 'EN',
    rating: '4.7',
    canTeach: 'Rus tili',
    wantsToLearn: 'Git & GitHub',
    category: 'IT & Dasturlash',
    description: 'Native rus tilida so‘zlashuvchiman. Haftada ikki marta erkin muloqot qilamiz.',
    contact: '@timur_talks',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-7',
    name: 'Madina Karimova',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.8',
    verified: true,
    canTeach: 'SMM kontent strategiya',
    wantsToLearn: 'Figma prototyping',
    category: 'UI/UX & 3D',
    description: 'Kichik bizneslar uchun kontent reja tuzaman. Siz bilan bir haftalik rejani amalda qilamiz.',
    contact: '@swaply_demo_madina',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-8',
    name: 'Oybek Nazarov',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
    language: 'UZ',
    rating: '4.9',
    verified: true,
    canTeach: 'Python avtomatlashtirish',
    wantsToLearn: 'Ingliz tili',
    category: 'IT & Dasturlash',
    description: 'Takroriy vazifalarni Python bilan yengillashtirishni o‘rgataman. Boshlovchilar uchun ham mos.',
    contact: '@swaply_demo_oybek',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'offer-9',
    name: 'Kamila Xasanova',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85',
    language: 'RU',
    rating: '5.0',
    canTeach: 'Portret fotografiya',
    wantsToLearn: 'React asoslari',
    category: 'Mobilografiya',
    description: 'Tabiiy yorug‘likda portret olish va kadr kompozitsiyasini birga mashq qilamiz.',
    contact: '@swaply_demo_kamila',
    createdAt: new Date().toISOString(),
  },
]

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [],
      offers: DEFAULT_OFFERS,
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as DatabaseSchema
    if (!Array.isArray(parsed.users)) parsed.users = []
    if (!Array.isArray(parsed.offers) || parsed.offers.length === 0) parsed.offers = DEFAULT_OFFERS
    return parsed
  } catch (error) {
    console.error('Error reading db file, restoring defaults:', error)
    const fallback: DatabaseSchema = {
      users: [],
      offers: DEFAULT_OFFERS,
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8')
    return fallback
  }
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

export function findUserById(id: number): User | undefined {
  const db = ensureDbFile()
  return db.users.find((u) => u.id === id)
}

export function createUser(data: {
  name: string
  email: string
  passwordHash: string
  avatar?: string
  bio?: string
}): User {
  const db = ensureDbFile()
  const nextId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1
  const newUser: User = {
    id: nextId,
    name: data.name.trim(),
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

export function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>): User | undefined {
  const db = ensureDbFile()
  const user = db.users.find((u) => u.id === id)
  if (!user) return undefined

  if (updates.name !== undefined) user.name = updates.name.trim()
  if (updates.bio !== undefined) user.bio = updates.bio
  if (updates.avatar !== undefined) user.avatar = updates.avatar
  if (updates.coins !== undefined) user.coins = updates.coins
  if (updates.password !== undefined) user.password = updates.password
  if (updates.lastClaimDate !== undefined) user.lastClaimDate = updates.lastClaimDate

  writeDbFile(db)
  return user
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
  db.offers.unshift(newOffer) // Eng yangisini tepaga qo'shamiz
  writeDbFile(db)
  return newOffer
}
