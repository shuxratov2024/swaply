'use client'

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  AlertTriangle,
  ArrowLeftRight,
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
import { ModalFrame } from './modal-frame'
import {
  type Offer,
  type MemberUser,
  type UserReview,
  type SwapRequest,
  avatarOptions,
  type Gender,
} from './types'

export type AuthUser = {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  gender?: Gender
  role?: 'admin' | 'supporter' | 'user'
  verified?: boolean
  banned?: boolean
  coins?: number
  phone?: string
  telegram?: string
  whatsapp?: string
  unlockedOfferIds?: string[]
  lastClaimDate?: string
  createdAt?: string
}

// ---------------- AUTH MODAL (LOGIN & REGISTER WITH 6-DIGIT EMAIL OTP) ----------------
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
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode)
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp')
  const [otpStep, setOtpStep] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpInfoMsg, setOtpInfoMsg] = useState('')
  const [devOtpHint, setDevOtpHint] = useState('')
  const [resetSuccessMsg, setResetSuccessMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setTimeout(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => window.clearTimeout(t)
  }, [resendCooldown])

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

  function resetOtpState() {
    setOtpStep(false)
    setOtpDigits(['', '', '', '', '', ''])
    setOtpInfoMsg('')
    setDevOtpHint('')
    setResetSuccessMsg('')
    setError('')
  }

  function handleOtpChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, '')
    if (!clean) {
      const next = [...otpDigits]
      next[index] = ''
      setOtpDigits(next)
      return
    }
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = ['', '', '', '', '', '']
      chars.forEach((ch, idx) => {
        next[idx] = ch
      })
      setOtpDigits(next)
      const focusIdx = Math.min(chars.length, 5)
      otpRefs.current[focusIdx]?.focus()
      return
    }
    const next = [...otpDigits]
    next[index] = clean
    setOtpDigits(next)
    if (index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  async function requestOtp(purpose: 'login' | 'register' | 'reset') {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim(),
          purpose,
          ...(purpose === 'register' ? { username: username.trim().replace(/^@/, '') } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Kod yuborishda xatolik')
        return false
      }
      setOtpStep(true)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpInfoMsg(data.message || `${email.trim()} ga 6 xonali kod yuborildi`)
      setDevOtpHint(data.devOtp ? String(data.devOtp) : '')
      setResendCooldown(60)
      window.setTimeout(() => otpRefs.current[0]?.focus(), 80)
      return true
    } catch {
      setError('Serverga ulanishda xatolik yuz berdi')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (mode === 'login' && loginMethod === 'password') {
      if (password.length < 6) {
        setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Kirishda xatolik')
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
      return
    }

    if (mode === 'login' && loginMethod === 'otp') {
      if (!otpStep) {
        await requestOtp('login')
        return
      }
      const code = otpDigits.join('')
      if (!/^\d{6}$/.test(code)) {
        setError('6 xonali raqamli tasdiqlash kodini to‘liq kiriting')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            purpose: 'login',
            email: email.trim(),
            code,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Kod noto‘g‘ri')
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
      return
    }

    if (mode === 'reset') {
      if (!otpStep) {
        await requestOtp('reset')
        return
      }
      const code = otpDigits.join('')
      if (!/^\d{6}$/.test(code)) {
        setError('Emailingizga yuborilgan 6 xonali kodni kiriting')
        return
      }
      if (password.length < 6) {
        setError('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak')
        return
      }
      if (password !== confirmPassword) {
        setError('Kiritilgan parollar bir-biriga mos kelmaydi')
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            otpCode: code,
            newPassword: password,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Parolni tiklashda xatolik yuz berdi')
          return
        }
        setPassword('')
        setConfirmPassword('')
        setOtpStep(false)
        setOtpDigits(['', '', '', '', '', ''])
        setDevOtpHint('')
        setMode('login')
        setLoginMethod('password')
        setResetSuccessMsg(data.message || 'Parol yangilandi! Endi yangi parol bilan kiring.')
      } catch {
        setError('Serverga ulanishda xatolik yuz berdi')
      } finally {
        setLoading(false)
      }
      return
    }

    // Register flow (with 6-digit email OTP)
    if (!otpStep) {
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
      if (password.length < 6) {
        setError('Parol kamida 6 ta belgidan iborat bo‘lishi kerak')
        return
      }
      if (password !== confirmPassword) {
        setError('Kiritilgan parollar bir-biriga mos kelmaydi')
        return
      }
      await requestOtp('register')
      return
    }

    const code = otpDigits.join('')
    if (!/^\d{6}$/.test(code)) {
      setError('Emailingizga yuborilgan 6 xonali kodni kiriting')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().replace(/^@/, ''),
          gender,
          email: email.trim(),
          password,
          otpCode: code,
        }),
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
      description={
        otpStep
          ? 'Emailingizga yuborilgan 6 xonali tasdiqlash kodini kiriting'
          : mode === 'reset'
            ? 'Email manzilingizni kiriting — parolni tiklash uchun 6 xonali kod yuboramiz'
            : mode === 'login'
              ? 'Email orqali 6 xonali kod bilan yoki parol bilan hisobingizga kiring'
              : 'Swaply hamjamiyatiga qo‘shiling va +5 bepul tanga oling'
      }
      onClose={onClose}
      size="narrow"
      title={
        mode === 'reset'
          ? 'Parolni tiklash'
          : mode === 'login'
            ? 'Tizimga kirish'
            : 'Ro‘yxatdan o‘tish'
      }
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
            resetOtpState()
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
            resetOtpState()
          }}
          type="button"
        >
          <UserPlus size={14} />
          <span>Ro‘yxatdan o‘tish</span>
        </button>
      </div>

      {mode === 'login' && !otpStep && (
        <div className="auth-method-toggle">
          <button
            className={`auth-method-pill ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('otp')
              setError('')
            }}
            type="button"
          >
            Email (6 xonali kod)
          </button>
          <button
            className={`auth-method-pill ${loginMethod === 'password' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('password')
              setError('')
            }}
            type="button"
          >
            Parol bilan
          </button>
        </div>
      )}

      {resetSuccessMsg && <div className="wallet-success-banner" style={{ marginTop: 10, marginBottom: 0 }}>✓ {resetSuccessMsg}</div>}
      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form modern-auth-form" onSubmit={handleSubmit}>
        {otpStep ? (
          <div className="otp-verify-step">
            <div className="otp-sent-banner">
              <Mail size={15} />
              <span>{otpInfoMsg}</span>
            </div>

            {devOtpHint && (
              <div className="otp-dev-hint">
                Lokal test kodi (SMTP sozlanmagan): <strong>{devOtpHint}</strong>
              </div>
            )}

            <label className="form-label" style={{ textAlign: 'center', marginTop: 8 }}>
              6 xonali tasdiqlash kodi
            </label>
            <div className="otp-inputs otp-inputs-6">
              {otpDigits.map((digit, idx) => (
                <input
                  aria-label={`Kod raqami ${idx + 1}`}
                  inputMode="numeric"
                  key={idx}
                  maxLength={6}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  ref={(el) => {
                    otpRefs.current[idx] = el
                  }}
                  type="text"
                  value={digit}
                />
              ))}
            </div>

            <div className="otp-actions-row">
              <button
                className="otp-link-btn"
                onClick={() => resetOtpState()}
                type="button"
              >
                ← Emailni o‘zgartirish
              </button>
              <button
                className="otp-link-btn"
                disabled={resendCooldown > 0 || loading}
                onClick={() => requestOtp(mode)}
                type="button"
              >
                {resendCooldown > 0 ? `Qayta yuborish (${resendCooldown}s)` : 'Kodni qayta yuborish'}
              </button>
            </div>

            {mode === 'reset' && (
              <>
                <div className="form-group-modern" style={{ marginTop: 6 }}>
                  <label className="form-label" htmlFor="reset-new-password">
                    Yangi parol *
                  </label>
                  <input
                    className="form-control"
                    id="reset-new-password"
                    minLength={6}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <div className="form-group-modern">
                  <label className="form-label" htmlFor="reset-confirm-password">
                    Yangi parolni tasdiqlang *
                  </label>
                  <input
                    className="form-control"
                    id="reset-confirm-password"
                    minLength={6}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </div>
              </>
            )}

            <button className="button button-primary auth-submit-btn" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={15} /> Tekshirilmoqda...
                </>
              ) : mode === 'reset' ? (
                <>
                  Parolni yangilash <ArrowUpRight size={15} />
                </>
              ) : mode === 'login' ? (
                <>
                  Tasdiqlash va kirish <ArrowUpRight size={15} />
                </>
              ) : (
                <>
                  Tasdiqlash (+5 tanga) <ArrowUpRight size={15} />
                </>
              )}
            </button>
          </div>
        ) : (
          <>
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
                      placeholder="Masalan: Dilshod Karimov"
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
                      placeholder="dilshod.uz"
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
                {mode === 'login' && loginMethod === 'password'
                  ? 'Email manzil yoki @username *'
                  : 'Email manzil *'}
              </label>
              <div className="input-with-icon">
                <Mail className="field-icon" size={15} />
                <input
                  autoFocus={mode === 'login'}
                  className="form-control"
                  id="auth-email"
                  maxLength={100}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === 'login' && loginMethod === 'password'
                      ? 'email@example.com yoki @username'
                      : 'email@example.com'
                  }
                  required
                  type={mode === 'login' && loginMethod === 'password' ? 'text' : 'email'}
                  value={email}
                />
              </div>
            </div>

            {(mode === 'register' || (mode === 'login' && loginMethod === 'password')) && (
              <div className="form-group-modern">
                <div className="label-with-hint">
                  <label className="form-label" htmlFor="auth-password">
                    Parol *
                  </label>
                  {mode === 'login' && loginMethod === 'password' && (
                    <button
                      className="otp-link-btn"
                      onClick={() => {
                        setMode('reset')
                        setPassword('')
                        setConfirmPassword('')
                        resetOtpState()
                      }}
                      type="button"
                    >
                      Parolni unutdingizmi?
                    </button>
                  )}
                </div>
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
            )}

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
              ) : mode === 'reset' ? (
                <>
                  Tiklash kodini yuborish <ArrowUpRight size={15} />
                </>
              ) : mode === 'login' && loginMethod === 'password' ? (
                <>
                  Kirish <ArrowUpRight size={15} />
                </>
              ) : (
                <>
                  Emailga 6 xonali kod yuborish <ArrowUpRight size={15} />
                </>
              )}
            </button>

            {mode === 'login' && loginMethod === 'otp' && (
              <button
                className="otp-link-btn"
                onClick={() => {
                  setMode('reset')
                  setPassword('')
                  setConfirmPassword('')
                  resetOtpState()
                }}
                style={{ alignSelf: 'center', marginTop: 8 }}
                type="button"
              >
                Parolni unutdingizmi? Tiklash
              </button>
            )}

            {mode === 'reset' && (
              <button
                className="otp-link-btn"
                onClick={() => {
                  setMode('login')
                  resetOtpState()
                }}
                style={{ alignSelf: 'center', marginTop: 8 }}
                type="button"
              >
                ← Kirishga qaytish
              </button>
            )}
          </>
        )}
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

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearTimeout(timer)
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
      const res = await fetch('/api/reports', {
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

// ---------------- SWAP PROPOSAL MODAL (BARTER ALMASHUV TAKLIFI) ----------------
export function SwapProposalModal({
  offer,
  onClose,
  onSuccess,
}: {
  offer: Offer
  onClose: () => void
  onSuccess: (message: string) => void
}) {
  const [proposedSkill, setProposedSkill] = useState(offer.wantsToLearn || '')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      setError('Almashuv taklifi yuborish uchun tizimga kiring')
      return
    }
    if (proposedSkill.trim().length < 2 || message.trim().length < 4) {
      setError('Taklif qilayotgan ko‘nikma va xabarni to‘liq yozing')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: offer.id,
          proposedSkill: proposedSkill.trim(),
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Taklif yuborishda xatolik')
        return
      }
      onSuccess(data.message || 'Almashuv taklifingiz yuborildi!')
      onClose()
    } catch {
      setError('Server bilan bog‘lanishda xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalFrame
      description={`${offer.name} (@${offer.username || 'user'}) ga ko‘nikma almashish taklifi yuboring`}
      onClose={onClose}
      size="narrow"
      title="Barter almashuv taklifi"
    >
      <div className="swap-offer-summary">
        <div>
          <small>U o‘rgatadi:</small>
          <strong>{offer.canTeach}</strong>
        </div>
        <ArrowLeftRight size={16} />
        <div>
          <small>U o‘rganmoqchi:</small>
          <strong>{offer.wantsToLearn}</strong>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="swap-proposed-skill">
          Siz nima o‘rgata olasiz? *
        </label>
        <input
          className="form-control"
          id="swap-proposed-skill"
          maxLength={100}
          onChange={(e) => setProposedSkill(e.target.value)}
          placeholder="Masalan: Ingliz tili (IELTS) yoki React asoslari"
          required
          value={proposedSkill}
        />

        <label className="form-label" htmlFor="swap-message">
          Qisqa taklif xabari *
        </label>
        <textarea
          className="form-control form-textarea"
          id="swap-message"
          maxLength={400}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Salom! Haftada 2 marta kechqurun birga mashg‘ulot qilsak bo‘ladimi?"
          required
          rows={3}
          value={message}
        />

        <button className="button button-primary modal-submit" disabled={submitting} type="submit">
          {submitting ? <Loader2 className="spin-icon" size={15} /> : 'Almashuv taklifini yuborish'}
        </button>
      </form>
    </ModalFrame>
  )
}

// ---------------- MY SWAPS MODAL (ALMASHUVLARIM) ----------------
export function MySwapsModal({
  onClose,
  onStatusUpdated,
}: {
  onClose: () => void
  onStatusUpdated: (message: string, newCoins?: number) => void
}) {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [incoming, setIncoming] = useState<SwapRequest[]>([])
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadSwaps() {
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/swaps', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setIncoming(Array.isArray(data.incoming) ? data.incoming : [])
      setOutgoing(Array.isArray(data.outgoing) ? data.outgoing : [])
    } catch {
      setError('Almashuvlarni yuklab bo‘lmadi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSwaps()
  }, [])

  async function handleAction(swapId: string, status: 'accepted' | 'declined' | 'completed') {
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    setBusyId(swapId)
    setError('')
    try {
      const res = await fetch('/api/swaps', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ swapId, status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Amal bajarilmadi')
        return
      }
      onStatusUpdated(data.message || 'Yangilandi!', typeof data.coins === 'number' ? data.coins : undefined)
      await loadSwaps()
    } catch {
      setError('Server bilan bog‘lanishda xatolik')
    } finally {
      setBusyId(null)
    }
  }

  const list = tab === 'incoming' ? incoming : outgoing

  return (
    <ModalFrame
      description="Kiruvchi va yuborilgan barter takliflarini boshqaring. Yakunlangan har bir almashuv uchun +1 tanga bonus!"
      onClose={onClose}
      size="wide"
      title="Almashuvlarim"
    >
      <div className="auth-mode-segmented" style={{ marginTop: 12 }}>
        <button
          className={`auth-segment-btn ${tab === 'incoming' ? 'active' : ''}`}
          onClick={() => setTab('incoming')}
          type="button"
        >
          Kiruvchi ({incoming.length})
        </button>
        <button
          className={`auth-segment-btn ${tab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setTab('outgoing')}
          type="button"
        >
          Yuborilgan ({outgoing.length})
        </button>
      </div>

      {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <Loader2 className="spin-icon" size={18} /> Yuklanmoqda...
        </div>
      ) : list.length === 0 ? (
        <div className="public-offers-empty" style={{ marginTop: 14 }}>
          {tab === 'incoming'
            ? 'Hozircha sizga almashuv takliflari kelmagan.'
            : 'Siz hali birorta almashuv taklifi yubormagansiz.'}
        </div>
      ) : (
        <div className="swaps-list">
          {list.map((swap) => (
            <div className="swap-item-card" key={swap.id}>
              <div className="swap-item-head">
                <div>
                  <strong>
                    {tab === 'incoming'
                      ? `${swap.senderName} (@${swap.senderUsername})`
                      : `${swap.receiverName} (@${swap.receiverUsername})`}
                  </strong>
                  <div className="swap-item-skills">
                    <span>{swap.offerCanTeach}</span> ↔ <span>{swap.proposedSkill}</span>
                  </div>
                </div>
                <span className={`tx-status ${swap.status === 'accepted' || swap.status === 'completed' ? 'completed' : swap.status === 'declined' ? 'rejected' : 'pending'}`}>
                  {swap.status === 'pending'
                    ? 'Kutilmoqda'
                    : swap.status === 'accepted'
                      ? 'Qabul qilindi'
                      : swap.status === 'completed'
                        ? 'Yakunlandi ✓'
                        : 'Rad etildi'}
                </span>
              </div>

              <p className="swap-item-msg">&ldquo;{swap.message}&rdquo;</p>

              <div className="swap-item-actions">
                {tab === 'incoming' && swap.status === 'pending' && (
                  <>
                    <button
                      className="button button-primary"
                      disabled={busyId === swap.id}
                      onClick={() => handleAction(swap.id, 'accepted')}
                      style={{ minHeight: 34, padding: '0 12px', fontSize: 11 }}
                      type="button"
                    >
                      <Check size={13} /> Qabul qilish
                    </button>
                    <button
                      className="button button-cream"
                      disabled={busyId === swap.id}
                      onClick={() => handleAction(swap.id, 'declined')}
                      style={{ minHeight: 34, padding: '0 12px', fontSize: 11 }}
                      type="button"
                    >
                      Rad etish
                    </button>
                  </>
                )}
                {swap.status === 'accepted' && (
                  <button
                    className="button button-primary"
                    disabled={busyId === swap.id}
                    onClick={() => handleAction(swap.id, 'completed')}
                    style={{ minHeight: 34, padding: '0 12px', fontSize: 11 }}
                    type="button"
                  >
                    <Sparkles size={13} /> Almashuv yakunlandi (+1 ◈)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalFrame>
  )
}

// ---------------- PUBLIC PROFILE MODAL (WITH REAL RATING & REVIEWS) ----------------
export function PublicProfileModal({
  member,
  offers,
  revealedContacts,
  currentUserId,
  onClose,
  onUnlockContact,
  onReport,
  onProposeSwap,
  onRatingUpdated,
  onStartChat,
}: {
  member: MemberUser
  offers: Offer[]
  revealedContacts: string[]
  currentUserId?: number
  onClose: () => void
  onUnlockContact: (offer: Offer) => void
  onReport?: (member: MemberUser) => void
  onProposeSwap?: (offer: Offer) => void
  onRatingUpdated?: (message: string) => void
  onStartChat?: (member: MemberUser, offer?: Offer) => void
}) {
  const memberOffers = offers.filter(
    (o) => o.userId === member.id || (o.username && o.username === member.username)
  )

  const [reviews, setReviews] = useState<UserReview[]>([])
  const [avgRating, setAvgRating] = useState(member.rating || '5.0')
  const [reviewsCount, setReviewsCount] = useState(member.reviewsCount || 0)
  const [myRating, setMyRating] = useState(5)
  const [myComment, setMyComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const isOwnProfile = currentUserId !== undefined && currentUserId === member.id

  async function loadReviews() {
    try {
      const params = new URLSearchParams()
      if (member.username) params.set('username', member.username)
      if (member.id) params.set('userId', String(member.id))
      const res = await fetch(`/api/reviews?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.reviews)) setReviews(data.reviews)
      if (data.averageRating) setAvgRating(data.averageRating)
      if (typeof data.totalCount === 'number') setReviewsCount(data.totalCount)
    } catch {}
  }

  useEffect(() => {
    loadReviews()
  }, [member.id, member.username])

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      setReviewError('Baho va sharh qoldirish uchun avval tizimga kiring')
      return
    }
    if (myComment.trim().length < 3) {
      setReviewError('Sharh kamida 3 ta belgidan iborat bo‘lishi kerak')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: member.id,
          targetUsername: member.username,
          rating: myRating,
          comment: myComment.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReviewError(data.error || 'Baho saqlanmadi')
        return
      }
      setMyComment('')
      setReviewSuccess(data.message || 'Bahoyingiz saqlandi!')
      if (data.averageRating) setAvgRating(data.averageRating)
      if (typeof data.totalCount === 'number') setReviewsCount(data.totalCount)
      await loadReviews()
      onRatingUpdated?.(data.message || 'Reyting yangilandi!')
    } catch {
      setReviewError('Server bilan bog‘lanib bo‘lmadi')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <ModalFrame
      description={`@${member.username} a‘zosining profili, e‘lonlari va reytingi`}
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
            {onReport && !isOwnProfile && (
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
              <Star fill="currentColor" size={12} /> {avgRating} reyting ({reviewsCount} sharh)
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
              const isRevealed = revealedContacts.includes(offer.id) || isOwnProfile
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
                    <div className="card-footer-cta-group">
                      {onProposeSwap && !isOwnProfile && (
                        <button
                          className="button-swap-outline"
                          onClick={() => onProposeSwap(offer)}
                          type="button"
                        >
                          <ArrowLeftRight size={12} /> Taklif
                        </button>
                      )}
                      {isRevealed ? (
                        <>
                          <span className="contact-unlocked-badge">
                            ✓ {offer.telegram || offer.phone || offer.contact || 'Ochiq'}
                          </span>
                          {!isOwnProfile && member.id > 0 && onStartChat && (
                            <button
                              className="button button-contact start-chat-chip-btn"
                              onClick={() => onStartChat(member, offer)}
                              type="button"
                            >
                              <MessageCircle size={12} /> Chatni boshlash
                            </button>
                          )}
                        </>
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
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reyting va Sharhlar bo'limi */}
      <div className="public-reviews-section">
        <h4 className="public-offers-heading">
          Reyting va Sharhlar ({reviewsCount})
        </h4>

        {!isOwnProfile && (
          <form className="review-form-box" onSubmit={handleReviewSubmit}>
            <div className="review-stars-picker">
              <span>Baho bering:</span>
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    aria-label={`${star} yulduz`}
                    className={`star-pick-btn ${star <= myRating ? 'active' : ''}`}
                    key={star}
                    onClick={() => setMyRating(star)}
                    type="button"
                  >
                    <Star fill={star <= myRating ? 'currentColor' : 'none'} size={17} />
                  </button>
                ))}
              </div>
              <strong className="star-rating-label">{myRating}.0 / 5.0</strong>
            </div>

            {reviewError && <div className="auth-error">{reviewError}</div>}
            {reviewSuccess && <div className="wallet-success-banner">✓ {reviewSuccess}</div>}

            <div className="review-input-row">
              <input
                className="form-control"
                maxLength={300}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder="Hamkorlik va tajriba almashuv haqida fikringizni yozing..."
                value={myComment}
              />
              <button className="button button-primary" disabled={submittingReview} type="submit">
                {submittingReview ? <Loader2 className="spin-icon" size={14} /> : 'Yuborish'}
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="public-offers-empty">Hali sharhlar yo‘q. Birinchi bo‘lib baho bering!</div>
        ) : (
          <div className="reviews-list">
            {reviews.map((rev) => (
              <div className="review-item-card" key={rev.id}>
                <div className="review-item-head">
                  <div className="review-author">
                    <img
                      alt=""
                      className="review-author-avatar"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-user.jpg'
                      }}
                      src={rev.reviewerAvatar || '/placeholder-user.jpg'}
                    />
                    <div>
                      <strong>{rev.reviewerName}</strong>
                      <span>@{rev.reviewerUsername}</span>
                    </div>
                  </div>
                  <span className="review-stars-badge">
                    <Star fill="currentColor" size={11} /> {rev.rating}.0
                  </span>
                </div>
                <p className="review-item-comment">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalFrame>
  )
}

// ---------------- WALLET MODAL (HAMYON VA 2-BOSQICHLI TOP-UP) ----------------
type WalletPack = {
  id: 'start' | 'popular' | 'pro' | 'vip'
  title: string
  subtitle: string
  baseCoins: number
  bonusCoins: number
  totalCoins: number
  priceUzs: number
  badge?: string
  popular?: boolean
}

type WalletTransaction = {
  id: string
  type: 'topup' | 'spend' | 'daily_bonus' | 'admin_adjust'
  packTitle?: string
  coinsDelta: number
  amountUzs: number
  provider?: 'payme' | 'click' | 'uzum'
  status: 'pending' | 'completed' | 'rejected'
  note?: string
  createdAt: string
}

const DEFAULT_WALLET_PACKS: WalletPack[] = [
  { id: 'start', title: 'Start', subtitle: 'Sinab ko‘rish uchun', baseCoins: 5, bonusCoins: 0, totalCoins: 5, priceUzs: 5000 },
  { id: 'popular', title: 'Ommabop', subtitle: '+20% bepul bonus', baseCoins: 15, bonusCoins: 3, totalCoins: 18, priceUzs: 15000, badge: 'Mashhur', popular: true },
  { id: 'pro', title: 'Pro', subtitle: '+30% bepul bonus', baseCoins: 30, bonusCoins: 9, totalCoins: 39, priceUzs: 30000, badge: 'Eng foydali' },
  { id: 'vip', title: 'VIP', subtitle: '+40% bepul bonus', baseCoins: 50, bonusCoins: 20, totalCoins: 70, priceUzs: 50000, badge: 'Maksimal' },
]

export function WalletModal({
  coins,
  onClose,
  onTopUpSubmitted,
}: {
  coins: number
  onClose: () => void
  onTopUpSubmitted: (message: string) => void
}) {
  const [packs, setPacks] = useState<WalletPack[]>(DEFAULT_WALLET_PACKS)
  const [selectedPackId, setSelectedPackId] = useState<WalletPack['id']>('popular')
  const [provider, setProvider] = useState<'payme' | 'click' | 'uzum'>('payme')
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState<{
    checked: boolean
    valid: boolean
    bonusCoins: number
    message: string
  } | null>(null)
  const [step, setStep] = useState<'select' | 'checkout' | 'submitted'>('select')
  const [paymentRef, setPaymentRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedInfo, setSubmittedInfo] = useState<{ id: string; coinsDelta: number; amountUzs: number } | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])

  async function loadWalletState() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('swaply_token') : null
    try {
      const res = await fetch('/api/coins/topup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.packs) && data.packs.length > 0) {
        setPacks(data.packs)
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions)
      }
    } catch {}
  }

  useEffect(() => {
    loadWalletState()
  }, [])

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[1] || packs[0]
  const promoBonus = promoStatus?.valid ? promoStatus.bonusCoins : 0
  const finalTotalCoins = selectedPack.totalCoins + promoBonus

  async function handleCheckPromo() {
    setErrorMsg('')
    const clean = promoCode.trim().toUpperCase()
    if (!clean) {
      setPromoStatus(null)
      return
    }
    try {
      const res = await fetch(
        `/api/coins/topup?promo=${encodeURIComponent(clean)}&packId=${encodeURIComponent(selectedPack.id)}`
      )
      const data = await res.json()
      const check = data.promoCheck
      if (check?.valid) {
        setPromoStatus({
          checked: true,
          valid: true,
          bonusCoins: check.bonusCoins || 0,
          message: `Promo-kod faol: +${check.bonusCoins} bonus tanga qo‘shiladi!`,
        })
      } else {
        setPromoStatus({
          checked: true,
          valid: false,
          bonusCoins: 0,
          message: check?.error || 'Promo-kod topilmadi',
        })
      }
    } catch {
      setPromoStatus({
        checked: true,
        valid: false,
        bonusCoins: 0,
        message: 'Promo-kodni tekshirib bo‘lmadi',
      })
    }
  }

  async function handleSubmitOrder(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    const token = localStorage.getItem('swaply_token')
    if (!token) {
      setErrorMsg('To‘lov so‘rovini yuborish uchun tizimga kiring')
      return
    }

    if (paymentRef.trim().length < 4) {
      setErrorMsg('Chek/tranzaksiya raqami yoki telefon oxirgi 4 raqamini kiriting')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/coins/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packId: selectedPack.id,
          provider,
          paymentRef: paymentRef.trim(),
          promoCode: promoStatus?.valid ? promoCode.trim().toUpperCase() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'To‘lov so‘rovini yuborishda xatolik')
        return
      }

      setSubmittedInfo({
        id: data.transaction?.id || 'ORD',
        coinsDelta: data.transaction?.coinsDelta || finalTotalCoins,
        amountUzs: data.transaction?.amountUzs || selectedPack.priceUzs,
      })
      setStep('submitted')
      setPaymentRef('')
      onTopUpSubmitted(data.message || 'To‘lov so‘rovi qabul qilindi!')
      loadWalletState()
    } catch {
      setErrorMsg('Server bilan bog‘lanishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const providerLabels: Record<'payme' | 'click' | 'uzum', string> = {
    payme: 'Payme',
    click: 'Click',
    uzum: 'Uzum Bank',
  }

  return (
    <ModalFrame
      description="1 tanga = 1,000 UZS. Katta paketlarda +40% gacha bepul bonus tangalar oling!"
      onClose={onClose}
      size="wide"
      title="Swaply Hamyoni"
    >
      <div className="wallet-card">
        <div className="wallet-card-bg" />
        <div className="wallet-top">
          <span className="wallet-badge">
            <Coins size={14} /> Tanga Balansi
          </span>
          <span className="wallet-currency">1 ◈ = 1,000 UZS</span>
        </div>
        <div className="wallet-balance">
          <span className="wallet-coins-num">{coins}</span>
          <span className="wallet-coins-symbol">◈</span>
        </div>
        <div className="wallet-bottom">
          <span className="wallet-note">1 ta kontakt ochish = 1 ta tanga • Promo-kod: WELCOME (+3 ◈)</span>
        </div>
      </div>

      {errorMsg && <div className="auth-error">{errorMsg}</div>}

      {step === 'select' && (
        <>
          <div className="packs-title">1. Tanga paketini tanlang:</div>
          <div className="coin-packs-grid coin-packs-grid-4">
            {packs.map((pack) => (
              <div
                className={`coin-pack-card ${selectedPack.id === pack.id ? 'pack-selected' : ''}`}
                key={pack.id}
                onClick={() => {
                  setSelectedPackId(pack.id)
                  if (promoCode.trim()) setPromoStatus(null)
                }}
              >
                {pack.badge && (
                  <span className={`pack-popular-badge ${pack.popular ? 'is-popular' : ''}`}>
                    {pack.badge}
                  </span>
                )}
                <div className="pack-title-label">{pack.title}</div>
                <div className="pack-amount">
                  {pack.baseCoins}
                  {pack.bonusCoins > 0 && <span className="pack-bonus-plus">+{pack.bonusCoins}</span>} ◈
                </div>
                <div className="pack-price">{pack.priceUzs.toLocaleString()} UZS</div>
                <div className="pack-sub-note">{pack.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="wallet-promo-row">
            <input
              className="form-control"
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase())
                setPromoStatus(null)
              }}
              placeholder="Promo-kod (masalan: WELCOME yoki SWAPLY20)"
              type="text"
              value={promoCode}
            />
            <button className="button button-cream wallet-promo-btn" onClick={handleCheckPromo} type="button">
              Tekshirish
            </button>
          </div>
          {promoStatus && (
            <div className={`wallet-promo-msg ${promoStatus.valid ? 'ok' : 'err'}`}>
              {promoStatus.message}
            </div>
          )}

          <div className="packs-title" style={{ marginTop: 12 }}>
            2. To‘lov tizimini tanlang:
          </div>
          <div className="wallet-providers-row">
            {(['payme', 'click', 'uzum'] as const).map((p) => (
              <button
                className={`wallet-provider-btn ${provider === p ? 'active' : ''}`}
                key={p}
                onClick={() => setProvider(p)}
                type="button"
              >
                {providerLabels[p]}
              </button>
            ))}
          </div>

          <button
            className="button button-primary wallet-buy-btn"
            onClick={() => {
              setErrorMsg('')
              setStep('checkout')
            }}
            type="button"
          >
            To‘lovga o‘tish ({selectedPack.priceUzs.toLocaleString()} UZS → +{finalTotalCoins} ◈)
            <ArrowUpRight size={15} />
          </button>
        </>
      )}

      {step === 'checkout' && (
        <form className="wallet-checkout-box" onSubmit={handleSubmitOrder}>
          <div className="wallet-invoice-card">
            <div className="invoice-row">
              <span>Tanlangan paket:</span>
              <strong>{selectedPack.title} ({selectedPack.baseCoins} + {selectedPack.bonusCoins} bonus)</strong>
            </div>
            {promoBonus > 0 && (
              <div className="invoice-row">
                <span>Promo-kod ({promoCode.toUpperCase()}):</span>
                <strong className="invoice-bonus">+{promoBonus} bonus ◈</strong>
              </div>
            )}
            <div className="invoice-row">
              <span>To‘lov usuli:</span>
              <strong>{providerLabels[provider]}</strong>
            </div>
            <div className="invoice-row invoice-total">
              <span>Jami olinadigan tanga:</span>
              <strong>+{finalTotalCoins} ◈</strong>
            </div>
            <div className="invoice-row invoice-total">
              <span>To‘lov summasi:</span>
              <strong>{selectedPack.priceUzs.toLocaleString()} UZS</strong>
            </div>
          </div>

          <div className="wallet-pay-instructions">
            <strong>{providerLabels[provider]}</strong> ilovasi orqali{' '}
            <strong>{selectedPack.priceUzs.toLocaleString()} UZS</strong> to‘lovni amalga oshiring va quyida
            chek/tranzaksiya raqami yoki telefon raqamingizning oxirgi 4 raqamini kiriting:
          </div>

          <label className="form-label" htmlFor="payment-ref-input">
            Chek / Tranzaksiya ID yoki telefon oxirgi 4 raqami
          </label>
          <input
            className="form-control"
            id="payment-ref-input"
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="Masalan: 8812 yoki PAYME-94821"
            required
            type="text"
            value={paymentRef}
          />

          <div className="wallet-checkout-actions">
            <button
              className="button button-cream"
              onClick={() => setStep('select')}
              type="button"
            >
              Orqaga
            </button>
            <button className="button button-primary" disabled={submitting} style={{ flex: 1 }} type="submit">
              {submitting ? <Loader2 className="spin-icon" size={15} /> : 'To‘lov so‘rovini yuborish'}
            </button>
          </div>
        </form>
      )}

      {step === 'submitted' && submittedInfo && (
        <div className="wallet-submitted-card">
          <div className="wallet-success-banner">
            ✓ Buyurtma <strong>#{submittedInfo.id}</strong> yuborildi!
          </div>
          <p className="wallet-submitted-desc">
            <strong>{submittedInfo.amountUzs.toLocaleString()} UZS</strong> to‘lov so‘rovingiz tekshiruvga
            yuborildi. Admin tasdiqlashi bilan hisobingizga <strong>+{submittedInfo.coinsDelta} ◈</strong>{' '}
            tanga qo‘shiladi.
          </p>
          <button
            className="button button-primary wallet-buy-btn"
            onClick={() => setStep('select')}
            type="button"
          >
            Yana paket tanlash
          </button>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="wallet-history-section">
          <div className="packs-title">So‘nggi amallar tarixi</div>
          <div className="wallet-history-list">
            {transactions.slice(0, 4).map((tx) => (
              <div className="wallet-history-item" key={tx.id}>
                <div>
                  <strong>{tx.note || tx.packTitle || tx.type}</strong>
                  <small>
                    {tx.provider ? `${tx.provider.toUpperCase()} • ` : ''}
                    {tx.amountUzs > 0 ? `${tx.amountUzs.toLocaleString()} UZS` : 'Tanga amali'}
                  </small>
                </div>
                <div className="wallet-history-right">
                  <span className={tx.coinsDelta >= 0 ? 'tx-plus' : 'tx-minus'}>
                    {tx.coinsDelta >= 0 ? `+${tx.coinsDelta}` : tx.coinsDelta} ◈
                  </span>
                  <span className={`tx-status ${tx.status}`}>
                    {tx.status === 'pending' ? 'Kutilmoqda' : tx.status === 'completed' ? 'Tasdiqlandi' : 'Rad etildi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="wallet-safety-note">
        <ShieldCheck size={13} /> To‘lovlar Payme, Click va Uzum Bank orqali xavfsiz qabul qilinadi
      </p>
    </ModalFrame>
  )
}

// ---------------- IN-SITE CONFIRMATION MODAL (ALERT O'RNIGA) ----------------
export function ConfirmActionModal({
  title,
  description,
  confirmLabel = 'Ha, o‘chirilsin',
  cancelLabel = 'Bekor qilish',
  danger = true,
  busy = false,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <ModalFrame description={description} onClose={onClose} size="narrow" title={title}>
      <div className="confirm-action-box">
        <div className={`confirm-action-icon ${danger ? 'is-danger' : ''}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="confirm-action-text">{description}</p>
        <div className="confirm-action-buttons">
          <button className="button button-cream" disabled={busy} onClick={onClose} type="button">
            {cancelLabel}
          </button>
          <button
            className={`button ${danger ? 'button-danger' : 'button-primary'}`}
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {busy ? <Loader2 className="spin-icon" size={15} /> : confirmLabel}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}
