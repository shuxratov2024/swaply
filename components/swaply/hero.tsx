'use client'

import { ArrowDown, ArrowLeftRight, ArrowUpRight, Check, Search, Sparkles, UsersRound, Zap } from 'lucide-react'
import type { Locale } from './types'
import { copy } from './translations'

export function Hero({
  locale,
  activeCategory,
  search,
  coinsClaimed,
  onCategoryChange,
  onSearchChange,
  onClaim,
  onAdd,
}: {
  locale: Locale
  activeCategory: string
  search: string
  coinsClaimed: boolean
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onClaim: () => void
  onAdd: () => void
}) {
  const text = copy[locale]
  const categories = [text.all, ...text.categories]

  return (
    <section aria-labelledby="hero-title" className="hero-grid" id="top">
      <div className="hero-main-card surface-card">
        <div className="hero-main-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> {text.heroEyebrow}</div>
          <h1 id="hero-title">{text.heroTitle}<span className="title-period">.</span></h1>
          <p className="hero-description">{text.heroBody}</p>

          <label className="search-field">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">{text.search}</span>
            <input onChange={(event) => onSearchChange(event.target.value)} placeholder={text.search} type="search" value={search} />
            <span className="search-shortcut">⌘ K</span>
          </label>

          <div aria-label="Skill kategoriyasi" className="category-row" role="group">
            {categories.map((category, index) => (
              <button
                aria-pressed={activeCategory === category}
                className={`category-pill ${activeCategory === category ? 'category-pill-active' : ''}`}
                key={category}
                onClick={() => onCategoryChange(category)}
                type="button"
              >
                {index === 0 && <Sparkles aria-hidden="true" size={13} />}
                {category}
              </button>
            ))}
          </div>

          <div className="hero-ctas">
            <button className="button button-cream hero-bonus" disabled={coinsClaimed} onClick={onClaim} type="button">
              {coinsClaimed ? <Check aria-hidden="true" size={16} /> : <Zap aria-hidden="true" size={16} />}
              {coinsClaimed ? text.claimed : `${text.dailyCta} +1`}
              <span className="coin-mini">◈</span>
            </button>
            <button className="button button-primary hero-add-button" onClick={onAdd} type="button">
              <span className="button-plus">+</span> {text.addCta} <ArrowUpRight aria-hidden="true" size={15} />
            </button>
          </div>
        </div>

        <div aria-label="Bir-birini to‘ldiradigan ko‘nikmalar" className="hero-art" id="how-it-works" role="img">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-center-mark"><ArrowLeftRight aria-hidden="true" size={25} /></div>
          <div className="skill-orbit-card orbit-card-top">
            <span className="orbit-card-icon forest-icon"><Zap aria-hidden="true" size={14} /></span>
            <span><strong>Figma</strong><small>UI/UX dizayn</small></span>
          </div>
          <div className="skill-orbit-card orbit-card-bottom">
            <span className="orbit-card-icon cream-icon"><Sparkles aria-hidden="true" size={14} /></span>
            <span><strong>Ingliz tili</strong><small>IELTS 8.0</small></span>
          </div>
          <div className="art-caption"><UsersRound aria-hidden="true" size={14} /> 1 soat ↔ 1 soat</div>
          <div className="art-floating-arrow"><ArrowDown aria-hidden="true" size={14} /></div>
        </div>
      </div>

      <aside aria-label="Swaply hamjamiyati" className="hero-side-column">
        <div className="community-card surface-card">
          <div className="community-card-top"><span className="live-dot" /> {text.availableNow}</div>
          <p className="community-number">2.4<span>k</span></p>
          <p className="community-label">{text.members}</p>
          <div className="avatar-stack" aria-label="Swaply a’zolari">
            {[
              'photo-1534528741775-53994a69daeb',
              'photo-1500648767791-00dcc994a43e',
              'photo-1531123897727-8f129e1688ce',
              'photo-1506794778202-cad84cf45f1d',
            ].map((photo, index) => (
              <img alt="" className="stacked-avatar" key={photo} src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=96&q=80`} style={{ zIndex: 4 - index }} />
            ))}
            <span className="avatar-more">+2k</span>
          </div>
          <div className="community-footer"><span>Har kuni yangi imkoniyatlar</span><ArrowUpRight aria-hidden="true" size={14} /></div>
        </div>

        <div className="impact-card surface-card">
          <div className="impact-icon"><ArrowLeftRight aria-hidden="true" size={16} /></div>
          <div className="impact-content">
            <p className="impact-stat">840+</p>
            <p className="impact-label">{text.exchanges}</p>
          </div>
          <div aria-hidden="true" className="impact-sparkline"><span /><span /><span /><span /><span /><span /><span /></div>
        </div>
      </aside>
    </section>
  )
}
