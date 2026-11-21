'use client'

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  Coins,
  Globe2,
  ImagePlus,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
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
  X,
} from 'lucide-react'
import { ModalFrame } from './modal-frame'
import { type Offer, type MemberUser, avatarOptions } from './types'

export type AuthUser = {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  coins?: number
  phone?: string
  telegram?: string
  whatsapp?: string
  lastClaimDate?: string
  createdAt?: string
}

export function AuthModal({
  onClose,
  onDone,
  initialMode = 'login',
  authReason,
}: {
  onClose: () => void
  onDone: (user: AuthUser, token: string) => void
  initialMode?: 'login' | 'register'
  authReason?: string
}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Username bandligini jonli tekshirish (debounced)
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

    setUsernameStatus({ checking: true })
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(clean)}`)
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

      if (usernameStatus && !usernameStatus.available) {
        setError(usernameStatus.error || 'Bu username band, boshqasini tanlang')
        return
      }

      if (password !== confirmPassword) {
        setError('Parollar mos kelmaydi')
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
          ? { name: name.trim(), username: username.trim().replace(/^@/, ''), email: email.trim(), password }
          : { email: email.trim(), password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Xatolik yuz berdi')
        return
      }

      // Token ni localStorage ga saqlash
      localStorage.setItem('swaply_token', data.token)
      localStorage.setItem('swaply_user', JSON.stringify(data.user))

      onDone(data.user, data.token)
    } catch {
      setError('Serverga ulanishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalFrame
      description={mode === 'login' ? 'Email/Username va parol bilan kiring' : 'Yangi hisob oching va barter qilishni boshlang'}
      onClose={onClose}
      title={mode === 'login' ? 'Swaply tizimiga kirish' : 'Ro‘yxatdan o‘tish'}
    >
      {authReason && (
        <div className="auth-reason-banner">
          <Sparkles aria-hidden="true" size={16} />
          <span>{authReason}</span>
        </div>
      )}

      <div className="auth-intro-mark">
        {mode === 'login' ? <LogIn aria-hidden="true" size={19} /> : <UserPlus aria-hidden="true" size={19} />}
      </div>
      <p className="modal-lead">
        {mode === 'login'
          ? 'Hamjamiyatga xush kelibsiz. Email yoki @username orqali kiring.'
          : 'Hamjamiyatga qo‘shiling! Ismingiz va o‘zingizning maxsus @username tanlang.'}
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <label className="form-label" htmlFor="auth-name">
              To‘liq ism *
            </label>
            <input
              autoFocus
              className="form-control"
              data-initial-focus="true"
              id="auth-name"
              maxLength={48}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan, Azizbek Rahimov"
              required
              type="text"
              value={name}
            />

            <label className="form-label" htmlFor="auth-username">
              Platforma uchun unikal @username *
            </label>
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
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="azizbek_dev"
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
            {usernameStatus?.error && <small className="username-hint-error">{usernameStatus.error}</small>}
            {usernameStatus?.available && <small className="username-hint-ok">✓ Bu username bo‘sh, foydalanish mumkin</small>}
          </>
        )}

        <label className="form-label" htmlFor="auth-email">
          <Mail aria-hidden="true" size={12} style={{ display: 'inline', marginRight: 5, opacity: 0.6 }} />
          {mode === 'login' ? 'Email manzil yoki @username' : 'Email manzil *'}
        </label>
        <input
          autoFocus={mode === 'login'}
          className="form-control"
          data-initial-focus={mode === 'login' ? 'true' : undefined}
          id="auth-email"
          maxLength={100}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={mode === 'login' ? 'email@example.com yoki @username' : 'email@example.com'}
          required
          type={mode === 'login' ? 'text' : 'email'}
          value={email}
        />

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

        {mode === 'register' && (
          <>
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
          </>
        )}

        <button className="button button-primary auth-submit" disabled={loading} type="submit">
          {loading ? 'Kutilmoqda...' : mode === 'login' ? 'Kirish' : 'Ro‘yxatdan o‘tish'}
          {!loading && <ArrowUpRight aria-hidden="true" size={15} />}
        </button>
      </form>

      <div className="auth-divider">
        <span /> yoki <span />
      </div>

      <button
        className="google-button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError('')
        }}
        type="button"
      >
        {mode === 'login' ? (
          <>
            <UserPlus aria-hidden="true" size={15} /> Yangi hisob yaratish (Ro‘yxatdan o‘tish)
          </>
        ) : (
          <>
            <LogIn aria-hidden="true" size={15} /> Allaqachon hisobingiz bormi? Kirish
          </>
        )}
      </button>

      <p className="privacy-note">
        <ShieldCheck aria-hidden="true" size={13} /> Ma’lumotlaringiz xavfsiz saqlanadi
      </p>
    </ModalFrame>
  )
}

export function OfferModal({
  userName,
  userAvatar,
  userUsername,
  onClose,
  onSave,
}: {
  userName: string
  userAvatar: string
  userUsername?: string
  onClose: () => void
  onSave: (offer: {
    canTeach: string
    wantsToLearn: string
    category: string
    description: string
    phone?: string
    telegram?: string
    whatsapp?: string
  }) => void
}) {
  const [canTeach, setCanTeach] = useState('')
  const [wantsToLearn, setWantsToLearn] = useState('')
  const [category, setCategory] = useState('IT & Dasturlash')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState(userUsername ? `@${userUsername}` : '')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState('')

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
      description: description.trim(),
      phone: cleanPhone || undefined,
      telegram: cleanTelegram || undefined,
      whatsapp: cleanWhatsapp || undefined,
    })
  }

  return (
    <ModalFrame description="O‘zingiz bilgan mahoratni boshqalarga taklif qiling" onClose={onClose} title="Yangi taklif qo‘shish">
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

      <form className="modal-form" onSubmit={submitOffer}>
        <label className="form-label" htmlFor="teach-skill">
          Qo‘limdan keladi (Nimalarni o‘rgata olasiz?) *
        </label>
        <input
          autoFocus
          className="form-control"
          data-initial-focus="true"
          id="teach-skill"
          maxLength={48}
          onChange={(event) => setCanTeach(event.target.value)}
          placeholder="Masalan, Figma’da UI dizayn yoki React"
          required
          value={canTeach}
        />

        <label className="form-label" htmlFor="learn-skill">
          Menga kerak (Nimalarni o‘rganmoqchisiz?) *
        </label>
        <input
          className="form-control"
          id="learn-skill"
          maxLength={48}
          onChange={(event) => setWantsToLearn(event.target.value)}
          placeholder="Masalan, Ingliz tili speaking yoki Python"
          required
          value={wantsToLearn}
        />

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
        </select>

        <label className="form-label" htmlFor="offer-description">
          Batafsil izoh *
        </label>
        <textarea
          className="form-control form-textarea"
          id="offer-description"
          maxLength={280}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Qanday formatda almashishni xohlaysiz? Qancha vaqt ajrata olasiz?"
          required
          value={description}
        />

        <div className="contact-inputs-section">
          <div className="contact-section-title">
            <span>Aloqa ma’lumotlari</span>
            <small>Kontakt faqat tanga sarflagan foydalanuvchiga ko‘rinadi</small>
          </div>

          <label className="form-label" htmlFor="offer-phone">
            <Phone aria-hidden="true" size={13} style={{ display: 'inline', marginRight: 5, opacity: 0.7 }} />
            Telefon raqam
          </label>
          <input
            className="form-control"
            id="offer-phone"
            maxLength={25}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+998 90 123 45 67"
            type="tel"
            value={phone}
          />

          <label className="form-label" htmlFor="offer-telegram">
            <Send aria-hidden="true" size={13} style={{ display: 'inline', marginRight: 5, opacity: 0.7 }} />
            Telegram havola yoki username (Telefon raqam tagida)
          </label>
          <input
            className="form-control"
            id="offer-telegram"
            maxLength={60}
            onChange={(event) => setTelegram(event.target.value)}
            placeholder="@username yoki t.me/username"
            type="text"
            value={telegram}
          />

          <label className="form-label" htmlFor="offer-whatsapp">
            <MessageCircle aria-hidden="true" size={13} style={{ display: 'inline', marginRight: 5, opacity: 0.7 }} />
            WhatsApp havola yoki raqam
          </label>
          <input
            className="form-control"
            id="offer-whatsapp"
            maxLength={60}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="+998 90 123 45 67 yoki wa.me/998901234567"
            type="text"
            value={whatsapp}
          />
        </div>

        <div className="form-hint">
          <Sparkles aria-hidden="true" size={13} /> Pul emas, vaqt va tajriba almashiladi
        </div>

        <button className="button button-primary modal-submit" type="submit">
          E‘lonni joylash <ArrowUpRight aria-hidden="true" size={15} />
        </button>
      </form>
    </ModalFrame>
  )
}

export function ProfileModal({
  name,
  username,
  bio,
  avatar,
  email,
  coins = 0,
  createdAt,
  myOffersCount = 0,
  onClose,
  onSave,
}: {
  name: string
  username?: string
  bio: string
  avatar: string
  email?: string
  coins?: number
  createdAt?: string
  myOffersCount?: number
  onClose: () => void
  onSave: (profile: { name: string; username?: string; bio: string; avatar: string }) => void
}) {
  const [nextName, setNextName] = useState(name)
  const [nextUsername, setNextUsername] = useState(username || '')
  const [nextBio, setNextBio] = useState(bio)
  const [nextAvatar, setNextAvatar] = useState(avatar || avatarOptions[0])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Foydalanuvchi kompyuterdan yoki telefondan o'z rasmini yuklashi
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

    onSave({
      name: nextName.trim(),
      username: cleanUsername || undefined,
      bio: nextBio,
      avatar: nextAvatar,
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
        {/* Shaxsiy rasm yuklash bo'limi */}
        <div className="profile-custom-avatar-section">
          <div className="profile-preview-avatar-wrap">
            <img
              alt={`${nextName} profil rasmi`}
              className="profile-preview-avatar"
              onError={(event) => {
                event.currentTarget.src = '/placeholder-user.jpg'
              }}
              src={nextAvatar}
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
            <strong>Profil rasmini o‘zingiz yuklang</strong>
            <span>Qurilmangizdan shaxsiy suratingizni tanlang:</span>
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
              {nextAvatar && !avatarOptions.includes(nextAvatar) && (
                <button
                  className="button-subtle-delete"
                  onClick={() => setNextAvatar(avatarOptions[0])}
                  title="Rasmni olib tashlash"
                  type="button"
                >
                  <Trash2 size={13} /> Olib tashlash
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tayyor avatarlar (ixtiyoriy) */}
        <div className="preset-avatars-label">Yoki tayyor avatarlardan birini tanlang:</div>
        <div aria-label="Avatar tanlash" className="avatar-options" role="group">
          {avatarOptions.map((option) => (
            <button
              aria-label={`Avatar tanlash`}
              aria-pressed={nextAvatar === option}
              className={`avatar-option ${nextAvatar === option ? 'avatar-option-active' : ''}`}
              key={option}
              onClick={() => setNextAvatar(option)}
              type="button"
            >
              <img alt="" src={option} />
              {nextAvatar === option && <Check aria-hidden="true" size={11} />}
            </button>
          ))}
        </div>

        <label className="form-label" htmlFor="profile-name">
          To‘liq ism *
        </label>
        <input
          autoFocus
          className="form-control"
          data-initial-focus="true"
          id="profile-name"
          maxLength={48}
          onChange={(event) => setNextName(event.target.value)}
          required
          value={nextName}
        />

        <label className="form-label" htmlFor="profile-username">
          Platformadagi @username *
        </label>
        <div className="username-field-wrap">
          <span className="username-prefix">@</span>
          <input
            className="form-control username-input"
            id="profile-username"
            maxLength={24}
            onChange={(e) => setNextUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            type="text"
            value={nextUsername}
          />
        </div>

        <label className="form-label" htmlFor="profile-bio">
          O‘zingiz haqingizda (Bio)
        </label>
        <textarea
          className="form-control form-textarea profile-bio"
          id="profile-bio"
          maxLength={180}
          onChange={(event) => setNextBio(event.target.value)}
          placeholder="Qanday sohada ishlaysiz? Qanday ko‘nikmalarga qiziqasiz?"
          value={nextBio}
        />

        <button className="button button-primary modal-submit" type="submit">
          O‘zgarishlarni saqlash <ArrowUpRight aria-hidden="true" size={15} />
        </button>
      </form>
    </ModalFrame>
  )
}

export function WalletModal({
  coins,
  claimed,
  isLoggedIn,
  onClose,
  onClaim,
  onRegister,
}: {
  coins: number
  claimed: boolean
  isLoggedIn: boolean
  onClose: () => void
  onClaim: () => void
  onRegister: () => void
}) {
  return (
    <ModalFrame
      description="Tangalaringiz balansi va ularni to‘ldirish (Top up) yo‘llari"
      onClose={onClose}
      title="Swaply Hamyoni"
    >
      <div className="wallet-modal-balance-card">
        <div className="wallet-modal-coin-icon-wrap">
          <Coins size={32} />
        </div>
        <div className="wallet-modal-numbers">
          <span className="wallet-modal-count">{coins}</span>
          <span className="wallet-modal-label">tanga balansingiz</span>
        </div>
      </div>

      <div className="wallet-modal-action-row">
        {isLoggedIn ? (
          <button
            className={`button ${claimed ? 'button-cream' : 'button-primary'} wallet-modal-claim-btn`}
            disabled={claimed}
            onClick={onClaim}
            type="button"
          >
            {claimed ? (
              <>
                <Check size={16} /> Bugungi bonus olingan
              </>
            ) : (
              <>
                <Sparkles size={16} /> Kunlik bonusni olish (+1 tanga)
              </>
            )}
          </button>
        ) : (
          <button className="button button-primary wallet-modal-claim-btn" onClick={onRegister} type="button">
            <UserPlus size={16} /> Ro‘yxatdan o‘tib bonus olish
          </button>
        )}
      </div>

      <div className="wallet-rules-section">
        <h4 className="wallet-rules-heading">
          <Coins size={14} /> Tangalarni qanday to‘ldirish (Top up) mumkin?
        </h4>
        <div className="wallet-rules-list">
          <div className="wallet-rule-item">
            <span className="rule-badge">1</span>
            <div>
              <strong>Kunlik bepul bonus</strong>
              <p>Har kuni Swaply’ga tashrif buyuring va bepul +1 tangaga ega bo‘ling.</p>
            </div>
          </div>
          <div className="wallet-rule-item">
            <span className="rule-badge">2</span>
            <div>
              <strong>O‘z taklifingizni joylash</strong>
              <p>O‘rgata oladigan bilimlaringiz haqida e‘lon qo‘shing va boshqalar bilan tajriba almashing.</p>
            </div>
          </div>
          <div className="wallet-rule-item">
            <span className="rule-badge">3</span>
            <div>
              <strong>Kontaktlarni ochish</strong>
              <p>Har bir kontaktni ochish uchun atigi 1 tanga sarflanadi. Pul to‘lash shart emas!</p>
            </div>
          </div>
        </div>
      </div>
    </ModalFrame>
  )
}

// Foydalanuvchining ommaviy profili (boshqa odam profilini ochganda)
export function PublicProfileModal({
  member,
  offers,
  onClose,
  onUnlockContact,
  revealedContacts = [],
}: {
  member: MemberUser
  offers: Offer[]
  onClose: () => void
  onUnlockContact: (offer: Offer) => void
  revealedContacts?: string[]
}) {
  const memberOffers = offers.filter((o) => o.userId === member.id || o.username === member.username)

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
          src={member.avatar || avatarOptions[0]}
        />
        <div className="public-profile-info">
          <div className="public-profile-title-row">
            <h3>{member.name}</h3>
            {member.verified && <BadgeCheck className="verified-icon" size={16} />}
          </div>
          <div className="public-profile-username-tag">@{member.username}</div>
          <p className="public-profile-bio">{member.bio || 'Bu foydalanuvchi hali o‘zi haqida ma‘lumot kiritmagan.'}</p>
          <div className="public-profile-meta-row">
            <span>
              <MapPin size={12} /> Toshkent
            </span>
            <span>
              <Star fill="currentColor" size={12} /> 5.0 reyting
            </span>
            <span>
              <Tag size={12} /> {memberOffers.length} ta faol taklif
            </span>
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
                    <div>
                      <span className="skill-mini-tag teach">↗ Qo‘lidan keladi:</span>
                      <strong>{offer.canTeach}</strong>
                    </div>
                    <div>
                      <span className="skill-mini-tag learn">↘ O‘rganmoqchi:</span>
                      <strong>{offer.wantsToLearn}</strong>
                    </div>
                  </div>
                  <p className="public-offer-desc">{offer.description}</p>
                  <div className="public-offer-actions">
                    <span className="offer-category">{offer.category}</span>
                    {isRevealed ? (
                      <span className="contact-revealed-text">
                        Kontakt ochilgan: <strong>{offer.contact || offer.telegram || offer.phone}</strong>
                      </span>
                    ) : (
                      <button
                        className="button button-contact"
                        onClick={() => onUnlockContact(offer)}
                        type="button"
                      >
                        <UnlockKeyhole size={12} /> Kontaktni ochish (1 ◈)
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
