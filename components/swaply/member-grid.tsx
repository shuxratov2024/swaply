'use client'

import { ArrowUpRight, BadgeCheck, Flag, MapPin, Star, Tag } from 'lucide-react'
import type { MemberUser } from './types'

type MemberGridProps = {
  members: MemberUser[]
  onOpenProfile: (member: MemberUser) => void
  onReport: (member: MemberUser) => void
}

export function MemberGrid({ members, onOpenProfile, onReport }: MemberGridProps) {
  return (
    <div className="members-grid">
      {members.map((member) => (
        <article className="member-card surface-card" key={member.id || member.username}>
          <div className="member-card-header">
            <img
              alt={`${member.name} rasmi`}
              className="member-card-avatar"
              onError={(event) => {
                event.currentTarget.src = '/placeholder-user.jpg'
              }}
              src={member.avatar || '/placeholder-user.jpg'}
            />
            <div className="member-card-meta">
              <div className="member-name-row">
                <h4>{member.name}</h4>
                {member.verified && <BadgeCheck aria-label="Tasdiqlangan" className="verified-icon" size={14} />}
                {member.gender && (
                  <span className="mini-gender-icon" title={member.gender === 'male' ? 'Erkak' : 'Ayol'}>
                    {member.gender === 'male' ? '👨' : '👩'}
                  </span>
                )}
              </div>
              <div className="member-username-row">@{member.username}</div>
              <div className="member-loc-row">
                <MapPin aria-hidden="true" size={11} /> {member.location || 'Toshkent'}
              </div>
            </div>
            <div className="member-card-actions-top">
              <button
                aria-label={`${member.name} haqida shikoyat qilish`}
                className="member-report-btn"
                onClick={() => onReport(member)}
                title="Foydalanuvchi ustidan shikoyat qilish"
                type="button"
              >
                <Flag aria-hidden="true" size={12} />
              </button>
              <span aria-label={`Reyting: ${member.rating || '5.0'}`} className="rating">
                <Star aria-hidden="true" fill="currentColor" size={11} /> {member.rating || '5.0'}
              </span>
            </div>
          </div>

          <p className="member-card-bio">
            {member.bio || 'Hozircha foydalanuvchi o‘zi haqida izoh qoldirmagan.'}
          </p>

          <div className="member-skills-section">
            {member.skillsTeach && member.skillsTeach.length > 0 && (
              <div className="member-skill-row">
                <span className="member-skill-label teach">↗ O‘rgatadi:</span>
                <span className="member-skill-text">{member.skillsTeach[0]}</span>
              </div>
            )}
            {member.skillsLearn && member.skillsLearn.length > 0 && (
              <div className="member-skill-row">
                <span className="member-skill-label learn">↘ O‘rganadi:</span>
                <span className="member-skill-text">{member.skillsLearn[0]}</span>
              </div>
            )}
          </div>

          <div className="member-card-footer">
            <span className="member-offers-count">
              <Tag aria-hidden="true" size={11} /> {member.offersCount || 0} ta taklif
            </span>
            <button
              className="button button-contact"
              onClick={() => onOpenProfile(member)}
              type="button"
            >
              Profilni ko‘rish <ArrowUpRight aria-hidden="true" size={12} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
