'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Flag,
  Heart,
  LogIn,
  Mail,
  MapPin,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  UnlockKeyhole,
  User,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import { Hero } from './hero'
import { SkillCard } from './skill-card'
import { Topbar } from './topbar'
import {
  AuthModal,
  OfferModal,
  ProfileModal,
  PublicProfileModal,
  WalletModal,
  ConfirmUnlockModal,
  SecurityNoticeModal,
  ReportModal,
  type AuthUser,
} from './swaply-modals'
import { AdminPage } from './admin-page'
import { copy } from './translations'
import { type Locale, type Offer, type MemberUser, type Gender, avatarOptions } from './types'

const initialOffers: Offer[] = [
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
  },
]

export function SwaplyApp() {
  const [locale, setLocale] = useState<Locale>('UZ')
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [members, setMembers] = useState<MemberUser[]>([])
  const [coins, setCoins] = useState(0)
  const [claimed, setClaimed] = useState(false)
  const [revealedContacts, setRevealedContacts] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState(copy.UZ.all)
  const [filterOnlyMine, setFilterOnlyMine] = useState(false)
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [viewMode, setViewMode] = useState<'offers' | 'members' | 'favorites'>('offers')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<
    | 'auth'
    | 'offer'
    | 'profile'
    | 'wallet'
    | 'publicProfile'
    | 'confirmUnlock'
    | 'securityNotice'
    | 'report'
    | 'admin'
    | null
  >(null)

  const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null)
  const [selectedOfferForUnlock, setSelectedOfferForUnlock] = useState<Offer | null>(null)
  const [reportTargetOffer, setReportTargetOffer] = useState<Offer | null>(null)
  const [reportTargetMember, setReportTargetMember] = useState<MemberUser | null>(null)

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authReason, setAuthReason] = useState<string>('')
  const [toastMessage, setToastMessage] = useState('')

  const [profile, setProfile] = useState<{
    name: string
    username?: string
    bio: string
    avatar: string
    gender?: Gender
  }>({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    gender: 'male',
  })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const text = copy[locale]
  const categories = [text.all, ...text.categories]

  async function fetchData() {
    try {
      const [offersRes, usersRes] = await Promise.all([
        fetch('/api/offers'),
        fetch('/api/users'),
      ])

      if (offersRes.ok) {
        const offersData = await offersRes.json()
        if (Array.isArray(offersData.offers) && offersData.offers.length > 0) {
          setOffers(offersData.offers)
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        if (Array.isArray(usersData.users)) {
          setMembers(usersData.users)
        }
      }
    } catch (err) {
      console.warn('Data fetch error, using local fallback:', err)
    }
  }

  useEffect(() => {
    fetchData()

    try {
      const savedFavs = localStorage.getItem('swaply_favorites')
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs))
      }
    } catch {}
  }, [])

  useEffect(() => {
    const savedUser = localStorage.getItem('swaply_user')
    const savedToken = localStorage.getItem('swaply_token')

    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as AuthUser
        setAuthUser(user)
        setIsLoggedIn(true)
        setCoins(user.coins ?? 0)

        const today = new Date().toISOString().split('T')[0]
        if (user.lastClaimDate === today) {
          setClaimed(true)
        }

        setProfile({
          name: user.name,
          username: user.username || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
          gender: user.gender || 'male',
        })

        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              setAuthUser(data.user)
              setCoins(data.user.coins ?? 0)
              if (data.user.lastClaimDate === today) {
                setClaimed(true)
              }
              setProfile({
                name: data.user.name,
                username: data.user.username || '',
                bio: data.user.bio || '',
                avatar: data.user.avatar || '',
                gender: data.user.gender || 'male',
              })
              localStorage.setItem('swaply_user', JSON.stringify(data.user))
            } else {
              handleLogoutCleanup()
            }
          })
          .catch(() => {})
      } catch {
        handleLogoutCleanup()
      }
    } else {
      setCoins(0)
      setIsLoggedIn(false)
      setAuthUser(null)
    }
  }, [])

  function handleLogoutCleanup() {
    localStorage.removeItem('swaply_token')
    localStorage.removeItem('swaply_user')
    setAuthUser(null)
    setIsLoggedIn(false)
    setCoins(0)
    setClaimed(false)
    setProfile({ name: '', username: '', bio: '', avatar: '', gender: 'male' })
    setFilterOnlyMine(false)
  }

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.search-field input')?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const myOffersCount = useMemo(() => {
    if (!authUser) return 0
    return offers.filter((o) => o.userId === authUser.id).length
  }, [offers, authUser])

  function toggleBookmark(offerId: string) {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Takliflarni sevimlilarga saqlash uchun profilingizga kiring!')
      setModal('auth')
      showToast('Sevimlilarga qo‘shish uchun tizimga kiring')
      return
    }

    setFavorites((prev) => {
      const next = prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
      localStorage.setItem('swaply_favorites', JSON.stringify(next))
      if (prev.includes(offerId)) {
        showToast('Taklif sevimlilardan o‘chirildi')
      } else {
        showToast('Taklif sevimlilarga saqlandi ❤️')
      }
      return next
    })
  }

  const visibleOffers = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase()

    let list = offers

    if (viewMode === 'favorites') {
      list = list.filter((o) => favorites.includes(o.id))
    }

    return list.filter((offer) => {
      if (filterOnlyMine && authUser) {
        if (offer.userId !== authUser.id) return false
      }

      if (genderFilter !== 'all') {
        if (offer.gender !== genderFilter) return false
      }

      const selectedCategoryIndex = categories.indexOf(activeCategory)
      const matchesCategory =
        viewMode === 'favorites' ||
        selectedCategoryIndex === 0 ||
        offer.category === copy.UZ.categories[selectedCategoryIndex - 1]

      const searchable =
        `${offer.name} @${offer.username || ''} ${offer.canTeach} ${offer.wantsToLearn} ${offer.category} ${offer.description} ${offer.location || ''}`.toLocaleLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeCategory, categories, offers, search, filterOnlyMine, genderFilter, authUser, viewMode, favorites])

  const visibleMembers = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^@/, '')

    let list = members

    if (genderFilter !== 'all') {
      list = list.filter((m) => m.gender === genderFilter)
    }

    if (!q) return list

    return list.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q)
      const usernameMatch = m.username.toLowerCase().includes(q)
      const bioMatch = m.bio.toLowerCase().includes(q)
      const locMatch = m.location?.toLowerCase().includes(q)
      const teachMatch = m.skillsTeach?.some((s) => s.toLowerCase().includes(q))
      const learnMatch = m.skillsLearn?.some((s) => s.toLowerCase().includes(q))
      return nameMatch || usernameMatch || bioMatch || locMatch || teachMatch || learnMatch
    })
  }, [members, search, genderFilter])

  function showToast(message: string) {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 3500)
  }

  function handleAddOfferClick() {
    if (!isLoggedIn) {
      setAuthMode('register')
      setAuthReason('Taklif qo‘shishingiz uchun avval ro‘yxatdan o‘ting yoki hisobingizga kiring!')
      setModal('auth')
      showToast('Taklif qo‘shish uchun avval tizimga kiring')
      return
    }
    setModal('offer')
  }

  async function handleClaimDailyCoin() {
    if (!isLoggedIn) {
      setAuthMode('register')
      setAuthReason('Kunlik bepul tangani olish uchun avval hisobingizga kiring!')
      setModal('auth')
      showToast('Tangalarni olish uchun avval ro‘yxatdan o‘ting yoki tizimga kiring')
      return
    }

    if (claimed) {
      showToast('Siz bugungi bonus tangani olgansiz. Ertaga yana kiring!')
      return
    }

    const token = localStorage.getItem('swaply_token')
    if (!token) return

    try {
      const res = await fetch('/api/coins/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (res.ok) {
        setCoins(data.coins)
        setClaimed(true)
        if (authUser) {
          const updatedUser = { ...authUser, coins: data.coins }
          setAuthUser(updatedUser)
          localStorage.setItem('swaply_user', JSON.stringify(updatedUser))
        }
        showToast(data.message || 'Kunlik bonus: +1 tanga hamyoningizga qo‘shildi!')
      } else {
        if (data.alreadyClaimed) {
          setClaimed(true)
        }
        showToast(data.error || 'Kunlik bonusni olishda xatolik')
      }
    } catch {
      showToast('Serverga ulanishda xatolik')
    }
  }

  function handleProfileClick() {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Shaxsiy profilingizni boshqarish uchun avval tizimga kiring!')
      setModal('auth')
      showToast('Profil bo‘limi uchun avval tizimga kiring')
      return
    }
    setModal('profile')
  }

  function handleWalletClick() {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Tanga balansi va hamyonni to‘ldirish uchun tizimga kiring!')
      setModal('auth')
      showToast('Hamyon bo‘limi uchun avval tizimga kiring')
      return
    }
    setModal('wallet')
  }

  function openPublicProfile(memberOrOffer: MemberUser | Offer) {
    if ('skillsTeach' in memberOrOffer) {
      setSelectedMember(memberOrOffer)
    } else {
      const found = members.find((m) => m.id === memberOrOffer.userId || m.username === memberOrOffer.username)
      if (found) {
        setSelectedMember(found)
      } else {
        setSelectedMember({
          id: memberOrOffer.userId || 0,
          name: memberOrOffer.name,
          username: memberOrOffer.username || memberOrOffer.name.toLowerCase().replace(/\s+/g, '_'),
          avatar: memberOrOffer.avatar,
          bio: memberOrOffer.description || '',
          gender: memberOrOffer.gender,
          location: memberOrOffer.location || 'Toshkent',
          rating: memberOrOffer.rating,
          verified: memberOrOffer.verified,
          offersCount: 1,
          skillsTeach: [memberOrOffer.canTeach],
          skillsLearn: [memberOrOffer.wantsToLearn],
          phone: memberOrOffer.phone,
          telegram: memberOrOffer.telegram,
          whatsapp: memberOrOffer.whatsapp,
          createdAt: memberOrOffer.createdAt || new Date().toISOString(),
        })
      }
    }
    setModal('publicProfile')
  }

  // Kontakt ochish tugmasi bosilganda:
  function handleUnlockContactClick(offer: Offer) {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Kontakt ma’lumotlarini ochish va bog‘lanish uchun avval tizimga kiring!')
      setModal('auth')
      showToast('Kontaktni ochish uchun avval tizimga kiring')
      return
    }

    if (offer.userId === authUser?.id) {
      setRevealedContacts((current) => [...current, offer.id])
      showToast('Bu sizning o‘zingizning e‘loningiz')
      return
    }

    if (revealedContacts.includes(offer.id)) {
      showToast('Kontakt allaqachon ochilgan')
      return
    }

    // Tasdiqlash dialogini ochish:
    setSelectedOfferForUnlock(offer)
    setModal('confirmUnlock')
  }

  // Tasdiqlash modalida "Ha, ochilsin (-1 tanga)" bosilganda:
  async function handleConfirmUnlock() {
    if (!selectedOfferForUnlock) return

    const token = localStorage.getItem('swaply_token')
    if (!token) {
      setModal('auth')
      return
    }

    try {
      const res = await fetch('/api/coins/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 1 }),
      })
      const data = await res.json()

      if (res.ok) {
        setCoins(data.coins)
        if (authUser) {
          const updatedUser = { ...authUser, coins: data.coins }
          setAuthUser(updatedUser)
          localStorage.setItem('swaply_user', JSON.stringify(updatedUser))
        }

        setRevealedContacts((prev) => [...prev, selectedOfferForUnlock.id])
        showToast(`${selectedOfferForUnlock.name} kontakt ma’lumotlari ochildi!`)

        // 15 soniyalik xavfsizlik eslatmasini ochish!
        setModal('securityNotice')
      } else {
        showToast(data.error || 'Tangalar yetarli emas!')
      }
    } catch {
      showToast('Server bilan bog‘lanishda xatolik yuz berdi')
    }
  }

  // Shikoyat modalini ochish
  function handleOpenReport(offer?: Offer, member?: MemberUser) {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Shikoyat qoldirish uchun avval tizimga kiring!')
      setModal('auth')
      showToast('Shikoyat qoldirish uchun tizimga kiring')
      return
    }

    setReportTargetOffer(offer || null)
    setReportTargetMember(member || null)
    setModal('report')
  }

  async function createOffer(offerData: {
    canTeach: string
    wantsToLearn: string
    category: string
    description: string
    location?: string
    gender?: Gender
    phone?: string
    telegram?: string
    whatsapp?: string
  }) {
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      showToast('Taklif qo‘shish uchun tizimga kirishingiz shart')
      setAuthMode('login')
      setModal('auth')
      return
    }

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offerData),
      })

      const data = await res.json()

      if (res.ok && data.offer) {
        setOffers((current) => [data.offer, ...current])
        setModal(null)
        showToast('Yangi taklifingiz muvaffaqiyatli e‘lon qilindi!')
        fetchData()
      } else {
        showToast(data.error || 'Taklif qo‘shishda xatolik yuz berdi')
      }
    } catch {
      showToast('Serverga ulanishda xatolik yuz berdi')
    }
  }

  async function handleDeleteOffer(offerId: string) {
    const token = localStorage.getItem('swaply_token')
    if (!token) return

    try {
      const res = await fetch(`/api/offers?id=${offerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setOffers((current) => current.filter((o) => o.id !== offerId))
        setFavorites((current) => current.filter((id) => id !== offerId))
        showToast('Taklifingiz muvaffaqiyatli o‘chirildi')
        fetchData()
      } else {
        const data = await res.json()
        showToast(data.error || 'E‘lonni o‘chirishda xatolik')
      }
    } catch {
      showToast('Serverga ulanishda xatolik')
    }
  }

  async function saveProfile(updatedProfile: {
    name: string
    username?: string
    bio: string
    avatar: string
    gender?: Gender
  }) {
    const token = localStorage.getItem('swaply_token')
    if (!token) return

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        setProfile({
          name: data.user.name,
          username: data.user.username || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || '',
          gender: data.user.gender || 'male',
        })
        setAuthUser(data.user)
        localStorage.setItem('swaply_user', JSON.stringify(data.user))
        setModal(null)
        showToast('Profilingiz muvaffaqiyatli saqlandi!')
        fetchData()
      } else {
        showToast(data.error || 'Profilni yangilashda xatolik')
      }
    } catch {
      showToast('Serverga ulanishda xatolik')
    }
  }

  function handleAddCoins(amount: number) {
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      showToast('Tangalarni to‘ldirish uchun tizimga kiring')
      return
    }

    fetch('/api/coins/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (ok && typeof data.coins === 'number') {
          setCoins(data.coins)
          showToast(data.message || `Hamyoningizga +${amount} tanga qo‘shildi!`)
          if (authUser) {
            const updated = { ...authUser, coins: data.coins }
            setAuthUser(updated)
            localStorage.setItem('swaply_user', JSON.stringify(updated))
          }
        } else {
          showToast(data.error || 'Tangalarni qo‘shishda xatolik')
        }
      })
      .catch(() => {
        showToast('Serverga ulanishda xatolik')
      })
  }

  function handleAuthDone(user: AuthUser, token: string) {
    setAuthUser(user)
    setIsLoggedIn(true)
    setCoins(user.coins ?? 5)

    const today = new Date().toISOString().split('T')[0]
    if (user.lastClaimDate === today) {
      setClaimed(true)
    }

    setProfile({
      name: user.name,
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      gender: user.gender || 'male',
    })

    setModal(null)
    setAuthReason('')
    showToast(`Xush kelibsiz, ${user.name}!`)
    fetchData()
  }

  function openSignInModal() {
    setAuthMode('login')
    setAuthReason('')
    setModal('auth')
  }

  function openRegisterModal() {
    setAuthMode('register')
    setAuthReason('')
    setModal('auth')
  }

  return (
    <div className="app-shell">
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {toastMessage}
      </div>

      {toastMessage && (
        <aside aria-label="Xabarnoma" className="toast surface-card">
          <Sparkles aria-hidden="true" size={15} />
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />

      <div className="page-wrap">
        <Topbar
          avatar={profile.avatar}
          claimed={claimed}
          coins={coins}
          isAdmin={authUser?.role === 'admin' || authUser?.username === 'amir'}
          isLoggedIn={isLoggedIn}
          locale={locale}
          name={profile.name}
          onAdd={handleAddOfferClick}
          onClaim={handleClaimDailyCoin}
          onEditProfile={handleProfileClick}
          onLocaleChange={setLocale}
          onLogout={handleLogoutCleanup}
          onOpenAdmin={() => setModal('admin')}
          onRegister={openRegisterModal}
          onSelectUser={openPublicProfile}
          onSignIn={openSignInModal}
          onWalletClick={handleWalletClick}
          username={profile.username}
        />

        <Hero
          activeCategory={activeCategory}
          coinsClaimed={isLoggedIn && claimed}
          locale={locale}
          onAdd={handleAddOfferClick}
          onCategoryChange={setActiveCategory}
          onClaim={handleClaimDailyCoin}
          onSearchChange={setSearch}
          search={search}
        />

        {!isLoggedIn && (
          <section aria-labelledby="guest-banner-title" className="guest-action-banner surface-card">
            <div className="guest-banner-content">
              <span className="guest-banner-badge">
                <Sparkles size={13} /> Yangi a‘zolar uchun +5 bepul tanga
              </span>
              <h3 className="guest-banner-title">O‘z bilimlaringizni boshqalar bilan almashtiring!</h3>
              <p className="guest-banner-text">
                Hech qanday pul to‘lamasdan dasturlash, chet tillari, dizayn va boshqa sohalarda tajriba almashing.
                Boshlash uchun hoziroq ro‘yxatdan o‘ting va 5 ta bepul tanga oling!
              </p>
            </div>
            <div className="guest-banner-actions">
              <button className="button button-primary" onClick={openRegisterModal} type="button">
                <UserPlus size={15} /> Ro‘yxatdan o‘tish
              </button>
              <button className="button button-cream" onClick={openSignInModal} type="button">
                <LogIn size={15} /> Kirish
              </button>
            </div>
          </section>
        )}

        {/* Asosiy navigatsiya rejimi: Takliflar vs A'zolar qidiruvi vs Sevimlilar */}
        <section aria-labelledby="main-view-heading" className="offers-section" id="offers">
          <div className="platform-nav-tabs">
            <button
              className={`platform-tab-btn ${viewMode === 'offers' ? 'tab-btn-active' : ''}`}
              onClick={() => {
                setViewMode('offers')
                setFilterOnlyMine(false)
              }}
              type="button"
            >
              <Tag size={14} />
              <span>Barcha takliflar ({offers.length})</span>
            </button>

            <button
              className={`platform-tab-btn ${viewMode === 'members' ? 'tab-btn-active' : ''}`}
              onClick={() => setViewMode('members')}
              type="button"
            >
              <Users size={14} />
              <span>A‘zolarni qidirish ({members.length})</span>
            </button>

            <button
              className={`platform-tab-btn ${viewMode === 'favorites' ? 'tab-btn-active' : ''}`}
              onClick={() => setViewMode('favorites')}
              type="button"
            >
              <Heart fill={favorites.length > 0 ? '#ef4444' : 'none'} size={14} />
              <span>Sevimlilar ({favorites.length})</span>
            </button>
          </div>

          {/* Jins bo'yicha tezkor filtr (Gender filter) */}
          <div className="gender-filter-bar">
            <span className="gender-filter-label">Jins bo‘yicha filtr:</span>
            <div className="gender-filter-pills">
              <button
                className={`gender-pill ${genderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setGenderFilter('all')}
                type="button"
              >
                Barchasi
              </button>
              <button
                className={`gender-pill ${genderFilter === 'male' ? 'active' : ''}`}
                onClick={() => setGenderFilter('male')}
                type="button"
              >
                👨 Erkak
              </button>
              <button
                className={`gender-pill ${genderFilter === 'female' ? 'active' : ''}`}
                onClick={() => setGenderFilter('female')}
                type="button"
              >
                👩 Ayol
              </button>
            </div>
          </div>

          <div className="section-heading-row">
            <div>
              <div className="section-kicker">
                <span />{' '}
                {viewMode === 'members'
                  ? 'HAMJAMIYAT A‘ZOLARI'
                  : viewMode === 'favorites'
                  ? 'SAQLANGAN TAKLIFLAR'
                  : 'SWAPLY HAMJAMIYATI'}
              </div>
              <h2 id="offers-heading">
                {viewMode === 'members'
                  ? 'Foydalanuvchilar qidiruv platformasi'
                  : viewMode === 'favorites'
                  ? 'Saqlangan takliflaringiz'
                  : text.listings}
                <span className="offer-count">
                  {String(viewMode === 'members' ? visibleMembers.length : visibleOffers.length).padStart(2, '0')}
                </span>
              </h2>
            </div>
            <div className="listing-tools">
              {isLoggedIn && viewMode === 'offers' && (
                <button
                  aria-pressed={filterOnlyMine}
                  className={`my-offers-toggle ${filterOnlyMine ? 'my-offers-toggle-active' : ''}`}
                  onClick={() => setFilterOnlyMine(!filterOnlyMine)}
                  type="button"
                >
                  <Tag size={13} />
                  <span>Mening takliflarim</span>
                  <span className="my-offers-badge">{myOffersCount}</span>
                </button>
              )}
              <span className="online-count">
                <span className="live-dot" /> 24 online
              </span>
              <button
                aria-label="Qidirish"
                className="filter-button"
                onClick={() => document.querySelector<HTMLInputElement>('.search-field input')?.focus()}
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" size={15} /> Qidiruv / Filtr
              </button>
            </div>
          </div>

          {/* Foydalanuvchilar qidiruv bo'limi (Members Grid) */}
          {viewMode === 'members' ? (
            <>
              <div className="members-grid">
                {visibleMembers.map((member) => (
                  <article className="member-card surface-card" key={member.id || member.username}>
                    <div className="member-card-header">
                      <img
                        alt={`${member.name} rasmi`}
                        className="member-card-avatar"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-user.jpg'
                        }}
                        src={member.avatar || '/placeholder-user.jpg'}
                      />
                      <div className="member-card-meta">
                        <div className="member-name-row">
                          <h4>{member.name}</h4>
                          {member.verified && <BadgeCheck className="verified-icon" size={14} />}
                          {member.gender && (
                            <span className="mini-gender-icon" title={member.gender === 'male' ? 'Erkak' : 'Ayol'}>
                              {member.gender === 'male' ? '👨' : '👩'}
                            </span>
                          )}
                        </div>
                        <div className="member-username-row">@{member.username}</div>
                        <div className="member-loc-row">
                          <MapPin size={11} /> {member.location || 'Toshkent'}
                        </div>
                      </div>
                      <div className="member-card-actions-top">
                        <button
                          className="member-report-btn"
                          onClick={() => handleOpenReport(undefined, member)}
                          title="Foydalanuvchi ustidan shikoyat qilish"
                          type="button"
                        >
                          <Flag size={12} />
                        </button>
                        <span className="rating">
                          <Star fill="currentColor" size={11} /> 5.0
                        </span>
                      </div>
                    </div>

                    <p className="member-card-bio">
                      {member.bio || 'Hozircha foydalanuvchi o‘zi haqida izoh qoldirmagan.'}
                    </p>

                    <div className="member-skills-section">
                      {member.skillsTeach && member.skillsTeach.length > 0 && (
                        <div className="member-skill-row">
                          <span className="member-skill-label teach">↗ O‘rgatadi:</span>
                          <span className="member-skill-text">{member.skillsTeach[0]}</span>
                        </div>
                      )}
                      {member.skillsLearn && member.skillsLearn.length > 0 && (
                        <div className="member-skill-row">
                          <span className="member-skill-label learn">↘ O‘rganadi:</span>
                          <span className="member-skill-text">{member.skillsLearn[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="member-card-footer">
                      <span className="member-offers-count">
                        <Tag size={11} /> {member.offersCount || 0} ta taklif
                      </span>
                      <button
                        className="button button-contact"
                        onClick={() => openPublicProfile(member)}
                        type="button"
                      >
                        Profilni ko‘rish <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {visibleMembers.length === 0 && (
                <div className="empty-state">
                  <Search aria-hidden="true" size={22} />
                  <p>«{search}» bo‘yicha hech qanday a‘zo topilmadi.</p>
                  <button onClick={() => setSearch('')} type="button">
                    Qidiruvni tozalash <ArrowUpRight aria-hidden="true" size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Takliflar (Offers) bo'limi */
            <>
              <div className="offers-grid">
                {visibleOffers.map((offer) => (
                  <SkillCard
                    isBookmarked={favorites.includes(offer.id)}
                    isOwner={Boolean(authUser && offer.userId === authUser.id)}
                    key={offer.id}
                    locale={locale}
                    offer={offer}
                    onDelete={handleDeleteOffer}
                    onReport={(o) => handleOpenReport(o, undefined)}
                    onToggleBookmark={toggleBookmark}
                    onUnlock={handleUnlockContactClick}
                    onViewAuthorProfile={openPublicProfile}
                    revealed={revealedContacts.includes(offer.id)}
                  />
                ))}
              </div>

              {visibleOffers.length === 0 && (
                <div className="empty-state">
                  <Search aria-hidden="true" size={22} />
                  <p>
                    {viewMode === 'favorites'
                      ? 'Sizda hali saqlangan sevimli takliflar yo‘q. E‘lonlardagi ❤️ tugmasini bosib saqlang.'
                      : filterOnlyMine
                      ? 'Siz hali taklif qo‘shmagansiz.'
                      : text.noResults}
                  </p>
                  {filterOnlyMine ? (
                    <button className="button button-primary" onClick={handleAddOfferClick} type="button">
                      Birinchi taklifingizni qo‘shing <ArrowUpRight aria-hidden="true" size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearch('')
                        setActiveCategory(text.all)
                        setGenderFilter('all')
                        setFilterOnlyMine(false)
                        setViewMode('offers')
                      }}
                      type="button"
                    >
                      Filtrlarni tozalash <ArrowUpRight aria-hidden="true" size={14} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="site-footer">
          <a aria-label="Swaply bosh sahifaga" className="footer-brand" href="#top">
            <span className="brand-icon">
              <ArrowUpRight aria-hidden="true" size={16} />
            </span>{' '}
            swaply<span className="brand-dot">.</span>
          </a>
          <span>Vaqtingiz — eng qimmat valyuta.</span>

          <div className="footer-contact">
            <Mail aria-hidden="true" size={13} style={{ opacity: 0.7 }} />
            <span>{text.contactUs}:</span>
            <a className="footer-email-link" href="mailto:swaplyuz@google.com">
              swaplyuz@google.com
            </a>
          </div>

          <div className="footer-complaint">
            <button
              className="footer-complaint-btn"
              onClick={() => handleOpenReport()}
              type="button"
            >
              <Flag size={12} /> Shikoyat yoki taklif qoldirish
            </button>
          </div>

          <span className="footer-right">
            &copy; 2026 Swaply <span /> <a href="#how-it-works">Hamjamiyat qoidalari</a>
          </span>
        </footer>
      </div>

      {/* ---------------- MODALLAR ---------------- */}
      {modal === 'auth' && (
        <AuthModal
          authReason={authReason}
          initialMode={authMode}
          onClose={() => {
            setModal(null)
            setAuthReason('')
          }}
          onDone={handleAuthDone}
        />
      )}

      {modal === 'offer' && (
        <OfferModal
          onClose={() => setModal(null)}
          onSave={createOffer}
          userAvatar={profile.avatar}
          userGender={profile.gender}
          userName={profile.name}
          userUsername={profile.username}
        />
      )}

      {modal === 'profile' && (
        <ProfileModal
          avatar={profile.avatar}
          bio={profile.bio}
          coins={coins}
          createdAt={authUser?.createdAt}
          email={authUser?.email}
          gender={profile.gender}
          myOffersCount={myOffersCount}
          name={profile.name}
          onClose={() => setModal(null)}
          onSave={saveProfile}
          username={profile.username}
        />
      )}

      {modal === 'confirmUnlock' && selectedOfferForUnlock && (
        <ConfirmUnlockModal
          offer={selectedOfferForUnlock}
          onCancel={() => {
            setModal(null)
            setSelectedOfferForUnlock(null)
          }}
          onConfirm={handleConfirmUnlock}
          onTopUp={() => setModal('wallet')}
          userCoins={coins}
        />
      )}

      {modal === 'securityNotice' && (
        <SecurityNoticeModal onClose={() => setModal(null)} />
      )}

      {modal === 'report' && (
        <ReportModal
          onClose={() => {
            setModal(null)
            setReportTargetOffer(null)
            setReportTargetMember(null)
          }}
          onDone={(msg) => showToast(msg)}
          targetMember={reportTargetMember || undefined}
          targetOffer={reportTargetOffer || undefined}
        />
      )}

      {modal === 'admin' && (
        <AdminPage onClose={() => setModal(null)} />
      )}

      {modal === 'wallet' && (
        <WalletModal
          coins={coins}
          onAddCoins={handleAddCoins}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'publicProfile' && selectedMember && (
        <PublicProfileModal
          member={selectedMember}
          offers={offers}
          onClose={() => {
            setModal(null)
            setSelectedMember(null)
          }}
          onReport={(m) => handleOpenReport(undefined, m)}
          onUnlockContact={handleUnlockContactClick}
          revealedContacts={revealedContacts}
        />
      )}
    </div>
  )
}
