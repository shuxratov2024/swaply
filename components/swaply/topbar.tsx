'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Coins,
  Globe2,
  LogIn,
  LogOut,
  Plus,
  Search,
  Shield,
  Star,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import type { Locale, MemberUser } from './types'
import { copy } from './translations'

export function Topbar({
  coins,
  claimed,
  name,
  username,
  avatar,
  locale,
  isLoggedIn,
  isAdmin,
  onLocaleChange,
  onClaim,
  onAdd,
  onEditProfile,
  onSignIn,
  onRegister,
  onLogout,
  onWalletClick,
  onOpenAdmin,
  onSelectUser,
}: {
  coins: number
  claimed: boolean
  name: string
  username?: string
  avatar: string
  locale: Locale
  isLoggedIn: boolean
  isAdmin?: boolean
  onLocaleChange: (locale: Locale) => void
  onClaim: () => void
  onAdd: () => void
  onEditProfile: () => void
  onSignIn: () => void
  onRegister: () => void
  onLogout: () => void
  onWalletClick?: () => void
  onOpenAdmin?: () => void
  onSelectUser?: (member: MemberUser) => void
}) {
  const text = copy[locale]
  const [headerSearch, setHeaderSearch] = useState('')
  const [searchResults, setSearchResults] = useState<MemberUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Headerda foydalanuvchilarni Ism, Familiya va @username orqali qidirish
  useEffect(() => {
    const clean = headerSearch.trim()
    if (!clean || clean.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users?query=${encodeURIComponent(clean)}`)
        const data = await res.json()
        if (Array.isArray(data.users)) {
          setSearchResults(data.users)
          setShowDropdown(true)
        }
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [headerSearch])

  // Tashqariga bosganda dropdownni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar-wrap">
      <nav aria-label="Asosiy navigatsiya" className="topbar">
        <a aria-label="Swaply bosh sahifa" className="brand" href="#top">
          <span className="brand-icon">
            <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </span>
          <span className="brand-name">
            swaply<span className="brand-dot">.</span>
          </span>
          <span className="brand-tag">{text.skillBarter}</span>
        </a>

        {/* Header Smart User Search (Name, Last Name, @username) */}
        <div className="header-user-search-wrap" ref={dropdownRef}>
          <div className="header-search-input-box">
            <Search className="header-search-icon" size={14} />
            <input
              className="header-search-input"
              onChange={(e) => setHeaderSearch(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true)
              }}
              placeholder="Foydalanuvchilarni qidirish (@amir, Ism, Familiya)..."
              type="text"
              value={headerSearch}
            />
            {headerSearch && (
              <button
                className="header-clear-search"
                onClick={() => {
                  setHeaderSearch('')
                  setShowDropdown(false)
                }}
                type="button"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Profile Dropdown */}
          {showDropdown && (
            <div className="header-search-dropdown surface-card">
              <div className="dropdown-heading">
                <span>Topilgan foydalanuvchilar ({searchResults.length})</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="dropdown-empty">
                  {searching ? 'Qidirilmoqda...' : 'Foydalanuvchi topilmadi'}
                </div>
              ) : (
                <div className="dropdown-list">
                  {searchResults.slice(0, 6).map((user) => (
                    <div
                      className="dropdown-user-item"
                      key={user.id}
                      onClick={() => {
                        onSelectUser?.(user)
                        setShowDropdown(false)
                      }}
                    >
                      <img
                        alt={user.name}
                        className="dropdown-user-avatar"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-user.jpg'
                        }}
                        src={user.avatar || '/placeholder-user.jpg'}
                      />
                      <div className="dropdown-user-meta">
                        <div className="dropdown-user-name">
                          <strong>{user.name}</strong>
                          {user.gender === 'male' && <span className="mini-gender">👨</span>}
                          {user.gender === 'female' && <span className="mini-gender">👩</span>}
                        </div>
                        <span className="dropdown-user-username">@{user.username}</span>
                      </div>
                      <div className="dropdown-user-skills">
                        {user.skillsTeach && user.skillsTeach.length > 0 && (
                          <span className="dropdown-teach-badge">↗ {user.skillsTeach[0]}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-actions">
          {/* Admin panel trigger */}
          {isLoggedIn && isAdmin && (
            <button
              aria-label="Admin panel"
              className="admin-topbar-pill"
              onClick={() => setModal('admin')}
              title="Admin Dashboard: Tahlil va monitoring"
              type="button"
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
          )}

          {isLoggedIn && (
            <div
              className="wallet-pill"
              aria-label={`${text.wallet}: ${coins} ${text.coinLabel}`}
              onClick={onWalletClick}
              role="button"
              tabIndex={0}
              title="Hamyon va tangalar haqida ma'lumot"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onWalletClick?.()
                }
              }}
            >
              <span className="coin-icon">
                <Coins aria-hidden="true" size={16} />
              </span>
              <span className="coin-count">{coins}</span>
              <span className="coin-label">{text.coinLabel}</span>
              <span className="wallet-divider" />
              <button
                aria-label={claimed ? text.claimed : text.dailyBonus}
                className="wallet-bonus"
                disabled={claimed}
                onClick={(e) => {
                  e.stopPropagation()
                  onClaim()
                }}
                title={claimed ? 'Bugun olingan' : 'Kunlik +1 tanga'}
              >
                {claimed ? <Check aria-hidden="true" size={14} /> : <Plus aria-hidden="true" size={14} />}
                <span>{claimed ? text.claimed : text.dailyBonus}</span>
              </button>
            </div>
          )}

          <button className="button button-primary nav-add" onClick={onAdd} type="button">
            <Plus aria-hidden="true" size={16} /> {text.addOffer}
          </button>

          <div aria-label={text.language} className="language-switcher" role="group">
            <Globe2 aria-hidden="true" size={14} />
            {(['UZ', 'RU', 'EN'] as Locale[]).map((option) => (
              <button
                aria-pressed={locale === option}
                className={locale === option ? 'language-active' : ''}
                key={option}
                onClick={() => onLocaleChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>

          {isLoggedIn ? (
            <>
              <button
                aria-label={`Profilni ko‘rish, ${name}`}
                className="profile-trigger"
                onClick={onEditProfile}
                type="button"
              >
                <img
                  alt={`${name} profili`}
                  className="topbar-avatar"
                  onError={(event) => {
                    event.currentTarget.src = '/placeholder-user.jpg'
                  }}
                  src={avatar || '/placeholder-user.jpg'}
                />
                <span className="profile-name">{name || 'Foydalanuvchi'}</span>
                <ChevronDown aria-hidden="true" className="profile-chevron" size={14} />
              </button>
              <button
                aria-label="Chiqish"
                className="signin-trigger logout-trigger"
                onClick={onLogout}
                title="Hisobdan chiqish"
                type="button"
              >
                <LogOut aria-hidden="true" size={14} />
                <span>Chiqish</span>
              </button>
            </>
          ) : (
            <div className="guest-auth-group">
              <button aria-label={text.signIn} className="signin-trigger" onClick={onSignIn} type="button">
                <LogIn aria-hidden="true" size={14} />
                <span>{text.signIn}</span>
              </button>
              <button
                aria-label="Ro‘yxatdan o‘tish"
                className="signup-button-subtle"
                onClick={onRegister}
                type="button"
              >
                <UserPlus aria-hidden="true" size={13} />
                <span>Ro‘yxatdan o‘tish</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
