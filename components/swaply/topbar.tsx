'use client'

import { ArrowUpRight, Check, ChevronDown, Coins, Globe2, LogIn, LogOut, Plus } from 'lucide-react'
import type { Locale } from './types'
import { copy } from './translations'

export function Topbar({
  coins,
  claimed,
  name,
  avatar,
  locale,
  isLoggedIn,
  onLocaleChange,
  onClaim,
  onAdd,
  onEditProfile,
  onSignIn,
  onLogout,
}: {
  coins: number
  claimed: boolean
  name: string
  avatar: string
  locale: Locale
  isLoggedIn: boolean
  onLocaleChange: (locale: Locale) => void
  onClaim: () => void
  onAdd: () => void
  onEditProfile: () => void
  onSignIn: () => void
  onLogout: () => void
}) {
  const text = copy[locale]

  return (
    <header className="topbar-wrap">
      <nav aria-label="Asosiy navigatsiya" className="topbar">
        <a aria-label="Swaply bosh sahifa" className="brand" href="#top">
          <span className="brand-icon"><ArrowUpRight aria-hidden="true" size={18} strokeWidth={2.5} /></span>
          <span className="brand-name">swaply<span className="brand-dot">.</span></span>
          <span className="brand-tag">{text.skillBarter}</span>
        </a>

        <div className="nav-links">
          <a href="#offers">{text.offers}</a>
          <a href="#how-it-works">{text.howItWorks}</a>
        </div>

        <div className="topbar-actions">
          <div className="wallet-pill" aria-label={`${text.wallet}: ${coins} ${text.coinLabel}`} role="group">
            <span className="coin-icon"><Coins aria-hidden="true" size={16} /></span>
            <span className="coin-count">{coins}</span>
            <span className="coin-label">{text.coinLabel}</span>
            <span className="wallet-divider" />
            <button aria-label={claimed ? text.claimed : text.dailyBonus} className="wallet-bonus" disabled={claimed} onClick={onClaim} type="button">
              {claimed ? <Check aria-hidden="true" size={14} /> : <Plus aria-hidden="true" size={14} />}
              <span>{claimed ? text.claimed : text.dailyBonus}</span>
            </button>
          </div>
          <button className="button button-primary nav-add" onClick={onAdd} type="button">
            <Plus aria-hidden="true" size={16} /> {text.addOffer}
          </button>

          {isLoggedIn ? (
            <button aria-label="Chiqish" className="signin-trigger" onClick={onLogout} type="button">
              <LogOut aria-hidden="true" size={14} /><span>Chiqish</span>
            </button>
          ) : (
            <button aria-label={text.signIn} className="signin-trigger" onClick={onSignIn} type="button">
              <LogIn aria-hidden="true" size={14} /><span>{text.signIn}</span>
            </button>
          )}

          <div aria-label={text.language} className="language-switcher" role="group">
            <Globe2 aria-hidden="true" size={14} />
            {(['UZ', 'RU', 'EN'] as Locale[]).map((option) => (
              <button aria-pressed={locale === option} className={locale === option ? 'language-active' : ''} key={option} onClick={() => onLocaleChange(option)} type="button">
                {option}
              </button>
            ))}
          </div>
          <button aria-label={`Profilni tahrirlash, ${name}`} className="profile-trigger" onClick={onEditProfile} type="button">
            <img alt={`${name} profili`} className="topbar-avatar" onError={(event) => { event.currentTarget.src = '/placeholder-user.jpg' }} src={avatar} />
            <span className="profile-name">{name}</span>
            <ChevronDown aria-hidden="true" className="profile-chevron" size={14} />
          </button>
        </div>
      </nav>
    </header>
  )
}
