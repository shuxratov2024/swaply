'use client'

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building,
  Camera,
  Check,
  ChevronRight,
  Coins,
  Copy,
  ExternalLink,
  Flag,
  Globe2,
  HelpCircle,
  ImagePlus,
  Info,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UnlockKeyhole,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { fetchWithAuth } from '@/lib/api'
import { ModalFrame } from './modal-frame'
import { type Offer, type MemberUser, type ReportItem, avatarOptions, type Gender } from './types'

export type AuthUser = {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  gender?: Gender
  role?: 'admin' | 'user'
  coins?: number
  phone?: string
  telegram?: string
  whatsapp?: string
  lastClaimDate?: string
  createdAt?: string
}

// ---------------- AUTH MODAL (LOGIN & REGISTER) ----------------
export function AuthModal({
  onClose,
  onDone,
  initialMode = 'login',
  authReason,
  onModeChange,
}: {
  onClose: () => void
  onDone: (user: AuthUser, token: string) => void
  initialMode?: 'login' | 'register'
  authReason?: string
  onModeChange?: (mode: 'login' | 'register') => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Username qoidalarini jonli tekshirish (debounced)
  useEffect(() => {
    if (mode !== 'register' || !username.trim()) {
      setUsernameStatus(null)
      return
    }

    const clean = username.trim().replace(/^@/, '')
    if (clean.length < 3) {
      setUsernameStatus({ checking: false, available: false, error: 'Kamida 3 ta belgi' })
      return
    }

    // Nuqta yoki chiziqcha oldida yoki orqasida kelmasligi kerak
    if (clean.startsWith('.') || clean.startsWith('_')) {
      setUsernameStatus({ checking: false, available: false, error: 'Boshida nuqta yoki chiziqcha bo‘lishi mumkin emas' })
      return
    }

    if (clean.endsWith('.') || clean.endsWith('_')) {
      setUsernameStatus({ checking: false, available: false, error: 'Oxirida nuqta yoki chiziqcha bo‘lishi mumkin emas' })
      return
    }

    if (/[._]{2,}/.test(clean)) {
      setUsernameStatus({ checking: false, available: false, error: 'Ketma-ket nuqta yoki chiziqcha mumkin emas' })
      return
    }

    setUsernameStatus({ checking: true })
    const timer = setTimeout(async () => {
      try {
        const res = await fetchWithAuth(`/api/users/check-username?username=${encodeURIComponent(clean)}`)
        const data = await res.json()
        if (data.available) {
          setUsernameStatus({ checking: false, available: true })
        } else {
          setUsernameStatus({ checking: false, available: false, error: data.error || 'Bu username band' })
        }
      } catch {
        setUsernameStatus(null)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [username, mode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (mode === 'register') {
      const cleanUsername = username.trim().replace(/^@/, '')
      if (cleanUsername.length < 3) {
        setError('Username kamida 3 ta belgidan iborat bo‘lishi kerak')
        return
      }

      if (cleanUsername.startsWith('.') || cleanUsername.startsWith('_') || cleanUsername.endsWith('.') || cleanUsername.endsWith('_')) {
        setError('Username boshida yoki oxirida nuqta (.) yoki tagchiziq (_) bo‘lishi mumkin emas!')
        return
      }

      if (usernameStatus && !usernameStatus.available) {
        setError(usernameStatus.error || 'Bu username band, boshqasini tanlang')
        return
      }

      if (password !== confirmPassword) {
        setError('Kiritilgan parollar bir-biriga mos kelmaydi')
        return
      }
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload =
        mode === 'register'
          ? {
              name: name.trim(),
              username: username.trim().replace(/^@/, ''),
              gender,
              email: email.trim(),
              password,
            }
          : { email: email.trim(), password }

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Xatolik yuz berdi')
        return
      }

      localStorage.setItem('swaply_token', data.token)
      localStorage.setItem('swaply_user', JSON.stringify(data.user))

      onDone(data.user, data.token)
    } catch {
      setError('Serverga ulanishda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalFrame
      description={mode === 'login' ? 'Hisobingizga kiring va bilim almashishni davom eting' : 'Swaply hamjamiyatiga qo‘shiling va yangi ko‘nikmalarni kashf qiling'}
      onClose={onClose}
      size="narrow"
      title={mode === 'login' ? 'Tizimga kirish' : 'Ro‘yxatdan o‘tish'}
    >
      {authReason && (
        <div className="auth-reason-banner">
          <Sparkles aria-hidden="true" size={16} />
          <span>{authReason}</span>
        </div>
      )}

      {/* Segmented Mode Switcher */}
      <div className="auth-mode-segmented">
        <button
          className={`auth-segment-btn ${mode === 'login' ? 'active' : ''}`}
          onClick={() => {
            setMode('login')
            onModeChange?.('login')
            setError('')
          }}
          type="button"
        >
          <LogIn size={14} />
          <span>Kirish</span>
        </button>
        <button
          className={`auth-segment-btn ${mode === 'register' ? 'active' : ''}`}
          onClick={() => {
            setMode('register')
            onModeChange?.('register')
            setError('')
          }}
          type="button"
        >
          <UserPlus size={14} />
          <span>Ro‘yxatdan o‘tish</span>
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form modern-auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <div className="form-group-modern">
              <label className="form-label" htmlFor="auth-name">
                Ism va Familiya *
              </label>
              <div className="input-with-icon">
                <User className="field-icon" size={15} />
                <input
                  autoFocus
                  className="form-control"
                  id="auth-name"
                  maxLength={48}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Amir Shukhratov"
                  required
                  type="text"
                  value={name}
                />
              </div>
            </div>

            <div className="form-group-modern">
              <div className="label-with-hint">
                <label className="form-label" htmlFor="auth-username">
                  Platformadagi @username *
                </label>
                <small className="hint-text">faqat a-z, 0-9, . va _</small>
              </div>
              <div className="username-field-wrap">
                <span className="username-prefix">@</span>
                <input
                  className={`form-control username-input ${
                    usernameStatus?.available === true
                      ? 'input-valid'
                      : usernameStatus?.available === false
                      ? 'input-invalid'
                      : ''
                  }`}
                  id="auth-username"
                  maxLength={24}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  placeholder="amir.dev"
                  required
                  type="text"
                  value={username}
                />
                {usernameStatus?.checking && (
                  <span className="username-status-icon">
                    <Loader2 className="animate-spin" size={14} />
                  </span>
                )}
                {usernameStatus?.available === true && (
                  <span className="username-status-icon status-ok" title="Username bo‘sh">
                    <Check size={14} />
                  </span>
                )}
                {usernameStatus?.available === false && (
                  <span className="username-status-icon status-bad" title={usernameStatus.error}>
                    <X size={14} />
                  </span>
                )}
              </div>
              {usernameStatus?.error && <small className="username-hint-error">⚠️ {usernameStatus.error}</small>}
              {usernameStatus?.available && <small className="username-hint-ok">✓ Bu username mavjud va bo‘sh</small>}
            </div>

            {/* Jins tanlash (Gender selection) */}
            <div className="form-group-modern">
              <label className="form-label">Jinsingiz *</label>
              <div className="gender-selector-row">
                <button
                  className={`gender-select-btn ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                  type="button"
                >
                  <span className="gender-icon">👨</span>
                  <span>Erkak</span>
                </button>
                <button
                  className={`gender-select-btn ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                  type="button"
                >
                  <span className="gender-icon">👩</span>
                  <span>Ayol</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div className="form-group-modern">
          <label className="form-label" htmlFor="auth-email">
            {mode === 'login' ? 'Email manzil yoki @username *' : 'Email manzil *'}
          </label>
          <div className="input-with-icon">
            <Mail className="field-icon" size={15} />
            <input
              autoFocus={mode === 'login'}
              className="form-control"
              id="auth-email"
              maxLength={100}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'email@example.com yoki @username' : 'email@example.com'}
              required
              type={mode === 'login' ? 'text' : 'email'}
              value={email}
            />
          </div>
        </div>

        <div className="form-group-modern">
          <label className="form-label" htmlFor="auth-password">
            Parol *
          </label>
          <input
            className="form-control"
            id="auth-password"
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 6 ta belgi"
            required
            type="password"
            value={password}
          />
        </div>

        {mode === 'register' && (
          <div className="form-group-modern">
            <label className="form-label" htmlFor="auth-confirm-password">
              Parolni tasdiqlang *
            </label>
            <input
              className="form-control"
              id="auth-confirm-password"
              minLength={6}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolni qayta kiriting"
              required
              type="password"
              value={confirmPassword}
            />
          </div>
        )}

        <button className="button button-primary auth-submit-btn" disabled={loading} type="submit">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={15} /> Kutilmoqda...
            </>
          ) : mode === 'login' ? (
            <>
              Kirish <ArrowUpRight size={15} />
            </>
          ) : (
            <>
              Ro‘yxatdan o‘tish (+5 tanga) <ArrowUpRight size={15} />
            </>
          )}
        </button>
      </form>

      <p className="privacy-note">
        <ShieldCheck aria-hidden="true" size={13} /> Ma’lumotlaringiz xavfsiz va shifrlangan holda saqlanadi
      </p>
    </ModalFrame>
  )
}

// ---------------- OFFER MODAL (TAKLIF QO'SHISH) ----------------
export function OfferModal({
  userName,
  userAvatar,
  userUsername,
  userGender,
  onClose,
  onSave,
}: {
  userName: string
  userAvatar: string
  userUsername?: string
  userGender?: Gender
  onClose: () => void
  onSave: (offer: {
    canTeach: string
    wantsToLearn: string
    category: string
    description: string
    location?: string
    gender?: Gender
    phone?: string
    telegram?: string
    whatsapp?: string
  }) => void
}) {
  const [canTeach, setCanTeach] = useState('')
  const [wantsToLearn, setWantsToLearn] = useState('')
  const [category, setCategory] = useState('IT & Dasturlash')
  const [location, setLocation] = useState('Toshkent, Chilonzor')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState(userUsername ? `@${userUsername}` : '')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState('')

  const locationPresets = [
    'Toshkent, Chilonzor',
    'Toshkent, Yunusobod',
    'Toshkent, Mirzo Ulug‘bek',
    'Samarqand',
    'Buxoro',
    'Farg‘ona',
    'Andijon',
    'Masofaviy (Onlayn)',
  ]

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const cleanPhone = phone.trim()
    const cleanTelegram = telegram.trim()
    const cleanWhatsapp = whatsapp.trim()

    if (!cleanPhone && !cleanTelegram && !cleanWhatsapp) {
      setError('Kamida bitta aloqa vositasini (Telefon raqam, Telegram yoki WhatsApp) kiritishingiz shart')
      return
    }

    onSave({
      canTeach: canTeach.trim(),
      wantsToLearn: wantsToLearn.trim(),
      category,
      location: location.trim(),
      gender: userGender,
      description: description.trim(),
      phone: cleanPhone || undefined,
      telegram: cleanTelegram || undefined,
      whatsapp: cleanWhatsapp || undefined,
    })
  }

  return (
    <ModalFrame
      description="O‘zingiz bilgan mahoratni boshqalarga taklif qiling va yangi ko‘nikmaga almashing"
      onClose={onClose}
      size="wide"
      title="Yangi taklif qo‘shish"
    >
      <div className="offer-creator-preview">
        <img
          alt={`${userName} profili`}
          className="offer-creator-avatar"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-user.jpg'
          }}
          src={userAvatar || avatarOptions[0]}
        />
        <div>
          <span className="offer-creator-label">E‘lon muallifi</span>
          <strong className="offer-creator-name">
            {userName} {userUsername && <span className="creator-username">(@{userUsername})</span>}
          </strong>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form modern-offer-form" onSubmit={submitOffer}>
        <div className="skills-input-duo">
          <div className="form-group-modern">
            <label className="form-label" htmlFor="teach-skill">
              <span className="skill-label-mark teach-mark">↗</span> Qo‘limdan keladi (O‘rgataman) *
            </label>
            <input
              autoFocus
              className="form-control"
              id="teach-skill"
              maxLength={60}
              onChange={(event) => setCanTeach(event.target.value)}
              placeholder="Masalan: Figma’da UI/UX yoki Python"
              required
              value={canTeach}
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label" htmlFor="learn-skill">
              <span className="skill-label-mark learn-mark">↘</span> Menga kerak (O‘rganmoqchiman) *
            </label>
            <input
              className="form-control"
              id="learn-skill"
              maxLength={60}
              onChange={(event) => setWantsToLearn(event.target.value)}
              placeholder="Masalan: Ingliz tili speaking yoki Video montaj"
              required
              value={wantsToLearn}
            />
          </div>
        </div>

        <div className="form-row-duo">
          <div className="form-group-modern">
            <label className="form-label" htmlFor="offer-category">
              Kategoriya *
            </label>
            <select
              className="form-control form-select"
              id="offer-category"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option>IT & Dasturlash</option>
              <option>Ingliz tili / IELTS</option>
              <option>UI/UX & 3D</option>
              <option>Mobilografiya</option>
              <option>Boshqa yo‘nalish</option>
            </select>
          </div>

          <div className="form-group-modern">
            <label className="form-label" htmlFor="offer-location">
              <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
              Joylashuv (Uchrashib ishlash uchun) *
            </label>
            <input
              className="form-control"
              id="offer-location"
              maxLength={40}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Masalan: Toshkent, Chilonzor yoki Samarqand"
              required
              value={location}
            />
          </div>
        </div>

        {/* Quick location chips */}
        <div className="location-chips-row">
          <small className="chips-hint">Tezkor tanlash:</small>
          {locationPresets.slice(0, 4).map((city) => (
            <button
              className={`location-chip ${location === city ? 'active' : ''}`}
              key={city}
              onClick={() => setLocation(city)}
              type="button"
            >
              {city}
            </button>
          ))}
        </div>

        <div className="form-group-modern">
          <label className="form-label" htmlFor="offer-description">
            Batafsil tavsif va almashish formati *
          </label>
          <textarea
            className="form-control form-textarea"
            id="offer-description"
            maxLength={320}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Qanday formatda ko‘rishasiz? Qancha vaqt ajrata olasiz? Amaliy tajribangiz qanday?"
            required
            rows={3}
            value={description}
          />
        </div>

        <div className="contact-inputs-section">
          <div className="contact-section-title">
            <span>Aloqa ma’lumotlari</span>
            <small>Kontakt faqat tanga sarflagan foydalanuvchiga ko‘rinadi</small>
          </div>

          <div className="contact-fields-grid">
            <div className="input-with-icon">
              <Phone className="field-icon" size={14} />
              <input
                className="form-control"
                id="offer-phone"
                maxLength={25}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Telefon: +998 90 123 45 67"
                type="tel"
                value={phone}
              />
            </div>

            <div className="input-with-icon">
              <Send className="field-icon" size={14} />
              <input
                className="form-control"
                id="offer-telegram"
                maxLength={35}
                onChange={(event) => setTelegram(event.target.value)}
                placeholder="Telegram: @username"
                type="text"
                value={telegram}
              />
            </div>

            <div className="input-with-icon">
              <MessageCircle className="field-icon" size={14} />
              <input
                className="form-control"
                id="offer-whatsapp"
                maxLength={25}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="WhatsApp raqam"
                type="text"
                value={whatsapp}
              />
            </div>
          </div>
        </div>

        <button className="button button-primary submit-offer-btn" type="submit">
          E‘lonni joylashtirish <ArrowUpRight size={15} />
        </button>
      </form>
    </ModalFrame>
  )
}

// ---------------- PROFILE MODAL (MENING PROFILIM) ----------------
export function ProfileModal({
  name,
  username = '',
  bio,
  avatar,
  email,
  coins = 0,
  myOffersCount = 0,
  gender = 'male',
  createdAt,
  onClose,
  onSave,
}: {
  name: string
  username?: string
  bio: string
  avatar: string
  email?: string
  coins?: number
  myOffersCount?: number
  gender?: Gender
  createdAt?: string
  onClose: () => void
  onSave: (profile: { name: string; username?: string; bio: string; avatar: string; gender?: Gender }) => void
}) {
  const [nextName, setNextName] = useState(name)
  const [nextUsername, setNextUsername] = useState(username)
  const [nextGender, setNextGender] = useState<Gender>(gender || 'male')
  const [nextBio, setNextBio] = useState(bio)
  const [nextAvatar, setNextAvatar] = useState(avatar)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Iltimos, faqat rasm faylini tanlang (JPG, PNG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5MB dan oshmasligi kerak')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNextAvatar(event.target.result)
        setError('')
      }
    }
    reader.readAsDataURL(file)
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const cleanUsername = nextUsername.trim().replace(/^@/, '')
    if (cleanUsername && cleanUsername.length < 3) {
      setError('Username kamida 3 ta belgidan iborat bo‘lishi kerak')
      return
    }

    if (cleanUsername.startsWith('.') || cleanUsername.startsWith('_') || cleanUsername.endsWith('.') || cleanUsername.endsWith('_')) {
      setError('Username boshida yoki oxirida nuqta (.) yoki tagchiziq (_) bo‘lishi mumkin emas!')
      return
    }

    onSave({
      name: nextName.trim(),
      username: cleanUsername || undefined,
      bio: nextBio,
      avatar: nextAvatar,
      gender: nextGender,
    })
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  return (
    <ModalFrame description="Shaxsiy profilingiz va hisob ma’lumotlaringiz" onClose={onClose} title="Mening profilim">
      <div className="profile-stats-card">
        <div className="profile-stat-item">
          <span className="profile-stat-icon">
            <Coins size={14} />
          </span>
          <div>
            <span className="profile-stat-num">{coins}</span>
            <span className="profile-stat-label">Tanga balansi</span>
          </div>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat-item">
          <span className="profile-stat-icon">
            <Tag size={14} />
          </span>
          <div>
            <span className="profile-stat-num">{myOffersCount}</span>
            <span className="profile-stat-label">Mening e‘lonlarim</span>
          </div>
        </div>
      </div>

      {email && (
        <div className="profile-email-badge">
          <Mail size={13} />
          <span>{email}</span>
          {formattedDate && <small className="member-since">A‘zo: {formattedDate}</small>}
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form profile-form" onSubmit={submitProfile}>
        {/* Shaxsiy rasm yuklash bo'limi - Example rasmlar butunlay olib tashlandi! */}
        <div className="profile-custom-avatar-section">
          <div className="profile-preview-avatar-wrap">
            <img
              alt={`${nextName} profil rasmi`}
              className="profile-preview-avatar"
              onError={(event) => {
                event.currentTarget.src = '/placeholder-user.jpg'
              }}
              src={nextAvatar || '/placeholder-user.jpg'}
            />
            <button
              aria-label="Rasm yuklash"
              className="avatar-camera-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Kompyuter yoki telefondan rasm tanlash"
              type="button"
            >
              <Camera size={13} />
            </button>
          </div>

          <div className="profile-avatar-actions">
            <strong>Shaxsiy profilingiz rasmi</strong>
            <span>Qurilmangizdan o‘zingizning suratingizni yuklang:</span>
            <div className="avatar-btn-row">
              <input
                accept="image/*"
                onChange={handleImageFile}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
              />
              <button
                className="button button-cream upload-file-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload size={13} /> Rasm tanlash
              </button>
              {nextAvatar && (
                <button
                  className="button-subtle-delete"
                  onClick={() => setNextAvatar('')}
                  title="Rasmni olib tashlash"
                  type="button"
                >
                  <Trash2 size={13} /> Olib tashlash
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-group-modern">
          <label className="form-label" htmlFor="profile-name">
            To‘liq ism *
          </label>
          <input
            autoFocus
            className="form-control"
            id="profile-name"
            maxLength={48}
            onChange={(event) => setNextName(event.target.value)}
            required
            value={nextName}
          />
        </div>

        <div className="form-group-modern">
          <label className="form-label" htmlFor="profile-username">
            Platformadagi @username *
          </label>
          <div className="username-field-wrap">
            <span className="username-prefix">@</span>
            <input
              className="form-control username-input"
              id="profile-username"
              maxLength={24}
              onChange={(e) => setNextUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
              placeholder="username"
              required
              value={nextUsername}
            />
          </div>
          <small className="chips-hint">Nuqta va tagchiziq faqat so‘z o‘rtasida bo‘lishi mumkin</small>
        </div>

        {/* Jinsni tanlash (Gender) */}
        <div className="form-group-modern">
          <label className="form-label">Jinsingiz</label>
          <div className="gender-selector-row">
            <button
              className={`gender-select-btn ${nextGender === 'male' ? 'active' : ''}`}
              onClick={() => setNextGender('male')}
              type="button"
            >
              <span className="gender-icon">👨</span>
              <span>Erkak</span>
            </button>
            <button
              className={`gender-select-btn ${nextGender === 'female' ? 'active' : ''}`}
              onClick={() => setNextGender('female')}
              type="button"
            >
              <span className="gender-icon">👩</span>
              <span>Ayol</span>
            </button>
          </div>
        </div>

        <div className="form-group-modern">
          <label className="form-label" htmlFor="profile-bio">
            O‘zingiz haqingizda qisqacha ma’lumot (Bio)
          </label>
          <textarea
            className="form-control form-textarea"
            id="profile-bio"
            maxLength={200}
            onChange={(event) => setNextBio(event.target.value)}
            placeholder="Qaysi sohada faoliyat yuritasiz? Qiziqishlaringiz nimalardan iborat?"
            rows={2}
            value={nextBio}
          />
        </div>

        <button className="button button-primary" type="submit">
          Saqlash <Check size={14} />
        </button>
      </form>
    </ModalFrame>
  )
}

// ---------------- CONFIRM UNLOCK MODAL (KONTAKT OCHISH TASDIG'I) ----------------
export function ConfirmUnlockModal({
  offer,
  userCoins,
  onConfirm,
  onCancel,
  onTopUp,
}: {
  offer: Offer
  userCoins: number
  onConfirm: () => void
  onCancel: () => void
  onTopUp: () => void
}) {
  const hasEnoughCoins = userCoins >= 1

  return (
    <ModalFrame
      description="Ushbu foydalanuvchining aloqa vositalarini ochish"
      onClose={onCancel}
      size="narrow"
      title="Kontaktni ochishni tasdiqlaysizmi?"
    >
      <div className="confirm-unlock-body">
        <div className="confirm-target-card">
          <img
            alt={offer.name}
            className="confirm-target-avatar"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-user.jpg'
            }}
            src={offer.avatar}
          />
          <div className="confirm-target-meta">
            <h4>{offer.name}</h4>
            <span className="confirm-username">@{offer.username || 'user'}</span>
            <span className="confirm-teach-pill">↗ {offer.canTeach}</span>
          </div>
        </div>

        <div className="confirm-price-box">
          <div className="price-row">
            <span>Amal narxi:</span>
            <strong className="price-val">1 Tanga ◈</strong>
          </div>
          <div className="price-row">
            <span>Joriy balansingiz:</span>
            <strong className={`balance-val ${hasEnoughCoins ? 'balance-ok' : 'balance-low'}`}>
              {userCoins} ta tanga
            </strong>
          </div>
        </div>

        {!hasEnoughCoins ? (
          <div className="insufficient-coins-box">
            <p>⚠️ Balansingizda tangalar yetarli emas. Kontaktni ochish uchun hisobingizni to‘ldiring.</p>
            <button className="button button-primary w-full" onClick={onTopUp} type="button">
              <Coins size={14} /> Balansni to‘ldirish (Top-up)
            </button>
          </div>
        ) : (
          <div className="confirm-actions-row">
            <button className="button button-primary confirm-yes-btn" onClick={onConfirm} type="button">
              <UnlockKeyhole size={14} /> Ha, ochilsin (-1 tanga)
            </button>
            <button className="button button-cream confirm-no-btn" onClick={onCancel} type="button">
              Yo‘q, bekor qilish
            </button>
          </div>
        )}
      </div>
    </ModalFrame>
  )
}

// ---------------- SECURITY NOTICE MODAL (15 SONIYALIK OGOHLANTIRISH) ----------------
export function SecurityNoticeModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(15)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose()
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, onClose])

  return (
    <div className="modal-backdrop security-notice-backdrop" onClick={onClose} role="dialog">
      <div className="security-notice-card" onClick={(e) => e.stopPropagation()}>
        <div className="security-notice-badge">
          <ShieldAlert size={28} />
        </div>

        <h3 className="security-notice-title">⚠️ Muhim Eslatma & Xavfsizlik</h3>

        <div className="security-notice-content">
          <p>
            Foydalanuvchi bilan <strong>iloji boricha ko‘rishib, ochiq muloqotda gaplashishni</strong> qat’iy tavsiya beramiz.
          </p>
          <p>
            Shaxsiy muammolar, moliyaviy masalalar hamda foydalanuvchilar o‘rtasidagi o‘zaro muloqot va kelishuvlarga Swaply ma’muriyati javob bermaydi.
          </p>
          <div className="security-notice-motto">
            <span>✨ Ogohlik — davr talabi!</span>
          </div>
        </div>

        <div className="security-notice-footer">
          <span className="countdown-indicator">
            Avtomatik yopilish: <strong>{secondsLeft}s</strong>
          </span>
          <button className="button button-primary security-ok-btn" onClick={onClose} type="button">
            Tushundim (OK)
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------- REPORT MODAL (SHIKOYATLAR TIZIMI) ----------------
export function ReportModal({
  targetOffer,
  targetMember,
  onClose,
  onDone,
}: {
  targetOffer?: Offer
  targetMember?: MemberUser
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [reason, setReason] = useState<'spam' | 'scam' | 'offensive' | 'fake' | 'other'>('spam')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const targetName = targetOffer?.name || targetMember?.name || 'Foydalanuvchi'
  const targetUsername = targetOffer?.username || targetMember?.username || ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Iltimos, shikoyatingiz sababini batafsil izohlang')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('swaply_token')
      const res = await fetchWithAuth('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetType: targetOffer ? 'offer' : 'user',
          targetId: targetOffer?.id || (targetMember ? String(targetMember.id) : undefined),
          targetName,
          targetUsername,
          reason,
          description: description.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Shikoyatni yuborishda xatolik')
        return
      }

      onDone('Shikoyatingiz ma’muriyatga yuborildi. Ogohligingiz uchun rahmat!')
      onClose()
    } catch {
      setError('Server bilan bog‘lanib bo‘lmadi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalFrame
      description="Nomaqbul harakat, soxta e‘lon yoki qoidabuzarlik haqida ma’muriyatga xabar bering"
      onClose={onClose}
      size="narrow"
      title="Shikoyat qilish"
    >
      <div className="report-target-bar">
        <Flag size={14} />
        <span>
          Obyekt: <strong>{targetName}</strong> {targetUsername && `(@${targetUsername})`}
        </span>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="form-label">Qoidabuzarlik sababi *</label>
        <div className="report-reasons-list">
          {[
            { id: 'spam', label: '🚫 Spam yoki tijoriy reklama' },
            { id: 'scam', label: '⚠️ Firibgarlik yoki shubhali faoliyat' },
            { id: 'offensive', label: '🤬 Haqoratli yoki nomaqbul so‘zlar' },
            { id: 'fake', label: '❌ Soxta yoki yolg‘on profil/taklif' },
            { id: 'other', label: '📝 Boshqa muammo' },
          ].map((item) => (
            <label className={`report-reason-item ${reason === item.id ? 'active' : ''}`} key={item.id}>
              <input
                checked={reason === item.id}
                name="reportReason"
                onChange={() => setReason(item.id as any)}
                type="radio"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <label className="form-label" htmlFor="report-desc">
          Batafsil izoh *
        </label>
        <textarea
          className="form-control form-textarea"
          id="report-desc"
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vaziyatni tushuntiring: nima uchun ushbu e‘lon yoki foydalanuvchi qoidalarni buzmoqda?"
          required
          rows={3}
          value={description}
        />

        <button className="button button-primary submit-report-btn" disabled={submitting} type="submit">
          {submitting ? 'Yuborilmoqda...' : 'Shikoyatni yuborish'}
        </button>
      </form>
    </ModalFrame>
  )
}

// ---------------- ADMIN PANEL MODAL (TAHLIL & KUZATUV) ----------------
export function AdminPanelModal({
  onClose,
  onOfferDeleted,
}: {
  onClose: () => void
  onOfferDeleted?: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview')
  const [searchUser, setSearchUser] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<{
    stats: any
    users: any[]
    reports: ReportItem[]
  } | null>(null)
  const [selectedInspectUser, setSelectedInspectUser] = useState<any | null>(null)
  const [actionMsg, setActionMsg] = useState('')
  const [showNotifications, setShowNotifications] = useState(true)
  const NOTIFICATIONS_KEY = 'admin_notification_toggle'

  // Load toggle state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY)
      if (saved !== null) {
        setShowNotifications(JSON.parse(saved))
      }
    } catch {}
  }, [])

  // Save toggle state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, String(showNotifications))
    } catch {}
  }, [showNotifications])

  async function loadAdminData(query = '') {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`/api/admin?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setAdminData(data)
      if (query && data.users?.length > 0) {
        setSelectedInspectUser(data.users[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData(searchUser)
  }, [searchUser])

  async function handleDeleteOffer(offerId: string) {
    if (!window.confirm('Haqiqatan ham bu taklifni o‘chirmoqchimisiz?')) return

    try {
      const res = await fetchWithAuth('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteOffer', offerId }),
      })
      if (res.ok) {
        setActionMsg('Taklif muvaffaqiyatli o‘chirildi!')
        loadAdminData(searchUser)
        onOfferDeleted?.()
      }
    } catch {}
  }

  async function handleResolveReport(reportId: string) {
    try {
      const res = await fetchWithAuth('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateReport', reportId, status: 'resolved' }),
      })
      if (res.ok) {
        setActionMsg('Shikoyat ko‘rib chiqildi!')
        loadAdminData(searchUser)
      }
    } catch {}
  }

  return (
    <ModalFrame
      description="Swaply platformasi ma’muri: Foydalanuvchilar faoliyati, takliflari va shikoyatlarni monitoring qilish"
      onClose={onClose}
      size="wide"
      title="Admin Dashboard & Tahlil Paneli"
    >
      <div className="admin-tabs-row">
        <button
          className={`admin-tab-btn ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
          type="button"
        >
          <Building size={14} /> Umumiy Statistika
        </button>
        <button
          className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
          type="button"
        >
          <Users size={14} /> Foydalanuvchilarni Kuzatish (@amir...)
        </button>
        <button
          className={`admin-tab-btn ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
          type="button"
        >
          <Flag size={14} /> Shikoyatlar ({adminData?.stats?.pendingReports || 0})
        </button>
      </div>

      {showNotifications && actionMsg && <div className="admin-action-banner">✓ {actionMsg}</div>}

      {/* Notification toggle in users tab */}
      {tab === 'users' && (
        <div className="admin-notification-toggle">
          <div className="admin-notification-toggle-label">
            <span>Yangiliklarni ko‘rsatish:</span>
          </div>
          <div className="admin-notification-toggle-switch">
            <button
              className={`admin-notification-toggle-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications((prev) => {
                const next = !prev
                try {
                  localStorage.setItem(NOTIFICATIONS_KEY, String(next))
                } catch {}
                return next
              })}
              type="button"
            >
              <span>{showNotifications ? 'Yoq' : 'Ochiq'}</span>
            </button>
          </div>
        </div>
      )}

      {loading && !adminData ? (
        <div className="admin-loading">
          <Loader2 className="animate-spin" size={20} /> Ma’lumotlar yuklanmoqda...
        </div>
      ) : (
        <>
          {tab === 'overview' && adminData && (
            <div className="admin-overview-grid">
              <div className="stat-card surface-card">
                <span className="stat-card-title">Jami Foydalanuvchilar</span>
                <strong className="stat-card-num">{adminData.stats.totalUsers}</strong>
                <span className="stat-card-sub">
                  👨 Erkak: {adminData.stats.genderStats.male} | 👩 Ayol: {adminData.stats.genderStats.female}
                </span>
              </div>

              <div className="stat-card surface-card">
                <span className="stat-card-title">Jami Faol Takliflar</span>
                <strong className="stat-card-num">{adminData.stats.totalOffers}</strong>
                <span className="stat-card-sub">Hamjamiyatdagi ko‘nikmalar</span>
              </div>

              <div className="stat-card surface-card">
                <span className="stat-card-title">Kelib tushgan shikoyatlar</span>
                <strong className="stat-card-num">{adminData.stats.totalReports}</strong>
                <span className="stat-card-sub">
                  Kutilmoqda: <strong>{adminData.stats.pendingReports}</strong> ta
                </span>
              </div>
            </div>
          )}

          {tab === 'users' && adminData && (
            <div className="admin-users-manager">
              <div className="admin-user-search-bar">
                <Search size={14} />
                <input
                  className="form-control"
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Foydalanuvchi qidirish (@amir, ism, email)..."
                  value={searchUser}
                />
              </div>

              <div className="admin-users-split">
                <div className="admin-users-list">
                  {adminData.users.map((u) => (
                    <div
                      className={`admin-user-row ${selectedInspectUser?.id === u.id ? 'active' : ''}`}
                      key={u.id}
                      onClick={() => setSelectedInspectUser(u)}
                    >
                      <img
                        alt=""
                        className="admin-row-avatar"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-user.jpg'
                        }}
                        src={u.avatar || '/placeholder-user.jpg'}
                      />
                      <div className="admin-row-info">
                        <strong>{u.name}</strong>
                        <span>@{u.username}</span>
                      </div>
                      <span className="admin-row-offers-count">{u.offersCount} e‘lon</span>
                    </div>
                  ))}
                </div>

                <div className="admin-user-inspector">
                  {selectedInspectUser ? (
                    <div className="inspector-card">
                      <div className="inspector-header">
                        <img
                          alt=""
                          className="inspector-avatar"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-user.jpg'
                          }}
                          src={selectedInspectUser.avatar || '/placeholder-user.jpg'}
                        />
                        <div>
                          <h3>{selectedInspectUser.name}</h3>
                          <div className="inspector-username">@{selectedInspectUser.username}</div>
                          <div className="inspector-badge-row">
                            <span className="inspector-gender">
                              {selectedInspectUser.gender === 'male' ? '👨 Erkak' : selectedInspectUser.gender === 'female' ? '👩 Ayol' : 'Boshqa'}
                            </span>
                            <span className="inspector-coins">{selectedInspectUser.coins} ◈</span>
                          </div>
                        </div>
                      </div>

                      <div className="inspector-contacts">
                        <div>Email: <strong>{selectedInspectUser.email}</strong></div>
                        {selectedInspectUser.phone && <div>Tel: <strong>{selectedInspectUser.phone}</strong></div>}
                        {selectedInspectUser.telegram && <div>Telegram: <strong>{selectedInspectUser.telegram}</strong></div>}
                      </div>

                      {/* Joylagan takliflari bo'limi */}
                      <div className="inspector-offers-section">
                        <h4>@{selectedInspectUser.username} joylagan takliflar ({selectedInspectUser.offers?.length || 0}):</h4>
                        {selectedInspectUser.offers?.length === 0 ? (
                          <div className="no-offers-msg">Ushbu foydalanuvchi hali taklif joylamagan.</div>
                        ) : (
                          <div className="inspector-offers-list">
                            {selectedInspectUser.offers.map((offer: any) => (
                              <div className="inspector-offer-item" key={offer.id}>
                                <div className="inspector-offer-meta">
                                  <strong>{offer.canTeach}</strong> <span>↔</span> <span>{offer.wantsToLearn}</span>
                                  <small className="offer-loc">📍 {offer.location || 'Toshkent'}</small>
                                </div>
                                <button
                                  className="admin-delete-offer-btn"
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  title="E‘lonni o‘chirish"
                                  type="button"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="select-user-prompt">
                      Chap tarafdagi ro‘yxatdan kuzatmoqchi bo‘lgan foydalanuvchini tanlang
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'reports' && adminData && (
            <div className="admin-reports-list">
              {adminData.reports.length === 0 ? (
                <div className="no-reports-box">🎉 Hozirda hech qanday shikoyatlar yo‘q! Hammasi namunali.</div>
              ) : (
                adminData.reports.map((rep) => (
                  <div className={`report-admin-card status-${rep.status}`} key={rep.id}>
                    <div className="report-card-top">
                      <div>
                        <strong className="report-title">{rep.reasonTitle}</strong>
                        <span className="report-target">
                          Obyekt: {rep.targetName} {rep.targetUsername && `(@${rep.targetUsername})`}
                        </span>
                      </div>
                      <span className={`report-status-badge ${rep.status}`}>{rep.status}</span>
                    </div>

                    <p className="report-desc-text">"{rep.description}"</p>

                    <div className="report-card-footer">
                      <small>Yuboruvchi: {rep.reporterName} (@{rep.reporterUsername})</small>
                      {rep.status === 'pending' && (
                        <button
                          className="button button-cream resolve-btn"
                          onClick={() => handleResolveReport(rep.id)}
                          type="button"
                        >
                          <Check size={12} /> Ko‘rib chiqildi deb belgilash
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </ModalFrame>
  )
}

// ---------------- PUBLIC PROFILE MODAL ----------------
export function PublicProfileModal({
  member,
  offers,
  revealedContacts,
  onClose,
  onUnlockContact,
  onReport,
}: {
  member: MemberUser
  offers: Offer[]
  revealedContacts: string[]
  onClose: () => void
  onUnlockContact: (offer: Offer) => void
  onReport?: (member: MemberUser) => void
}) {
  const memberOffers = offers.filter(
    (o) => o.userId === member.id || (o.username && o.username === member.username)
  )

  return (
    <ModalFrame
      description={`@${member.username} a‘zosining profili va e‘lonlari`}
      onClose={onClose}
      size="wide"
      title={member.name}
    >
      <div className="public-profile-header">
        <img
          alt={`${member.name} rasmi`}
          className="public-profile-avatar"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-user.jpg'
          }}
          src={member.avatar || '/placeholder-user.jpg'}
        />
        <div className="public-profile-info">
          <div className="public-profile-title-row">
            <h3>{member.name}</h3>
            {member.verified && <BadgeCheck className="verified-icon" size={16} />}
            {onReport && (
              <button
                className="public-report-btn"
                onClick={() => onReport(member)}
                title="Foydalanuvchi ustidan shikoyat qilish"
                type="button"
              >
                <Flag size={13} />
              </button>
            )}
          </div>
          <div className="public-profile-username-tag">@{member.username}</div>
          <p className="public-profile-bio">{member.bio || 'Bu foydalanuvchi hali o‘zi haqida ma‘lumot kiritmagan.'}</p>
          <div className="public-profile-meta-row">
            <span>
              <MapPin size={12} /> {member.location || 'Toshkent'}
            </span>
            <span>
              <Star fill="currentColor" size={12} /> 5.0 reyting
            </span>
            <span>
              <Tag size={12} /> {memberOffers.length} ta faol taklif
            </span>
            {member.gender && (
              <span>
                {member.gender === 'male' ? '👨 Erkak' : member.gender === 'female' ? '👩 Ayol' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="public-profile-offers-section">
        <h4 className="public-offers-heading">
          {member.name}ning faol takliflari ({memberOffers.length})
        </h4>

        {memberOffers.length === 0 ? (
          <div className="public-offers-empty">Hozirda bu foydalanuvchining faol e‘lonlari yo‘q.</div>
        ) : (
          <div className="public-offers-list">
            {memberOffers.map((offer) => {
              const isRevealed = revealedContacts.includes(offer.id)
              return (
                <div className="public-offer-card" key={offer.id}>
                  <div className="public-offer-skills">
                    <div className="pos-skill">
                      <span className="teach-mark">↗</span> O‘rgatadi: <strong>{offer.canTeach}</strong>
                    </div>
                    <div className="pos-skill">
                      <span className="learn-mark">↘</span> O‘rganadi: <strong>{offer.wantsToLearn}</strong>
                    </div>
                  </div>
                  <p className="public-offer-desc">{offer.description}</p>
                  <div className="public-offer-bottom">
                    <span className="offer-category">{offer.category}</span>
                    <span className="offer-loc-tag">📍 {offer.location || 'Toshkent'}</span>
                    {isRevealed ? (
                      <span className="contact-unlocked-badge">
                        ✓ {offer.telegram || offer.phone || offer.contact}
                      </span>
                    ) : (
                      <button
                        className="button button-contact"
                        onClick={() => onUnlockContact(offer)}
                        type="button"
                      >
                        <UnlockKeyhole size={13} /> Kontaktni ochish (1 ◈)
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModalFrame>
  )
}

// ---------------- WALLET MODAL (HAMYON VA TOP-UP) ----------------
export function WalletModal({
  coins,
  onClose,
  onAddCoins,
}: {
  coins: number
  onClose: () => void
  onAddCoins: (amount: number) => void
}) {
  const [selectedPack, setSelectedPack] = useState(10)
  const [success, setSuccess] = useState(false)

  const coinPacks = [
    { amount: 5, price: '15,000 UZS', popular: false },
    { amount: 10, price: '25,000 UZS', popular: true },
    { amount: 25, price: '50,000 UZS', popular: false },
  ]

  function handleBuy() {
    onAddCoins(selectedPack)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <ModalFrame
      description="Hisobingizdagi tangalarni boshqaring va yangi kontaktlarni ochish uchun balansni to‘ldiring"
      onClose={onClose}
      size="narrow"
      title="Swaply Hamyoni"
    >
      <div className="wallet-card">
        <div className="wallet-card-bg" />
        <div className="wallet-top">
          <span className="wallet-badge">
            <Coins size={14} /> Tanga Balansi
          </span>
          <span className="wallet-currency">SWAP COINS</span>
        </div>
        <div className="wallet-balance">
          <span className="wallet-coins-num">{coins}</span>
          <span className="wallet-coins-symbol">◈</span>
        </div>
        <div className="wallet-bottom">
          <span className="wallet-note">1 ta kontakt ochish = 1 ta tanga</span>
        </div>
      </div>

      {success && <div className="wallet-success-banner">✓ Balansingiz muvaffaqiyatli to‘ldirildi!</div>}

      <div className="packs-title">Tangalar to‘plamini tanlang:</div>
      <div className="coin-packs-grid">
        {coinPacks.map((pack) => (
          <div
            className={`coin-pack-card ${selectedPack === pack.amount ? 'pack-selected' : ''}`}
            key={pack.amount}
            onClick={() => setSelectedPack(pack.amount)}
          >
            {pack.popular && <span className="pack-popular-badge">Mashhur</span>}
            <div className="pack-amount">+{pack.amount} ◈</div>
            <div className="pack-price">{pack.price}</div>
          </div>
        ))}
      </div>

      <button className="button button-primary wallet-buy-btn" onClick={handleBuy} type="button">
        To‘ldirish (+{selectedPack} tanga) <ArrowUpRight size={15} />
      </button>

      <p className="wallet-safety-note">
        <ShieldCheck size={13} /> To‘lovlar Payme, Click va Uzum Bank orqali xavfsiz amalga oshiriladi
      </p>
    </ModalFrame>
  )
}
