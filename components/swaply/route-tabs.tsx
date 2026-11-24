'use client'

import Link from 'next/link'
import { Heart, Tag, Users } from 'lucide-react'

type SwaplyRouteTabsProps = {
  active: 'offers' | 'members' | 'favorites'
  offersCount: number
  membersCount: number
  favoritesCount: number
  onOffersNavigate: () => void
}

export function SwaplyRouteTabs({
  active,
  offersCount,
  membersCount,
  favoritesCount,
  onOffersNavigate,
}: SwaplyRouteTabsProps) {
  return (
    <nav aria-label="Asosiy bo‘limlar" className="platform-nav-tabs">
      <Link
        aria-current={active === 'offers' ? 'page' : undefined}
        className={`platform-tab-btn ${active === 'offers' ? 'tab-btn-active' : ''}`}
        href="/offers"
        onClick={onOffersNavigate}
      >
        <Tag aria-hidden="true" size={14} />
        Takliflar
        <span className="tab-count">{offersCount}</span>
      </Link>
      <Link
        aria-current={active === 'members' ? 'page' : undefined}
        className={`platform-tab-btn ${active === 'members' ? 'tab-btn-active' : ''}`}
        href="/members"
      >
        <Users aria-hidden="true" size={14} />
        A&apos;zolar
        <span className="tab-count">{membersCount}</span>
      </Link>
      <Link
        aria-current={active === 'favorites' ? 'page' : undefined}
        className={`platform-tab-btn ${active === 'favorites' ? 'tab-btn-active' : ''}`}
        href="/favorites"
      >
        <Heart aria-hidden="true" size={14} />
        Sevimlilar
        <span className="tab-count">{favoritesCount}</span>
      </Link>
    </nav>
  )
}
