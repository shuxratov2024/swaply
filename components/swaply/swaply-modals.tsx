'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, ImagePlus, LogIn, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'
import { ModalFrame } from './modal-frame'
import type { Offer } from './types'

const avatarOptions = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85',
]

export function AuthModal({ onClose, onDone }: { onClose: () => void; onDone: (user: { id: number; name: string; email: string; avatar?: string; bio?: string; coins?: number }, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (mode === 'register' && password !== confirmPassword) {
      setError('Parollar mos kelmaydi')
      return
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register'
        ? { name, email, password }
        : { email, password }

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
      description={mode === 'login' ? 'Email va parol bilan kiring' : 'Yangi hisob yarating'}
      onClose={onClose}
      title={mode === 'login' ? 'Swaply\'ga kirish' : 'Ro\'yxatdan o\'tish'}
    >
      <div className="auth-intro-mark">
        {mode === 'login'
          ? <LogIn aria-hidden="true" size={19} />
          : <UserPlus aria-hidden="true" size={19} />
        }
      </div>
      <p className="modal-lead">
        {mode === 'login'
          ? 'Hamjamiyatga qaytib keling. Email va parolingiz bilan kiring.'
          : 'Hamjamiyatga qo\'shiling. Ismingiz, emailingiz va parolingizni kiriting.'
        }
      </p>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form className="modal-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <label className="form-label" htmlFor="auth-name">To'liq ism</label>
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
          </>
        )}

        <label className="form-label" htmlFor="auth-email">
          <Mail aria-hidden="true" size={12} style={{ display: 'inline', marginRight: 5, opacity: 0.6 }} />
          Email manzil
        </label>
        <input
          autoFocus={mode === 'login'}
          className="form-control"
          data-initial-focus={mode === 'login' ? 'true' : undefined}
          id="auth-email"
          maxLength={100}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          type="email"
          value={email}
        />

        <label className="form-label" htmlFor="auth-password">Parol</label>
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
            <label className="form-label" htmlFor="auth-confirm-password">Parolni tasdiqlang</label>
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

        <button
          className="button button-primary auth-submit"
          disabled={loading}
          type="submit"
        >
          {loading
            ? 'Kutilmoqda...'
            : mode === 'login'
              ? 'Kirish'
              : 'Ro\'yxatdan o\'tish'
          }
          {!loading && <ArrowUpRight aria-hidden="true" size={15} />}
        </button>
      </form>

      <div className="auth-divider"><span /> yoki <span /></div>

      <button
        className="google-button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError('')
        }}
        type="button"
      >
        {mode === 'login'
          ? <><UserPlus aria-hidden="true" size={15} /> Yangi hisob yaratish</>
          : <><LogIn aria-hidden="true" size={15} /> Allaqachon hisobim bor — Kirish</>
        }
      </button>

      <p className="privacy-note">
        <ShieldCheck aria-hidden="true" size={13} /> Ma'lumotlaringiz himoyalangan
      </p>
    </ModalFrame>
  )
}

