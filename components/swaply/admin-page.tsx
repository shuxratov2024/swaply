'use client'

import { useState, useEffect } from 'react'
import {
  Building,
  Users,
  Flag,
  Check,
  Trash2,
  Loader2,
  LogOut,
  Shield,
  Search,
} from 'lucide-react'
import { ModalFrame } from './modal-frame'
import { type Offer, type MemberUser, type ReportItem, avatarOptions, type Gender } from './types'

export type AuthUser = {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  gender?: Gender
  role?: 'admin' | 'user'
  coins?: number
  phone?: string
  telegram?: string
  whatsapp?: string
  lastClaimDate?: string
  createdAt?: string
}

// Hardcoded admin credentials for demo
const ADMIN_CREDENTIALS = {
  username: 'amir',
  password: 'amir12345678',
}

export function AdminPage({
  onClose,
}: {
  onClose: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview')
  const [searchUser, setSearchUser] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<{
    stats: any
    users: any[]
    reports: ReportItem[]
  } | null>(null)
  const [selectedInspectUser, setSelectedInspectUser] = useState<any | null>(null)
  const [actionMsg, setActionMsg] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [coins, setCoins] = useState(0)

  // Check if user is logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('swaply_user')
    const savedToken = localStorage.getItem('swaply_token')
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as AuthUser
        setIsLoggedIn(true)
        setCoins(user.coins ?? 0)
      } catch {
        handleLogoutCleanup()
      }
    }
  }, [])

  async function login() {
    setAuthError('')
    if (adminUsername === ADMIN_CREDENTIALS.username && adminPassword === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true)
      localStorage.setItem('swaply_token', 'admin-token-' + Date.now())
      localStorage.setItem('swaply_user', JSON.stringify({
        id: 1,
        name: 'Amir Shukhratov',
        username: 'amir',
        email: 'amir@swaply.dev',
        avatar: '/placeholder-user.jpg',
        role: 'admin',
        coins: 50,
      }))
      showToast('Admin panelga muvaffaqiyatli kirildi!')
    } else {
      setAuthError("Foydalanuvchi nomi yoki parol noto'g'ri")
    }
  }

  function handleLogoutCleanup() {
    localStorage.removeItem('swaply_token')
    localStorage.removeItem('swaply_user')
    setIsLoggedIn(false)
    setCoins(0)
    setAdminUsername('')
    setAdminPassword('')
    setAuthError('')
  }

  function showToast(message: string) {
    console.log('Toast:', message)
  }

  async function loadAdminData(query = '') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('swaply_token') : null
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setAdminData(data)
      if (query && data.users?.length > 0) {
        setSelectedInspectUser(data.users[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData(searchUser)
  }, [searchUser, isAuthenticated])

  async function handleDeleteOffer(offerId: string) {
    if (!window.confirm("Haqiqatan ham bu taklifni o'chirmoqchimisiz?")) return
    const token = localStorage.getItem('swaply_token')
    if (!token) return

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'deleteOffer', offerId }),
      })
      if (res.ok) {
        setActionMsg("Taklif muvaffaqiyatli o'chirildi!")
        loadAdminData(searchUser)
      }
    } catch {}
  }

  async function handleResolveReport(reportId: string) {
    const token = localStorage.getItem('swaply_token')
    if (!token) return
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'updateReport', reportId, status: 'resolved' }),
      })
      if (res.ok) {
        setActionMsg("Shikoyat ko'rib chiqildi!")
        loadAdminData(searchUser)
      }
    } catch {}
  }

  // Render auth form
  function renderAuth() {
    return (
      <div className="admin-auth-card surface-card">
        <div className="admin-auth-header">
          <h2>Admin Panelga Kirish</h2>
          <p>Swaply boshqaruvi paneliga kirish uchun tizimga kiring</p>
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        <form className="admin-auth-form" onSubmit={(e: any) => {
          e.preventDefault()
          login()
        }}>
          <div className="form-group-modern">
            <label className="form-label" htmlFor="admin-username">
              Foydalanuvchi nomi
            </label>
            <input
              className="form-control"
              id="admin-username"
              placeholder="amir"
              required
              value={adminUsername}
              onChange={(e: any) => setAdminUsername(e.target.value)}
              type="text"
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label" htmlFor="admin-password">
              Parol
            </label>
            <input
              className="form-control"
              id="admin-password"
              type="password"
              placeholder="amir12345678"
              required
              value={adminPassword}
              onChange={(e: any) => setAdminPassword(e.target.value)}
            />
          </div>

          <div className="form-options">
            <div className="form-check">
              <input
                type="checkbox"
                id="remember-me"
              />
              <label htmlFor="remember-me">Meni ozgartir</label>
            </div>
          </div>

          <button className="button button-primary admin-submit-btn" type="submit">
            Kirish
          </button>

          <div className="auth-divider">
            <span>|</span>
          </div>

          <p className="auth-footer">
            <a href="/">Hisob yo'qmisiz? Ro'yxatdan o'ting</a>
          </p>
        </form>
      </div>
    )
  }

  // Render admin content
  function renderContent() {
    return (
      <div className="admin-page-content">
        <div className="admin-tabs-row">
          <button
            className={`admin-tab-btn ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
            type="button"
          >
            <Building size={14} /> Umumiy Statistika
          </button>
          <button
            className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
            type="button"
          >
            <Users size={14} /> Foydalanuvchilarni Kuzatish
          </button>
          <button
            className={`admin-tab-btn ${tab === 'reports' ? 'active' : ''}`}
            onClick={() => setTab('reports')}
            type="button"
          >
            <Flag size={14} /> Shikoyatlar
          </button>
        </div>

        {actionMsg && <div className="admin-action-banner">✓ {actionMsg}</div>}

        <div className="admin-tab-content">
          {tab === 'overview' && adminData && (
            <div className="admin-overview-grid">
              <div className="stat-card surface-card">
                <span className="stat-card-title">Jami Foydalanuvchilar</span>
                <strong className="stat-card-num">{adminData?.stats?.totalUsers}</strong>
                <span className="stat-card-sub">
                  👨 Erkak: {adminData?.stats?.genderStats?.male} | 👩 Ayol: {adminData?.stats?.genderStats?.female}
                </span>
              </div>

              <div className="stat-card surface-card">
                <span className="stat-card-title">Jami Faol Takliflar</span>
                <strong className="stat-card-num">{adminData?.stats?.totalOffers}</strong>
                <span className="stat-card-sub">Hamjamiyatdagi ko'nikmalar</span>
              </div>

              <div className="stat-card surface-card">
                <span className="stat-card-title">Kelib tushgan shikoyatlar</span>
                <strong className="stat-card-num">{adminData?.stats?.totalReports}</strong>
                <span className="stat-card-sub">
                  Kutilmoqda: <strong>{adminData?.stats?.pendingReports}</strong> ta
                </span>
              </div>
            </div>
          )}

          {tab === 'users' && adminData && (
            <div className="admin-users-manager">
              <div className="admin-user-search-bar">
                <Search size={14} />
                <input
                  className="form-control"
                  onChange={(e: any) => setSearchUser(e.target.value)}
                  placeholder="Foydalanuvchi qidirish (@amir, ism, email)..."
                  value={searchUser}
                />
              </div>

              <div className="admin-users-split">
                <div className="admin-users-list">
                  {adminData.users.map((u: any) => (
                    <div
                      className={`admin-user-row ${selectedInspectUser?.id === u.id ? 'active' : ''}`}
                      key={u.id}
                      onClick={() => setSelectedInspectUser(u)}
                    >
                      <img
                        alt=""
                        className="admin-row-avatar"
                        onError={(e: any) => {
                          e.currentTarget.src = '/placeholder-user.jpg'
                        }}
                        src={u.avatar || '/placeholder-user.jpg'}
                      />
                      <div className="admin-row-info">
                        <strong>{u.name}</strong>
                        <span>@{u.username}</span>
                      </div>
                      <span className="admin-row-offers-count">{u.offersCount} e'lon</span>
                    </div>
                  ))}
                </div>

                <div className="admin-user-inspector">
                  {selectedInspectUser ? (
                    <div className="inspector-card">
                      <div className="inspector-header">
                        <img
                          alt=""
                          className="inspector-avatar"
                          onError={(e: any) => {
                            e.currentTarget.src = '/placeholder-user.jpg'
                          }}
                          src={selectedInspectUser.avatar || '/placeholder-user.jpg'}
                        />
                        <div>
                          <h3>{selectedInspectUser.name}</h3>
                          <div className="inspector-username">@{selectedInspectUser.username}</div>
                          <div className="inspector-badge-row">
                            <span className="inspector-gender">
                              {selectedInspectUser.gender === 'male' ? '👨 Erkak' : selectedInspectUser.gender === 'female' ? '👩 Ayol' : 'Boshqa'}
                            </span>
                            <span className="inspector-coins">{selectedInspectUser.coins} ◈</span>
                          </div>
                        </div>
                      </div>

                      <div className="inspector-contacts">
                        <div>Email: <strong>{selectedInspectUser.email}</strong></div>
                        {selectedInspectUser.phone && <div>Tel: <strong>{selectedInspectUser.phone}</strong></div>}
                        {selectedInspectUser.telegram && <div>Telegram: <strong>{selectedInspectUser.telegram}</strong></div>}
                      </div>

                      <div className="inspector-offers-section">
                        <h4>@{selectedInspectUser.username} joylagan takliflar ({selectedInspectUser.offers?.length || 0}):</h4>
                        {selectedInspectUser.offers?.length === 0 ? (
                          <div className="no-offers-msg">Ushbu foydalanuvchi hali taklif joylamagan.</div>
                        ) : (
                          <div className="inspector-offers-list">
                            {selectedInspectUser.offers.map((offer: any) => (
                              <div className="inspector-offer-item" key={offer.id}>
                                <div className="inspector-offer-meta">
                                  <strong>{offer.canTeach}</strong> <span>↔</span> <span>{offer.wantsToLearn}</span>
                                  <small className="offer-loc">📍 {offer.location || 'Toshkent'}</small>
                                </div>
                                <button
                                  className="admin-delete-offer-btn"
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  title="E'lonni o'chirish"
                                  type="button"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="select-user-prompt">
                      Chap tarafdagi ro'yxatdan kuzatmoqchi bo'lgan foydalanuvchini tanlang
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'reports' && adminData && (
            <div className="admin-reports-list">
              {adminData.reports.length === 0 ? (
                <div className="no-reports-box">🎉 Hozirda hech qanday shikoyatlar yo'q! Hammasi namanaviy.</div>
              ) : (
                adminData.reports.map((rep: any) => (
                  <div className={`report-admin-card status-${rep.status}`} key={rep.id}>
                    <div className="report-card-top">
                      <div>
                        <strong className="report-title">{rep.reasonTitle}</strong>
                        <span className="report-target">
                          Obyekt: {rep.targetName} {rep.targetUsername && `(@${rep.targetUsername})`}
                        </span>
                      </div>
                      <span className={`report-status-badge ${rep.status}`}>{rep.status}</span>
                    </div>

                    <p className="report-desc-text">"{rep.description}"</p>

                    <div className="report-card-footer">
                      <small>Yuboruvchi: {rep.reporterName} (@{rep.reporterUsername})</small>
                      {rep.status === 'pending' && (
                        <button
                          className="button button-cream resolve-btn"
                          onClick={() => handleResolveReport(rep.id)}
                          type="button"
                        >
                          <Check size={12} /> Ko'rib chiqildi deb belgilash
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="admin-logout">
          <button
            className="button button-cream logout-btn"
            onClick={() => {
              handleLogoutCleanup()
              showToast('Admin paneldan chiqildi')
            }}
            type="button"
          >
            <LogOut size={14} /> Chiqish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page-wrapper">
      <div className="admin-auth-container">
        {isLoggedIn ? renderContent() : renderAuth()}
      </div>
    </div>
  )
}