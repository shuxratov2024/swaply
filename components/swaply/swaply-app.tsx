'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, Mail, Search, SlidersHorizontal } from 'lucide-react'
import { Hero } from './hero'
import { SkillCard } from './skill-card'
import { Topbar } from './topbar'
import { AuthModal, OfferModal, ProfileModal } from './swaply-modals'
import { copy } from './translations'
import type { Locale, Offer } from './types'

const initialOffers: Offer[] = [
  {
    id: 'offer-1', name: 'Malika Saidova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
    language: 'UZ', rating: '4.9', verified: true, canTeach: 'UI/UX dizayn', wantsToLearn: 'Ingliz tili', category: 'UI/UX & 3D',
    description: '3 yillik tajribam bor. Figma’da portfolio va real loyiha ustida birga ishlaymiz.', contact: '@malika_design',
  },
  {
    id: 'offer-2', name: 'Azizbek Rahimov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
    language: 'UZ', rating: '5.0', verified: true, canTeach: 'React & Next.js', wantsToLearn: 'Video montaj', category: 'IT & Dasturlash',
    description: 'Frontend’da ishga kirishga tayyorlayman. Siz bilan amaliy loyiha qurishga tayyorman.', contact: '@aziz_codes',
  },
  {
    id: 'offer-3', name: 'Sofia Petrova', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85',
    language: 'RU', rating: '4.8', canTeach: 'IELTS speaking', wantsToLearn: '3D Blender', category: 'Ingliz tili / IELTS',
    description: 'IELTS 8.0 sohibasi. Speaking klub va talaffuz mashg‘ulotlarini olib boraman.', contact: '@sofia_speaks',
  },
  {
    id: 'offer-4', name: 'Javohir Ergashev', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85',
    language: 'UZ', rating: '4.9', verified: true, canTeach: 'Mobilografiya', wantsToLearn: 'Python asoslari', category: 'Mobilografiya',
    description: 'Telefon bilan cinematic video olish sirlarini ochaman. Ko‘chada amaliy suratga olamiz.', contact: '@javohir.frames',
  },
  {
    id: 'offer-5', name: 'Nargiza Usmonova', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=85',
    language: 'UZ', rating: '5.0', verified: true, canTeach: 'Grafik dizayn', wantsToLearn: 'SMM strategiya', category: 'UI/UX & 3D',
    description: 'Brending va vizual tizimlarni noldan yaratishni o‘rgataman. Birga moodboard qilamiz.', contact: '@nargiza.creates',
  },
  {
    id: 'offer-6', name: 'Timur Aliyev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=85',
    language: 'EN', rating: '4.7', canTeach: 'Rus tili', wantsToLearn: 'Git & GitHub', category: 'IT & Dasturlash',
    description: 'Native rus tilida so‘zlashuvchiman. Haftada ikki marta erkin muloqot qilamiz.', contact: '@timur_talks',
  },
]

const profileAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85'

type AuthUser = {
  id: number
  name: string
  email: string
  avatar?: string
  bio?: string
  coins?: number
}

