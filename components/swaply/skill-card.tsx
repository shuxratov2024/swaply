'use client'

import { ArrowUpRight, BadgeCheck, MapPin, Star, UnlockKeyhole } from 'lucide-react'
import type { Locale, Offer } from './types'
import { copy } from './translations'

export function SkillCard({
  offer,
  locale,
  revealed,
  onUnlock,
}: {
  offer: Offer
  locale: Locale
  revealed: boolean
  onUnlock: (offer: Offer) => void
}) {
  const text = copy[locale]

  return (
    <article className="offer-card surface-card">
      <div className="offer-card-header">
        <div className="offer-user">
          <div className="card-avatar-wrap">
            <img alt={`${offer.name} profili`} className="card-avatar" onError={(event) => { event.currentTarget.src = '/placeholder-user.jpg' }} src={offer.avatar} />
            {offer.verified && <span aria-label={text.verified} className="verified-dot"><BadgeCheck aria-hidden="true" size={12} /></span>}
          </div>
          <div className="user-meta">
            <div className="user-name-line"><h3>{offer.name}</h3>{offer.verified && <BadgeCheck aria-label={text.verified} className="verified-icon" size={14} />}</div>
            <div className="user-subline"><span>{offer.language}</span><i /> <span><MapPin aria-hidden="true" size={11} /> Toshkent</span></div>
          </div>
        </div>
        <span className="rating"><Star aria-hidden="true" size={12} fill="currentColor" /> {offer.rating}</span>
      </div>

      <div className="offer-skills">
        <div className="skill-block">
          <div className="skill-label"><span className="skill-label-mark teach-mark">↗</span>{text.teach}</div>
          <div className="skill-value skill-value-teach">{offer.canTeach}</div>
        </div>
        <div className="skill-divider"><span /></div>
        <div className="skill-block">
          <div className="skill-label"><span className="skill-label-mark learn-mark">↘</span>{text.learn}</div>
          <div className="skill-value skill-value-learn">{offer.wantsToLearn}</div>
        </div>
      </div>

      <p className="offer-description">{offer.description}</p>
      <div className="offer-card-footer">
        <span className="offer-category">{offer.category}</span>
        {revealed ? (
          <div className="revealed-contact">
            <span>{offer.contact}</span>
            <ArrowUpRight aria-hidden="true" size={13} />
          </div>
        ) : (
          <button aria-label={`${offer.name} ${text.contact} (1 coin)`} className="button button-contact" onClick={() => onUnlock(offer)} type="button">
            <UnlockKeyhole aria-hidden="true" size={13} /> {text.contact} <span className="contact-price">1 ◈</span>
          </button>
        )}
      </div>
    </article>
  )
}
