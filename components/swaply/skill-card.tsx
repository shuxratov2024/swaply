'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Copy,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star,
  Trash2,
  UnlockKeyhole,
} from 'lucide-react'
import type { Locale, Offer } from './types'
import { copy } from './translations'

export function SkillCard({
  offer,
  locale,
  revealed,
  isOwner,
  isBookmarked,
  onUnlock,
  onDelete,
  onToggleBookmark,
  onViewAuthorProfile,
  onReport,
  showDetailLink = true,
}: {
  offer: Offer
  locale: Locale
  revealed: boolean
  isOwner?: boolean
  isBookmarked?: boolean
  onUnlock: (offer: Offer) => void
  onDelete?: (offerId: string) => void
  onToggleBookmark?: (offerId: string) => void
  onViewAuthorProfile?: (offer: Offer) => void
  onReport?: (offer: Offer) => void
  showDetailLink?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const text = copy[locale]

  const isUnlocked = revealed || isOwner

  function handleCopyContact() {
    const contacts: string[] = []
    if (offer.phone) contacts.push(`Tel: ${offer.phone}`)
    if (offer.telegram) contacts.push(`Telegram: ${offer.telegram}`)
    if (offer.whatsapp) contacts.push(`WhatsApp: ${offer.whatsapp}`)
    if (contacts.length === 0 && offer.contact) contacts.push(offer.contact)

    navigator.clipboard.writeText(contacts.join(' | '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Telegram link generator
  const telegramHref = offer.telegram
    ? offer.telegram.startsWith('http')
      ? offer.telegram
      : `https://t.me/${offer.telegram.replace('@', '').trim()}`
    : offer.contact?.startsWith('@')
      ? `https://t.me/${offer.contact.replace('@', '').trim()}`
      : null

  // WhatsApp link generator
  const whatsappHref = offer.whatsapp
    ? offer.whatsapp.startsWith('http')
      ? offer.whatsapp
      : `https://wa.me/${offer.whatsapp.replace(/[^0-9]/g, '')}`
    : null

  // Phone link generator
  const phoneHref = offer.phone ? `tel:${offer.phone.replace(/[^0-9+]/g, '')}` : null

  const displayUsername = offer.username || offer.name.toLowerCase().replace(/\s+/g, '_')

  return (
    <article className={`offer-card surface-card ${isOwner ? 'offer-card-owner' : ''}`}>
      <div className="offer-card-header">
        <div
          className="offer-user cursor-pointer"
          onClick={() => onViewAuthorProfile?.(offer)}
          role="button"
          tabIndex={0}
          title={`${offer.name} profilini ko‘rish`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onViewAuthorProfile?.(offer)
          }}
        >
          <div className="card-avatar-wrap">
            <img
              alt={`${offer.name} profili`}
              className="card-avatar"
              onError={(event) => {
                event.currentTarget.src = '/placeholder-user.jpg'
              }}
              src={offer.avatar}
            />
            {offer.verified && (
              <span aria-label={text.verified} className="verified-dot">
                <BadgeCheck aria-hidden="true" size={12} />
              </span>
            )}
          </div>
          <div className="user-meta">
            <div className="user-name-line">
              <h3>{offer.name}</h3>
              {offer.verified && <BadgeCheck aria-label={text.verified} className="verified-icon" size={14} />}
            </div>
            <div className="user-subline">
              <span className="card-username-badge">@{displayUsername}</span>
              {offer.gender === 'male' && <span className="gender-tag male" title="Erkak">👨 Erkak</span>}
              {offer.gender === 'female' && <span className="gender-tag female" title="Ayol">👩 Ayol</span>}
              <i />
              <span>
                <MapPin aria-hidden="true" size={11} /> {offer.location || 'Toshkent'}
              </span>
              {isOwner && <span className="owner-badge">Sizning e‘loningiz</span>}
            </div>
          </div>
        </div>

        <div className="card-header-actions">
          {onReport && !isOwner && (
            <button
              aria-label="Shikoyat qilish"
              className="card-report-btn"
              onClick={(e) => {
                e.stopPropagation()
                onReport(offer)
              }}
              title="Shikoyat qilish"
              type="button"
            >
              <Flag size={13} />
            </button>
          )}

          {onToggleBookmark && (
            <button
              aria-label={isBookmarked ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga saqlash'}
              className={`card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(offer.id)
              }}
              title={isBookmarked ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga saqlash'}
              type="button"
            >
              <Heart fill={isBookmarked ? '#ef4444' : 'none'} size={14} />
            </button>
          )}

          <span className="rating">
            <Star aria-hidden="true" fill="currentColor" size={12} /> {offer.rating}
          </span>

          {isOwner && onDelete && (
            <button
              aria-label="Taklifni o‘chirish"
              className="card-delete-button"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Haqiqatan ham bu e‘loningizni o‘chirmoqchimisiz?')) {
                  onDelete(offer.id)
                }
              }}
              title="E‘lonni o‘chirish"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="offer-skills">
        <div className="skill-block">
          <div className="skill-label">
            <span className="skill-label-mark teach-mark">↗</span>
            {text.teach}
          </div>
          <div className="skill-value skill-value-teach">{offer.canTeach}</div>
        </div>
        <div className="skill-divider">
          <span />
        </div>
        <div className="skill-block">
          <div className="skill-label">
            <span className="skill-label-mark learn-mark">↘</span>
            {text.learn}
          </div>
          <div className="skill-value skill-value-learn">{offer.wantsToLearn}</div>
        </div>
      </div>

      <p className="offer-description">{offer.description}</p>

      <div className="offer-card-footer">
        <span className="offer-category">{offer.category}</span>
        {showDetailLink && (
          <Link className="offer-detail-link" href={`/offers/${encodeURIComponent(String(offer.id))}`}>
            Tafsilotlar <ArrowUpRight aria-hidden="true" size={12} />
          </Link>
        )}

        {isUnlocked ? (
          <div className="revealed-contacts-wrapper">
            <div className="revealed-contact-links">
              {telegramHref && (
                <a
                  className="contact-chip chip-tg"
                  href={telegramHref}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Telegram orqali bog‘lanish"
                >
                  <Send size={11} />
                  <span>{offer.telegram ? (offer.telegram.startsWith('@') ? offer.telegram : `@${offer.telegram}`) : 'Telegram'}</span>
                </a>
              )}
              {whatsappHref && (
                <a
                  className="contact-chip chip-wa"
                  href={whatsappHref}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="WhatsApp orqali bog‘lanish"
                >
                  <MessageCircle size={11} />
                  <span>WhatsApp</span>
                </a>
              )}
              {phoneHref && (
                <a className="contact-chip chip-phone" href={phoneHref} title="Qo‘ng‘iroq qilish">
                  <Phone size={11} />
                  <span>{offer.phone}</span>
                </a>
              )}
              {!telegramHref && !whatsappHref && !phoneHref && (
                <span className="contact-chip chip-default">
                  <span>{offer.contact}</span>
                </span>
              )}
            </div>

            <button
              aria-label="Kontaktni nusxalash"
              className="copy-contact-button"
              onClick={handleCopyContact}
              title="Kontaktni nusxalash"
              type="button"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        ) : (
          <button
            aria-label={`${offer.name} ${text.contact} (1 coin)`}
            className="button button-contact"
            onClick={() => onUnlock(offer)}
            type="button"
          >
            <UnlockKeyhole aria-hidden="true" size={13} /> {text.contact} <span className="contact-price">1 ◈</span>
          </button>
        )}
      </div>
    </article>
  )
}
