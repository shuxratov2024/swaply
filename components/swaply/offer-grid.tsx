'use client'

import { SkillCard } from './skill-card'
import type { Locale, MemberUser, Offer } from './types'

type OfferGridProps = {
  offers: Offer[]
  favorites: string[]
  authUserId?: string | number
  locale: Locale
  onDelete: (offerId: string) => void
  onReport: (offer: Offer) => void
  onToggleBookmark: (offerId: string) => void
  onUnlock: (offer: Offer) => void
  onViewAuthorProfile: (memberOrOffer: MemberUser | Offer) => void
  revealedContacts: string[]
  showDetailLink?: boolean
}

export function OfferGrid({
  offers,
  favorites,
  authUserId,
  locale,
  onDelete,
  onReport,
  onToggleBookmark,
  onUnlock,
  onViewAuthorProfile,
  revealedContacts,
  showDetailLink = true,
}: OfferGridProps) {
  return (
    <div className="offers-grid">
      {offers.map((offer) => (
        <SkillCard
          isBookmarked={favorites.includes(offer.id)}
          isOwner={Boolean(authUserId && offer.userId === authUserId)}
          key={offer.id}
          locale={locale}
          offer={offer}
          onDelete={onDelete}
          onReport={onReport}
          onToggleBookmark={onToggleBookmark}
          onUnlock={onUnlock}
          onViewAuthorProfile={onViewAuthorProfile}
          revealed={revealedContacts.includes(offer.id)}
          showDetailLink={showDetailLink}
        />
      ))}
    </div>
  )
}
