'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Heart,
  LogIn,
  Mail,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
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
  type AuthUser,
} from './swaply-modals'
import { copy } from './translations'
import { type Locale, type Offer, type MemberUser, avatarOptions } from './types'

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
    contact: '@timur_talks',
    telegram: '@timur_talks',
    phone: '+998 91 222 33 44',
  },
]

export function SwaplyApp() {
  const [locale, setLocale] = useState<Locale>('UZ')
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [members, setMembers] = useState<MemberUser[]>([])
  // Authsiz tashrif buyurganda tangalar soni qat'iyan 0 bo'ladi
  const [coins, setCoins] = useState(0)
  const [claimed, setClaimed] = useState(false)
  const [revealedContacts, setRevealedContacts] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState(copy.UZ.all)
  const [filterOnlyMine, setFilterOnlyMine] = useState(false)
  const [viewMode, setViewMode] = useState<'offers' | 'members' | 'favorites'>('offers')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'auth' | 'offer' | 'profile' | 'wallet' | 'publicProfile' | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberUser | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authReason, setAuthReason] = useState<string>('')
  const [toastMessage, setToastMessage] = useState('')

  // Authsiz holatda hech qanday soxta Dilnoza Karimova ko'rinmaydi!
  const [profile, setProfile] = useState<{ name: string; username?: string; bio: string; avatar: string }>({
    name: '',
    username: '',
    bio: '',
    avatar: '',
  })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const text = copy[locale]
  const categories = [text.all, ...text.categories]

  // Backenddan takliflarni va a'zolarni yuklab olish
  useEffect(() => {
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
    fetchData()

    // Saqlangan sevimlilarni tiklash
    try {
      const savedFavs = localStorage.getItem('swaply_favorites')
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs))
      }
    } catch {}
  }, [])

  // Sahifa yuklanganda token orqali foydalanuvchini tiklash va backend orqali tekshirish
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
        })

        // Backend orqali tokenni tekshirish va ma'lumotlarni yangilash
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
    setProfile({ name: '', username: '', bio: '', avatar: '' })
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

  // Mening e'lonlarim soni
  const myOffersCount = useMemo(() => {
    if (!authUser) return 0
    return offers.filter((o) => o.userId === authUser.id).length
  }, [offers, authUser])

  // Sevimlilar (Bookmarks) ro'yxatini yangilash
  function toggleBookmark(offerId: string) {
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

  // Ko'rinadigan takliflar
  const visibleOffers = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase()

    let list = offers

    if (viewMode === 'favorites') {
      list = list.filter((o) => favorites.includes(o.id))
    }

    return list.filter((offer) => {
      // Agar "Mening takliflarim" tanlangan bo'lsa
      if (filterOnlyMine && authUser) {
        if (offer.userId !== authUser.id) return false
      }

      const selectedCategoryIndex = categories.indexOf(activeCategory)
      const matchesCategory =
        viewMode === 'favorites' ||
        selectedCategoryIndex === 0 ||
        offer.category === copy.UZ.categories[selectedCategoryIndex - 1]

      const searchable =
        `${offer.name} @${offer.username || ''} ${offer.canTeach} ${offer.wantsToLearn} ${offer.category} ${offer.description}`.toLocaleLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeCategory, categories, offers, search, filterOnlyMine, authUser, viewMode, favorites])

  // Qidiruv bo'yicha filtrlangan a'zolar (Foydalanuvchilar qidiruvi)
  const visibleMembers = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^@/, '')
    if (!q) return members

    return members.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(q)
      const usernameMatch = m.username.toLowerCase().includes(q)
      const bioMatch = m.bio.toLowerCase().includes(q)
      const teachMatch = m.skillsTeach?.some((s) => s.toLowerCase().includes(q))
      const learnMatch = m.skillsLearn?.some((s) => s.toLowerCase().includes(q))
      return nameMatch || usernameMatch || bioMatch || teachMatch || learnMatch
    })
  }, [members, search])

  function showToast(message: string) {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 3000)
  }

  // Taklif qo'shish tugmasi bosilganda
  function handleAddOfferClick() {
    if (!isLoggedIn) {
      setAuthMode('register')
      setAuthReason('Taklif qo‘shishingiz uchun ro‘yxatdan o‘ting yoki o‘z hisobingizga kiring')
      setModal('auth')
      showToast('Taklif qo‘shish uchun avval ro‘yxatdan o‘ting yoki hisobingizga kiring')
      return
    }
    setModal('offer')
  }

  // Kunlik bonus tugmasi bosilganda
  async function handleClaimDailyCoin() {
    if (!isLoggedIn) {
      setAuthMode('register')
      setAuthReason('Tangalarni olish uchun ro‘yxatdan o‘ting yoki o‘z hisobingizga kiring')
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

  // Profil bo'limi bosilganda
  function handleProfileClick() {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Profil bo‘limini ko‘rish va tahrirlash uchun ro‘yxatdan o‘ting yoki tizimga kiring')
      setModal('auth')
      showToast('Profil bo‘limi uchun avval tizimga kiring')
      return
    }
    setModal('profile')
  }

  // A'zoning ommaviy profilini ochish
  function openPublicProfile(memberOrOffer: MemberUser | Offer) {
    if ('skillsTeach' in memberOrOffer) {
      setSelectedMember(memberOrOffer)
    } else {
      // Offer dan a'zo ma'lumotini topish yoki yasash
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

  // Kontaktni ochish
  async function unlockContact(offer: Offer) {
    if (!isLoggedIn) {
      setAuthMode('login')
      setAuthReason('Kontaktlarni ochish va bog‘lanish uchun ro‘yxatdan o‘ting yoki hisobingizga kiring')
      setModal('auth')
      showToast('Kontaktni ochish uchun avval tizimga kiring')
      return
    }

    // O'zining taklifi bo'lsa tekinga ochiladi
    if (offer.userId === authUser?.id) {
      setRevealedContacts((current) => [...current, offer.id])
      showToast('Bu sizning o‘zingizning e‘loningiz')
      return
    }

    if (coins < 1) {
      showToast('Kontaktni ochish uchun kamida 1 tanga kerak. Kunlik bonusni oling!')
      return
    }

    const newCoins = coins - 1
    setCoins(newCoins)
    setRevealedContacts((current) => [...current, offer.id])
    showToast(`${offer.name} kontakt ma’lumotlari ochildi!`)

    const token = localStorage.getItem('swaply_token')
    if (token) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ coins: newCoins }),
        })
        if (res.ok && authUser) {
          const updatedUser = { ...authUser, coins: newCoins }
          setAuthUser(updatedUser)
          localStorage.setItem('swaply_user', JSON.stringify(updatedUser))
        }
      } catch (err) {
        console.warn('Coins sync error:', err)
      }
    }
  }

  // Yangi taklif yaratish
  async function createOffer(offerData: {
    canTeach: string
    wantsToLearn: string
    category: string
    description: string
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
        body: JSON.stringify({
          ...offerData,
          language: locale,
        }),
      })

      const data = await res.json()

      if (res.ok && data.offer) {
        setOffers((current) => [data.offer, ...current])
        setActiveCategory(copy[locale].all)
        setSearch('')
        setViewMode('offers')
        setModal(null)
        showToast('Taklifingiz muvaffaqiyatli qo‘shildi!')
      } else {
        showToast(data.error || 'Taklif qo‘shishda xatolik yuz berdi')
      }
    } catch {
      showToast('Serverga ulanishda xatolik yuz berdi')
    }
  }

  // Taklifni o'chirish
  async function handleDeleteOffer(offerId: string) {
    const token = localStorage.getItem('swaply_token')
    if (!token) return

    try {
      const res = await fetch(`/api/offers?id=${offerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (res.ok) {
        setOffers((current) => current.filter((o) => o.id !== offerId))
        showToast('Taklif muvaffaqiyatli o‘chirildi')
      } else {
        showToast(data.error || 'O‘chirishda xatolik yuz berdi')
      }
    } catch {
      showToast('Server bilan bog‘lanishda xatolik')
    }
  }

  function changeLocale(nextLocale: Locale) {
    setActiveCategory(copy[nextLocale].all)
    setLocale(nextLocale)
  }

  function handleAuthDone(user: AuthUser, token: string) {
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
    })

    setModal(null)
    setAuthReason('')
    showToast(`Xush kelibsiz, ${user.name}! (@${user.username})`)
  }

  function handleLogout() {
    handleLogoutCleanup()
    showToast('Hisobdan chiqdingiz')
  }

  async function handleProfileSave(nextProfile: {
    name: string
    username?: string
    bio: string
    avatar: string
  }) {
    setProfile(nextProfile)
    setModal(null)

    const token = localStorage.getItem('swaply_token')
    if (token) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nextProfile),
        })
        const data = await res.json()
        if (res.ok && data.user) {
          setAuthUser(data.user)
          localStorage.setItem('swaply_user', JSON.stringify(data.user))
          // A'zolar ro'yxatida ham yangilaymiz
          setMembers((prev) =>
            prev.map((m) =>
              m.id === data.user.id
                ? { ...m, name: data.user.name, username: data.user.username, avatar: data.user.avatar, bio: data.user.bio }
                : m
            )
          )
          showToast('Profil muvaffaqiyatli yangilandi')
        } else {
          showToast(data.error || 'Profilni yangilashda xatolik')
        }
      } catch (e) {
        console.warn('Profile save sync error:', e)
      }
    }
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
    <main className="app-shell">
      <div aria-hidden="true" className="page-grain" />
      <Topbar
        avatar={profile.avatar}
        claimed={claimed}
        coins={coins}
        isLoggedIn={isLoggedIn}
        locale={locale}
        name={profile.name}
        onAdd={handleAddOfferClick}
        onClaim={handleClaimDailyCoin}
        onEditProfile={handleProfileClick}
        onLocaleChange={changeLocale}
        onLogout={handleLogout}
        onRegister={openRegisterModal}
        onSignIn={openSignInModal}
        onWalletClick={() => setModal('wallet')}
      />

      <div className="page-content">
        <Hero
          activeCategory={activeCategory}
          coinsClaimed={isLoggedIn && claimed}
          locale={locale}
          onAdd={handleAddOfferClick}
          onCategoryChange={(cat) => {
            setActiveCategory(cat)
            setFilterOnlyMine(false)
            setViewMode('offers')
          }}
          onClaim={handleClaimDailyCoin}
          onSearchChange={setSearch}
          search={search}
        />

        {/* Authsiz mehmonlar uchun tushuntirish va chaqiriq banneri */}
        {!isLoggedIn && (
          <section aria-label="Swaply imkoniyatlari" className="guest-banner surface-card">
            <div className="guest-banner-content">
              <div className="guest-banner-badge">
                <Sparkles size={13} />
                <span>Bilim va mahorat barteri</span>
              </div>
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
                        src={member.avatar || avatarOptions[0]}
                      />
                      <div className="member-card-meta">
                        <div className="member-name-row">
                          <h4>{member.name}</h4>
                          {member.verified && <BadgeCheck className="verified-icon" size={14} />}
                        </div>
                        <div className="member-username-row">@{member.username}</div>
                      </div>
                      <span className="rating">
                        <Star fill="currentColor" size={11} /> 5.0
                      </span>
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
                    onToggleBookmark={toggleBookmark}
                    onUnlock={unlockContact}
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

          <span className="footer-right">
            &copy; 2026 Swaply <span /> <a href="#how-it-works">Hamjamiyat qoidalari</a>
          </span>
        </footer>
      </div>

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
          userName={profile.name || 'Foydalanuvchi'}
          userUsername={profile.username}
        />
      )}

      {modal === 'profile' && isLoggedIn && (
        <ProfileModal
          avatar={profile.avatar}
          bio={profile.bio}
          coins={coins}
          createdAt={authUser?.createdAt}
          email={authUser?.email}
          myOffersCount={myOffersCount}
          name={profile.name}
          onClose={() => setModal(null)}
          onSave={handleProfileSave}
          username={profile.username}
        />
      )}

      {modal === 'wallet' && (
        <WalletModal
          claimed={isLoggedIn && claimed}
          coins={coins}
          isLoggedIn={isLoggedIn}
          onClaim={handleClaimDailyCoin}
          onClose={() => setModal(null)}
          onRegister={() => {
            setModal('auth')
            setAuthMode('register')
            setAuthReason('Tangalar olish va hisob ochish uchun ro‘yxatdan o‘ting')
          }}
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
          onUnlockContact={unlockContact}
          revealedContacts={revealedContacts}
        />
      )}

      {toastMessage && (
        <div aria-live="polite" className="toast-message">
          <span className="toast-check">
            <Check aria-hidden="true" size={14} />
          </span>
          {toastMessage}
        </div>
      )}
    </main>
  )
}