export function SwaplyApp() {
  const [locale, setLocale] = useState<Locale>('UZ')
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [coins, setCoins] = useState(5)
  const [claimed, setClaimed] = useState(false)
  const [revealedContacts, setRevealedContacts] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState(copy.UZ.all)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'auth' | 'offer' | 'profile' | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [profile, setProfile] = useState({ name: 'Dilnoza Karimova', bio: 'Dizayn va yangi g‘oyalar bilan yashayman. Hozir ingliz tilini kuchaytiryapman.', avatar: profileAvatar })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const text = copy[locale]
  const categories = [text.all, ...text.categories]

  // Backenddan takliflarni yuklab olish
  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/offers')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.offers) && data.offers.length > 0) {
            setOffers(data.offers)
          }
        }
      } catch (err) {
        console.warn('Offers fetch error, using local fallback:', err)
      }
    }
    fetchOffers()
  }, [])

  // Sahifa yuklanganda token dan foydalanuvchini tiklash va backend orqali tekshirish
  useEffect(() => {
    const savedUser = localStorage.getItem('swaply_user')
    const savedToken = localStorage.getItem('swaply_token')
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as AuthUser
        setAuthUser(user)
        setIsLoggedIn(true)
        if (user.coins !== undefined) {
          setCoins(user.coins)
        }
        setProfile((prev) => ({
          ...prev,
          name: user.name,
          bio: user.bio || prev.bio,
          avatar: user.avatar || prev.avatar,
        }))

        // Backend orqali tokenni tekshirish va ma'lumotlarni yangilash
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              setAuthUser(data.user)
              if (data.user.coins !== undefined) setCoins(data.user.coins)
              setProfile((prev) => ({
                ...prev,
                name: data.user.name,
                bio: data.user.bio || prev.bio,
                avatar: data.user.avatar || prev.avatar,
              }))
              localStorage.setItem('swaply_user', JSON.stringify(data.user))
            } else {
              // Token eskirgan bo'lsa
              localStorage.removeItem('swaply_token')
              localStorage.removeItem('swaply_user')
              setAuthUser(null)
              setIsLoggedIn(false)
            }
          })
          .catch(() => {})
      } catch {
        localStorage.removeItem('swaply_token')
        localStorage.removeItem('swaply_user')
      }
    }
  }, [])

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

  const visibleOffers = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase()
    return offers.filter((offer) => {
      const selectedCategoryIndex = categories.indexOf(activeCategory)
      const matchesCategory = selectedCategoryIndex === 0 || offer.category === copy.UZ.categories[selectedCategoryIndex - 1]
      const searchable = `${offer.name} ${offer.canTeach} ${offer.wantsToLearn} ${offer.category} ${offer.description}`.toLocaleLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeCategory, categories, offers, search])

  function showToast(message: string) {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 2800)
  }

  function claimDailyCoin() {
    if (claimed) return
    const newCoins = coins + 1
    setCoins(newCoins)
    setClaimed(true)
    showToast('Kunlik bonus: +1 tanga hamyoningizga qo‘shildi')

    // Agar tizimga kirgan bo'lsa, serverda ham yangilash
    const token = localStorage.getItem('swaply_token')
    if (token) {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coins: newCoins }),
      }).catch(() => {})
    }
  }

  function unlockContact(offer: Offer) {
    if (coins < 1) {
      showToast('Kontaktni ochish uchun tangalar yetarli emas')
      setModal('auth')
      return
    }
    const newCoins = coins - 1
    setCoins(newCoins)
    setRevealedContacts((current) => [...current, offer.id])
    showToast(`${offer.name} bilan bog‘lanishingiz mumkin`)

    const token = localStorage.getItem('swaply_token')
    if (token) {
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coins: newCoins }),
      }).catch(() => {})
    }
  }

  async function createOffer(offer: Omit<Offer, 'id'>) {
    const token = localStorage.getItem('swaply_token')
    const payload = {
      ...offer,
      name: profile.name,
      avatar: profile.avatar,
    }

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setOffers((current) => [data.offer, ...current])
      } else {
        // Fallback agar backend xato bersa ham lokal qo'shamiz
        setOffers((current) => [{ ...offer, name: profile.name, avatar: profile.avatar, id: `offer-${Date.now()}` }, ...current])
      }
    } catch {
      setOffers((current) => [{ ...offer, name: profile.name, avatar: profile.avatar, id: `offer-${Date.now()}` }, ...current])
    }

    setActiveCategory(copy[locale].all)
    setSearch('')
    setModal(null)
    showToast('Taklif muvaffaqiyatli qo‘shildi!')
  }

  function changeLocale(nextLocale: Locale) {
    setActiveCategory(copy[nextLocale].all)
    setLocale(nextLocale)
  }

  function handleAuthDone(user: AuthUser, token: string) {
    setAuthUser(user)
    setIsLoggedIn(true)
    if (user.coins !== undefined) {
      setCoins(user.coins)
    }
    setProfile((prev) => ({
      ...prev,
      name: user.name,
      bio: user.bio || prev.bio,
      avatar: user.avatar || prev.avatar,
    }))
    setModal(null)
    showToast(`Xush kelibsiz, ${user.name}!`)
  }

  function handleLogout() {
    localStorage.removeItem('swaply_token')
    localStorage.removeItem('swaply_user')
    setAuthUser(null)
    setIsLoggedIn(false)
    setCoins(5)
    setProfile({ name: 'Dilnoza Karimova', bio: 'Dizayn va yangi g‘oyalar bilan yashayman. Hozir ingliz tilini kuchaytiryapman.', avatar: profileAvatar })
    showToast('Hisobdan chiqdingiz')
  }

  async function handleProfileSave(nextProfile: { name: string; bio: string; avatar: string }) {
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
        if (res.ok) {
          const data = await res.json()
          setAuthUser(data.user)
          localStorage.setItem('swaply_user', JSON.stringify(data.user))
        }
      } catch (e) {
        console.warn('Profile save sync error:', e)
      }
    }
    showToast('Profil muvaffaqiyatli yangilandi')
  }

  return (
    <main className="app-shell">
      <div aria-hidden="true" className="page-grain" />
      <Topbar
        coins={coins}
        claimed={claimed}
        name={profile.name}
        avatar={profile.avatar}
        locale={locale}
        isLoggedIn={isLoggedIn}
        onLocaleChange={changeLocale}
        onClaim={claimDailyCoin}
        onAdd={() => setModal('offer')}
        onEditProfile={() => setModal('profile')}
        onSignIn={() => setModal('auth')}
        onLogout={handleLogout}
      />

      <div className="page-content">
        <Hero locale={locale} activeCategory={activeCategory} search={search} coinsClaimed={claimed} onCategoryChange={setActiveCategory} onSearchChange={setSearch} onClaim={claimDailyCoin} onAdd={() => setModal('offer')} />

        <section aria-labelledby="offers-heading" className="offers-section" id="offers">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker"><span /> SWAPLY HAMJAMIYATI</div>
              <h2 id="offers-heading">{text.listings}<span className="offer-count">{String(visibleOffers.length).padStart(2, '0')}</span></h2>
            </div>
            <div className="listing-tools">
              <span className="online-count"><span className="live-dot" /> 24 online</span>
              <button aria-label="Filtrlar" className="filter-button" onClick={() => document.querySelector<HTMLInputElement>('.search-field input')?.focus()} type="button"><SlidersHorizontal aria-hidden="true" size={15} /> Filtrlar</button>
            </div>
          </div>

          <div className="offers-grid">
            {visibleOffers.map((offer) => (
              <SkillCard key={offer.id} offer={offer} locale={locale} revealed={revealedContacts.includes(offer.id)} onUnlock={unlockContact} />
            ))}
          </div>
          {visibleOffers.length === 0 && (
            <div className="empty-state"><Search aria-hidden="true" size={22} /><p>{text.noResults}</p><button onClick={() => { setSearch(''); setActiveCategory(text.all) }} type="button">Filtrlarni tozalash <ArrowUpRight aria-hidden="true" size={14} /></button></div>
          )}
        </section>

        <footer className="site-footer">
          <a aria-label="Swaply bosh sahifaga" className="footer-brand" href="#top">
            <span className="brand-icon"><ArrowUpRight aria-hidden="true" size={16} /></span> swaply<span className="brand-dot">.</span>
          </a>
          <span>Vaqtingiz — eng qimmat valyuta.</span>

          <div className="footer-contact">
            <Mail aria-hidden="true" size={13} style={{ opacity: 0.7 }} />
            <span>{text.contactUs}:</span>
            <a className="footer-email-link" href="mailto:swaplyuz@google.com">swaplyuz@google.com</a>
          </div>

          <span className="footer-right">
            &copy; 2026 Swaply <span /> <a href="#how-it-works">Hamjamiyat qoidalari</a>
          </span>
        </footer>
      </div>

      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} onDone={handleAuthDone} />}
      {modal === 'offer' && <OfferModal onClose={() => setModal(null)} onSave={createOffer} />}
      {modal === 'profile' && <ProfileModal name={profile.name} bio={profile.bio} avatar={profile.avatar} onClose={() => setModal(null)} onSave={handleProfileSave} />}
      {toastMessage && <div aria-live="polite" className="toast-message"><span className="toast-check"><Check aria-hidden="true" size={14} /></span>{toastMessage}</div>}
    </main>
  )
}