export function OfferModal({ onClose, onSave }: { onClose: () => void; onSave: (offer: Omit<Offer, 'id'>) => void }) {
  const [canTeach, setCanTeach] = useState('')
  const [wantsToLearn, setWantsToLearn] = useState('')
  const [category, setCategory] = useState('IT & Dasturlash')
  const [description, setDescription] = useState('')

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      name: 'Dilnoza Karimova',
      avatar: avatarOptions[0],
      language: 'UZ',
      rating: '5.0',
      verified: true,
      canTeach,
      wantsToLearn,
      category,
      description,
      contact: '@dilnoza_swaply',
    })
  }

  return (
    <ModalFrame description="O'zingiz bilgan skillni boshqalarga taklif qiling" onClose={onClose} title="Yangi taklif yarating">
      <form className="modal-form" onSubmit={submitOffer}>
        <label className="form-label" htmlFor="teach-skill">Qo'limdan keladi</label>
        <input autoFocus className="form-control" data-initial-focus="true" id="teach-skill" maxLength={48} onChange={(event) => setCanTeach(event.target.value)} placeholder="Masalan, Figma'da UI dizayn" required value={canTeach} />
        <label className="form-label" htmlFor="learn-skill">Menga kerak</label>
        <input className="form-control" id="learn-skill" maxLength={48} onChange={(event) => setWantsToLearn(event.target.value)} placeholder="Masalan, Ingliz tili speaking" required value={wantsToLearn} />
        <label className="form-label" htmlFor="offer-category">Kategoriya</label>
        <select className="form-control form-select" id="offer-category" onChange={(event) => setCategory(event.target.value)} value={category}>
          <option>IT & Dasturlash</option><option>Ingliz tili / IELTS</option><option>UI/UX & 3D</option><option>Mobilografiya</option>
        </select>
        <label className="form-label" htmlFor="offer-description">Batafsil izoh</label>
        <textarea className="form-control form-textarea" id="offer-description" maxLength={240} onChange={(event) => setDescription(event.target.value)} placeholder="Qanday formatda almashishni xohlaysiz?" required value={description} />
        <div className="form-hint"><Sparkles aria-hidden="true" size={13} /> Pul emas, vaqt va tajriba almashiladi</div>
        <button className="button button-primary modal-submit" type="submit">E'lonni joylash <ArrowUpRight aria-hidden="true" size={15} /></button>
      </form>
    </ModalFrame>
  )
}

export function ProfileModal({
  name,
  bio,
  avatar,
  onClose,
  onSave,
}: {
  name: string
  bio: string
  avatar: string
  onClose: () => void
  onSave: (profile: { name: string; bio: string; avatar: string }) => void
}) {
  const [nextName, setNextName] = useState(name)
  const [nextBio, setNextBio] = useState(bio)
  const [nextAvatar, setNextAvatar] = useState(avatar)

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ name: nextName, bio: nextBio, avatar: nextAvatar })
  }

  return (
    <ModalFrame description="Hamjamiyat sizni yaxshiroq tanisin" onClose={onClose} title="Profilni tahrirlash">
      <form className="modal-form profile-form" onSubmit={submitProfile}>
        <div className="profile-preview-row">
          <div className="profile-preview-avatar-wrap">
            <img alt={`${nextName} profil rasmi`} className="profile-preview-avatar" onError={(event) => { event.currentTarget.src = '/placeholder-user.jpg' }} src={nextAvatar} />
            <span className="avatar-edit-badge"><ImagePlus aria-hidden="true" size={12} /></span>
          </div>
          <div><strong>Profil rasmi</strong><span>Profilingiz boshqalarga shunday ko'rinadi</span></div>
        </div>
        <div className="avatar-options" aria-label="Avatar tanlash" role="group">
          {avatarOptions.map((option) => (
            <button aria-label={`Avatar ${avatarOptions.indexOf(option) + 1} ni tanlash`} aria-pressed={nextAvatar === option} className={`avatar-option ${nextAvatar === option ? 'avatar-option-active' : ''}`} key={option} onClick={() => setNextAvatar(option)} type="button">
              <img alt="" src={option} />
              {nextAvatar === option && <Check aria-hidden="true" size={11} />}
            </button>
          ))}
        </div>
        <label className="form-label" htmlFor="profile-name">To'liq ism</label>
        <input autoFocus className="form-control" data-initial-focus="true" id="profile-name" maxLength={48} onChange={(event) => setNextName(event.target.value)} required value={nextName} />
        <label className="form-label" htmlFor="profile-bio">O'zingiz haqingizda</label>
        <textarea className="form-control form-textarea profile-bio" id="profile-bio" maxLength={180} onChange={(event) => setNextBio(event.target.value)} placeholder="Nimalarni o'rganmoqchisiz?" value={nextBio} />
        <button className="button button-primary modal-submit" type="submit">O'zgarishlarni saqlash <ArrowUpRight aria-hidden="true" size={15} /></button>
      </form>
    </ModalFrame>
  )
}
