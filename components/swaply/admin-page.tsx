'use client'

import { useState, useEffect, useMemo, type FormEvent } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  Building,
  Check,
  Coins,
  CreditCard,
  Flag,
  History,
  Layers,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import type { Gender, UserRole } from './types'
import { ConfirmActionModal } from './swaply-modals'

export type AuthUser = {
  id: number
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  gender?: Gender
  role?: UserRole
  verified?: boolean
  banned?: boolean
  coins?: number
  phone?: string
  telegram?: string
  whatsapp?: string
  lastClaimDate?: string
  createdAt?: string
}

type AdminOffer = {
  id: string
  canTeach: string
  wantsToLearn: string
  category?: string
  location?: string
  userId?: number
  userName: string
  userUsername: string
}

export function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'payments' | 'offers' | 'reports'>('overview')
  const [searchUser, setSearchUser] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'staff' | 'reported' | 'banned'>('all')
  const [offerSearch, setOfferSearch] = useState('')
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all')
  const [loading, setLoading] = useState(false)
  const [adminData, setAdminData] = useState<{
    currentRole?: 'admin' | 'supporter'
    stats: {
      totalUsers: number
      totalOffers: number
      totalReports: number
      pendingReports: number
      pendingTopups?: number
      totalRevenueUzs?: number
      adminsCount?: number
      supportersCount?: number
      bannedCount?: number
      genderStats: { male: number; female: number; other: number }
    }
    users: any[]
    reports: any[]
    transactions?: any[]
    promoCodes?: any[]
    logs?: any[]
  } | null>(null)

  const [selectedInspectUserId, setSelectedInspectUserId] = useState<number | null>(null)
  const [pendingDeleteOfferId, setPendingDeleteOfferId] = useState<string | null>(null)
  const [customCoinDelta, setCustomCoinDelta] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AuthUser | null>(null)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Add user / staff form state
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('supporter')
  const [newGender, setNewGender] = useState<Gender>('male')
  const [newCoins, setNewCoins] = useState('5')

  // Create promo form state
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoBonusCoins, setPromoBonusCoins] = useState('3')
  const [promoBonusPercent, setPromoBonusPercent] = useState('0')
  const [promoMaxUses, setPromoMaxUses] = useState('100')
  const [promoDesc, setPromoDesc] = useState('')

  function showToast(message: string) {
    setToastMsg(message)
    window.setTimeout(() => setToastMsg(''), 3500)
  }

  function isStaffRole(user: AuthUser | null) {
    if (!user) return false
    return user.role === 'admin' || user.role === 'supporter' || user.username === 'amir'
  }

  const isMainAdmin = useMemo(() => {
    if (adminData?.currentRole) return adminData.currentRole === 'admin'
    return currentAdmin?.role === 'admin' || currentAdmin?.username === 'amir'
  }, [adminData?.currentRole, currentAdmin])

  useEffect(() => {
    const savedUser = localStorage.getItem('swaply_user')
    const savedToken = localStorage.getItem('swaply_token')
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as AuthUser
        if (isStaffRole(user)) {
          setIsLoggedIn(true)
          setCurrentAdmin(user)
        } else {
          setAuthError('Sizda admin yoki supporter huquqlari mavjud emas.')
        }
      } catch {
        handleLogoutCleanup()
      }
    }
  }, [])

  async function login() {
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminUsername.trim(), password: adminPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || "Foydalanuvchi nomi yoki parol noto'g'ri")
        return
      }

      const user = data.user as AuthUser
      if (!isStaffRole(user)) {
        setAuthError('Ushbu hisob admin yoki supporter huquqlariga ega emas')
        return
      }

      localStorage.setItem('swaply_token', data.token)
      localStorage.setItem('swaply_user', JSON.stringify(user))
      setCurrentAdmin(user)
      setIsLoggedIn(true)
      showToast('Admin dashboardga muvaffaqiyatli kirildi!')
    } catch {
      setAuthError('Server bilan bog‘lanishda xatolik yuz berdi')
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogoutCleanup() {
    localStorage.removeItem('swaply_token')
    localStorage.removeItem('swaply_user')
    setIsLoggedIn(false)
    setCurrentAdmin(null)
    setAdminData(null)
    setSelectedInspectUserId(null)
    setAdminUsername('')
    setAdminPassword('')
    setAuthError('')
  }

  async function loadAdminData(query = '') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('swaply_token') : null
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401 || res.status === 403) {
        handleLogoutCleanup()
        setAuthError('Sessiya muddati tugagan yoki ruxsat yo‘q. Qaytadan kiring.')
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setAdminData(data)
      if (data.users?.length > 0) {
        setSelectedInspectUserId((prev) =>
          prev && data.users.some((u: any) => u.id === prev) ? prev : data.users[0].id
        )
      } else {
        setSelectedInspectUserId(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData(searchUser)
    }
  }, [searchUser, isLoggedIn])

  async function postAdminAction(payload: Record<string, unknown>, successMessage: string) {
    const token = localStorage.getItem('swaply_token')
    if (!token) return false
    setActionBusy(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast(data.error || 'Amalni bajarishda xatolik')
        return false
      }
      showToast(successMessage)
      await loadAdminData(searchUser)
      return true
    } catch {
      showToast('Server bilan bog‘lanishda xatolik')
      return false
    } finally {
      setActionBusy(false)
    }
  }

  function handleDeleteOffer(offerId: string) {
    setPendingDeleteOfferId(offerId)
  }

  async function confirmDeleteOffer() {
    if (!pendingDeleteOfferId) return
    const ok = await postAdminAction(
      { action: 'deleteOffer', offerId: pendingDeleteOfferId },
      "Taklif muvaffaqiyatli o'chirildi!"
    )
    if (ok) setPendingDeleteOfferId(null)
  }

  async function handleAdjustCoins(userId: number, delta: number) {
    if (!Number.isInteger(delta) || delta === 0) return
    const ok = await postAdminAction(
      { action: 'adjustCoins', userId, delta },
      `Tanga balansi yangilandi (${delta > 0 ? `+${delta}` : delta} ◈)`
    )
    if (ok) setCustomCoinDelta('')
  }

  async function handleCreateUserSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await postAdminAction(
      {
        action: 'createUser',
        name: newName,
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
        gender: newGender,
        coins: parseInt(newCoins, 10) || 5,
      },
      `Yangi ${newRole} foydalanuvchi qo‘shildi!`
    )
    if (ok) {
      setShowCreateUser(false)
      setNewName('')
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setNewCoins('5')
    }
  }

  async function handleCreatePromoSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await postAdminAction(
      {
        action: 'createPromo',
        code: promoCodeInput,
        bonusCoins: parseInt(promoBonusCoins, 10) || 0,
        bonusPercent: parseInt(promoBonusPercent, 10) || 0,
        maxUses: parseInt(promoMaxUses, 10) || 100,
        description: promoDesc,
      },
      `Promo-kod ${promoCodeInput.toUpperCase()} yaratildi!`
    )
    if (ok) {
      setPromoCodeInput('')
      setPromoDesc('')
    }
  }

  const filteredUsers = useMemo(() => {
    const list = adminData?.users || []
    if (userFilter === 'reported') return list.filter((u: any) => (u.reportsCount || 0) > 0)
    if (userFilter === 'staff') {
      return list.filter((u: any) => u.role === 'admin' || u.role === 'supporter' || u.username === 'amir')
    }
    if (userFilter === 'banned') return list.filter((u: any) => Boolean(u.banned))
    return list
  }, [adminData, userFilter])

  const selectedInspectUser = useMemo(() => {
    if (!adminData?.users) return null
    return adminData.users.find((u: any) => u.id === selectedInspectUserId) || null
  }, [adminData, selectedInspectUserId])

  const allOffers = useMemo<AdminOffer[]>(() => {
    const users = adminData?.users || []
    const items: AdminOffer[] = []
    for (const u of users) {
      for (const o of u.offers || []) {
        items.push({
          ...o,
          userId: u.id,
          userName: u.name,
          userUsername: u.username,
        })
      }
    }
    const q = offerSearch.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (o) =>
        o.canTeach?.toLowerCase().includes(q) ||
        o.wantsToLearn?.toLowerCase().includes(q) ||
        o.category?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q) ||
        o.userName?.toLowerCase().includes(q) ||
        o.userUsername?.toLowerCase().includes(q)
    )
  }, [adminData, offerSearch])

  const filteredReports = useMemo(() => {
    const list = adminData?.reports || []
    if (reportFilter === 'all') return list
    return list.filter((r: any) => r.status === reportFilter)
  }, [adminData, reportFilter])

  const filteredTransactions = useMemo(() => {
    const list = (adminData?.transactions || []).filter((t: any) => t.type === 'topup')
    if (txFilter === 'all') return list
    return list.filter((t: any) => t.status === txFilter)
  }, [adminData, txFilter])

  const economyStats = useMemo(() => {
    const users = adminData?.users || []
    const totalCoins = users.reduce((sum: number, u: any) => sum + (Number(u.coins) || 0), 0)
    const avgCoins = users.length > 0 ? Math.round((totalCoins / users.length) * 10) / 10 : 0

    const categoryMap = new Map<string, number>()
    for (const u of users) {
      for (const o of u.offers || []) {
        const cat = o.category || 'Boshqa'
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      }
    }
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { totalCoins, avgCoins, topCategories }
  }, [adminData])

  function renderAuth() {
    return (
      <div className="admin-auth-screen">
        <div className="admin-auth-card surface-card">
          <div className="admin-auth-badge">
            <Shield size={16} /> Swaply Boshqaruv Markazi
          </div>
          <div className="admin-auth-header">
            <h1>Admin / Supporter Kirish</h1>
            <p>Platforma statistikasi, foydalanuvchilar, to‘lovlar va shikoyatlarni boshqarish uchun hisobingizga kiring</p>
          </div>

          {authError && <div className="admin-auth-error">{authError}</div>}

          <form
            className="admin-auth-form"
            onSubmit={(e) => {
              e.preventDefault()
              login()
            }}
          >
            <div className="admin-field">
              <label htmlFor="admin-username">Username yoki Email</label>
              <input
                className="form-control"
                id="admin-username"
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="username yoki email"
                required
                type="text"
                value={adminUsername}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Parol</label>
              <input
                className="form-control"
                id="admin-password"
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={adminPassword}
              />
            </div>

            <button className="button button-primary admin-submit-btn" disabled={authLoading} type="submit">
              {authLoading ? <Loader2 className="spin-icon" size={16} /> : 'Kirish'}
            </button>
          </form>

          <div className="admin-auth-back">
            <Link className="admin-back-link" href="/">
              <ArrowLeft size={14} /> Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function renderDashboard() {
    const totalUsers = adminData?.stats?.totalUsers || 0
    const male = adminData?.stats?.genderStats?.male || 0
    const female = adminData?.stats?.genderStats?.female || 0
    const other = adminData?.stats?.genderStats?.other || 0
    const malePct = totalUsers ? Math.round((male / totalUsers) * 100) : 0
    const femalePct = totalUsers ? Math.round((female / totalUsers) * 100) : 0
    const otherPct = totalUsers ? Math.max(0, 100 - malePct - femalePct) : 0

    return (
      <div className="admin-dashboard-shell">
        <header className="admin-topbar surface-card">
          <div className="admin-topbar-left">
            <Link className="admin-back-pill" href="/">
              <ArrowLeft size={15} />
              <span>Saytga qaytish</span>
            </Link>
            <div className="admin-brand-block">
              <div className="admin-brand-title">
                <Shield size={18} />
                <span>Swaply Admin Dashboard</span>
              </div>
              <p>Platforma monitoringi, to‘lovlar, xodimlar va kontent nazorati</p>
            </div>
          </div>

          <div className="admin-topbar-right">
            {currentAdmin && (
              <div className="admin-whoami">
                <span>
                  @{currentAdmin.username} • {isMainAdmin ? 'Bosh Admin' : 'Supporter'}
                </span>
              </div>
            )}
            <button
              className="admin-action-pill"
              disabled={loading}
              onClick={() => loadAdminData(searchUser)}
              type="button"
            >
              <RefreshCw className={loading ? 'spin-icon' : ''} size={14} />
              <span>Yangilash</span>
            </button>
            <button
              className="admin-action-pill danger"
              onClick={() => {
                handleLogoutCleanup()
                showToast('Admin paneldan chiqildi')
              }}
              type="button"
            >
              <LogOut size={14} />
              <span>Chiqish</span>
            </button>
          </div>
        </header>

        <nav className="admin-tabs-bar">
          <button
            className={`admin-tab-btn ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
            type="button"
          >
            <Building size={15} />
            <span>Statistika</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
            type="button"
          >
            <Users size={15} />
            <span>Foydalanuvchilar</span>
            <span className="admin-tab-count">{adminData?.stats?.totalUsers ?? 0}</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'payments' ? 'active' : ''}`}
            onClick={() => setTab('payments')}
            type="button"
          >
            <CreditCard size={15} />
            <span>To‘lovlar & Promo</span>
            {(adminData?.stats?.pendingTopups ?? 0) > 0 && (
              <span className="admin-tab-count alert">{adminData?.stats?.pendingTopups}</span>
            )}
          </button>
          <button
            className={`admin-tab-btn ${tab === 'offers' ? 'active' : ''}`}
            onClick={() => setTab('offers')}
            type="button"
          >
            <Layers size={15} />
            <span>Takliflar</span>
            <span className="admin-tab-count">{adminData?.stats?.totalOffers ?? 0}</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'reports' ? 'active' : ''}`}
            onClick={() => setTab('reports')}
            type="button"
          >
            <Flag size={15} />
            <span>Shikoyatlar</span>
            {(adminData?.stats?.pendingReports ?? 0) > 0 && (
              <span className="admin-tab-count alert">{adminData?.stats?.pendingReports}</span>
            )}
          </button>
        </nav>

        {loading && !adminData ? (
          <div className="admin-loading-box surface-card">
            <Loader2 className="spin-icon" size={26} />
            <span>Admin ma&apos;lumotlari yuklanmoqda...</span>
          </div>
        ) : (
          <main className="admin-main-content">
            {tab === 'overview' && adminData && (
              <div className="admin-overview-layout">
                <div className="admin-kpi-grid">
                  <div className="admin-kpi-card surface-card">
                    <div className="kpi-head">
                      <span>Jami Foydalanuvchilar</span>
                      <Users size={16} />
                    </div>
                    <strong className="kpi-value">{adminData.stats.totalUsers}</strong>
                    <span className="kpi-sub">
                      Admin: {adminData.stats.adminsCount ?? 1} • Supporter: {adminData.stats.supportersCount ?? 0} • Blok: {adminData.stats.bannedCount ?? 0}
                    </span>
                  </div>

                  <div className="admin-kpi-card surface-card">
                    <div className="kpi-head">
                      <span>Tasdiqlangan Daromad</span>
                      <CreditCard size={16} />
                    </div>
                    <strong className="kpi-value">
                      {(adminData.stats.totalRevenueUzs ?? 0).toLocaleString()} <small style={{ fontSize: 13 }}>UZS</small>
                    </strong>
                    <span className="kpi-sub">
                      Kutilayotgan to‘lovlar: <strong>{adminData.stats.pendingTopups ?? 0}</strong> ta
                    </span>
                  </div>

                  <div className="admin-kpi-card surface-card">
                    <div className="kpi-head">
                      <span>Tanga Iqtisodiyoti</span>
                      <Coins size={16} />
                    </div>
                    <strong className="kpi-value">{economyStats.totalCoins} ◈</strong>
                    <span className="kpi-sub">O&apos;rtacha balans: {economyStats.avgCoins} ◈ • 1 ◈ = 1,000 UZS</span>
                  </div>

                  <div className="admin-kpi-card surface-card">
                    <div className="kpi-head">
                      <span>Shikoyatlar & Takliflar</span>
                      <Flag size={16} />
                    </div>
                    <strong className="kpi-value">
                      {adminData.stats.pendingReports} / {adminData.stats.totalOffers}
                    </strong>
                    <span className="kpi-sub">
                      Kutilayotgan shikoyat / Jami faol takliflar
                    </span>
                  </div>
                </div>

                <div className="admin-analytics-grid">
                  <section className="admin-panel-card surface-card">
                    <div className="panel-card-header">
                      <h3>
                        <TrendingUp size={16} /> Yo&apos;nalishlar bo&apos;yicha takliflar
                      </h3>
                    </div>
                    {economyStats.topCategories.length === 0 ? (
                      <p className="panel-empty">Hali takliflar mavjud emas.</p>
                    ) : (
                      <div className="category-bars">
                        {economyStats.topCategories.map(([cat, count]) => {
                          const pct = adminData.stats.totalOffers
                            ? Math.round((count / adminData.stats.totalOffers) * 100)
                            : 0
                          return (
                            <div className="category-bar-row" key={cat}>
                              <div className="category-bar-label">
                                <span>{cat}</span>
                                <strong>
                                  {count} ta ({pct}%)
                                </strong>
                              </div>
                              <div className="category-bar-track">
                                <div className="category-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>

                  <section className="admin-panel-card surface-card">
                    <div className="panel-card-header">
                      <h3>
                        <Users size={16} /> Auditoriya va Tezkor amallar
                      </h3>
                    </div>
                    <div className="gender-breakdown">
                      <div className="gender-row">
                        <span>Erkaklar</span>
                        <div className="category-bar-track">
                          <div className="category-bar-fill male" style={{ width: `${malePct}%` }} />
                        </div>
                        <strong>{malePct}%</strong>
                      </div>
                      <div className="gender-row">
                        <span>Ayollar</span>
                        <div className="category-bar-track">
                          <div className="category-bar-fill female" style={{ width: `${femalePct}%` }} />
                        </div>
                        <strong>{femalePct}%</strong>
                      </div>
                      <div className="gender-row">
                        <span>Boshqa</span>
                        <div className="category-bar-track">
                          <div className="category-bar-fill other" style={{ width: `${otherPct}%` }} />
                        </div>
                        <strong>{otherPct}%</strong>
                      </div>
                    </div>

                    <div className="quick-actions-box">
                      <h4>Tezkor o&apos;tish</h4>
                      <div className="quick-actions-row">
                        <button
                          className="admin-quick-btn"
                          onClick={() => {
                            setTab('users')
                            setShowCreateUser(true)
                          }}
                          type="button"
                        >
                          + Xodim / Foydalanuvchi qo‘shish
                        </button>
                        <button className="admin-quick-btn" onClick={() => setTab('payments')} type="button">
                          To‘lovlar ({adminData.stats.pendingTopups ?? 0})
                        </button>
                        <button className="admin-quick-btn" onClick={() => setTab('reports')} type="button">
                          Shikoyatlar ({adminData.stats.pendingReports})
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="admin-panel-card surface-card" style={{ marginTop: 16 }}>
                  <div className="panel-card-header">
                    <h3>
                      <History size={16} /> So&apos;nggi Audit Log (Boshqaruv tarixi)
                    </h3>
                  </div>
                  {(adminData.logs || []).length === 0 ? (
                    <p className="panel-empty">Hali boshqaruv harakatlari qayd etilmagan.</p>
                  ) : (
                    <div className="admin-audit-list">
                      {(adminData.logs || []).slice(0, 10).map((log: any) => (
                        <div className="admin-audit-row" key={log.id}>
                          <div>
                            <strong>{log.action}</strong>
                            <span>
                              @{log.actorUsername} ({log.actorRole}) → {log.target}
                              {log.details ? ` • ${log.details}` : ''}
                            </span>
                          </div>
                          <small>{new Date(log.createdAt).toLocaleString('uz-UZ')}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === 'users' && adminData && (
              <div className="admin-users-manager">
                <div className="admin-users-toolbar">
                  <div className="admin-user-search-bar">
                    <Search size={15} />
                    <input
                      className="form-control"
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Foydalanuvchi qidirish (@username, ism, email)..."
                      value={searchUser}
                    />
                  </div>

                  <div className="admin-filter-pills">
                    {[
                      { id: 'all', label: 'Barchasi' },
                      { id: 'staff', label: 'Admin & Supporter' },
                      { id: 'reported', label: 'Shikoyatli' },
                      { id: 'banned', label: 'Bloklangan' },
                    ].map((f) => (
                      <button
                        className={`admin-filter-pill ${userFilter === f.id ? 'active' : ''}`}
                        key={f.id}
                        onClick={() => setUserFilter(f.id as any)}
                        type="button"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {isMainAdmin && (
                    <button
                      className="button button-primary"
                      onClick={() => setShowCreateUser((v) => !v)}
                      type="button"
                    >
                      {showCreateUser ? <X size={15} /> : <UserPlus size={15} />}
                      <span>{showCreateUser ? 'Yopish' : 'Foydalanuvchi / Xodim qo‘shish'}</span>
                    </button>
                  )}
                </div>

                {showCreateUser && isMainAdmin && (
                  <form className="admin-create-user-card surface-card" onSubmit={handleCreateUserSubmit}>
                    <div className="create-user-header">
                      <h3>
                        <UserPlus size={16} /> Yangi Foydalanuvchi, Supporter yoki Admin qo‘shish
                      </h3>
                    </div>
                    <div className="create-user-grid">
                      <div className="admin-field">
                        <label>To‘liq ism</label>
                        <input
                          className="form-control"
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Dilshod Karimov"
                          required
                          value={newName}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Username</label>
                        <input
                          className="form-control"
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="dilshod_supporter"
                          required
                          value={newUsername}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Email</label>
                        <input
                          className="form-control"
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="dilshod@swaply.uz"
                          required
                          type="email"
                          value={newEmail}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Parol (kamida 6 belgi)</label>
                        <input
                          className="form-control"
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          type="password"
                          value={newPassword}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Rol</label>
                        <select
                          className="form-control form-select"
                          onChange={(e) => setNewRole(e.target.value as UserRole)}
                          value={newRole}
                        >
                          <option value="supporter">Supporter (Moderator)</option>
                          <option value="admin">Admin (To‘liq huquq)</option>
                          <option value="user">Oddiy Foydalanuvchi</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Jins</label>
                        <select
                          className="form-control form-select"
                          onChange={(e) => setNewGender(e.target.value as Gender)}
                          value={newGender}
                        >
                          <option value="male">Erkak</option>
                          <option value="female">Ayol</option>
                          <option value="other">Boshqa</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Boshlang‘ich tanga</label>
                        <input
                          className="form-control"
                          onChange={(e) => setNewCoins(e.target.value)}
                          type="number"
                          value={newCoins}
                        />
                      </div>
                    </div>
                    <div className="create-user-actions">
                      <button className="button button-primary" disabled={actionBusy} type="submit">
                        {actionBusy ? <Loader2 className="spin-icon" size={14} /> : 'Saqlash va Qo‘shish'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-users-split">
                  <div className="admin-users-list surface-card">
                    {filteredUsers.length === 0 ? (
                      <div className="panel-empty">Foydalanuvchi topilmadi</div>
                    ) : (
                      filteredUsers.map((u: any) => (
                        <div
                          className={`admin-user-row ${selectedInspectUser?.id === u.id ? 'active' : ''}`}
                          key={u.id}
                          onClick={() => setSelectedInspectUserId(u.id)}
                        >
                          <img
                            alt=""
                            className="admin-row-avatar"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-user.jpg'
                            }}
                            src={u.avatar || '/placeholder-user.jpg'}
                          />
                          <div className="admin-row-info">
                            <strong>
                              {u.name} {u.banned && <span className="banned-tag">BLOK</span>}
                            </strong>
                            <span>
                              @{u.username} • {u.role || 'user'}
                            </span>
                          </div>
                          <div className="admin-row-badges">
                            {u.reportsCount > 0 && (
                              <span className="admin-row-warn" title="Shikoyatlar soni">
                                <AlertTriangle size={11} /> {u.reportsCount}
                              </span>
                            )}
                            <span className="admin-row-coins">{u.coins ?? 0} ◈</span>
                            <span className="admin-row-offers-count">{u.offersCount} e&apos;lon</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="admin-user-inspector surface-card">
                    {selectedInspectUser ? (
                      <div className="inspector-card">
                        <div className="inspector-header">
                          <img
                            alt=""
                            className="inspector-avatar"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-user.jpg'
                            }}
                            src={selectedInspectUser.avatar || '/placeholder-user.jpg'}
                          />
                          <div>
                            <h3>
                              {selectedInspectUser.name}{' '}
                              {selectedInspectUser.verified && (
                                <BadgeCheck className="inline-verified" size={16} />
                              )}
                            </h3>
                            <div className="inspector-username">@{selectedInspectUser.username}</div>
                            <div className="inspector-badge-row">
                              <span className="inspector-gender">
                                {selectedInspectUser.gender === 'male'
                                  ? 'Erkak'
                                  : selectedInspectUser.gender === 'female'
                                    ? 'Ayol'
                                    : 'Boshqa'}
                              </span>
                              <span className="inspector-coins">{selectedInspectUser.coins ?? 0} ◈</span>
                              <span className={`inspector-role-badge role-${selectedInspectUser.role || 'user'}`}>
                                {selectedInspectUser.role || 'user'}
                              </span>
                              {selectedInspectUser.banned && (
                                <span className="banned-tag">Bloklangan</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="inspector-contacts">
                          <div>
                            Email: <strong>{selectedInspectUser.email}</strong>
                          </div>
                          {selectedInspectUser.phone && (
                            <div>
                              Tel: <strong>{selectedInspectUser.phone}</strong>
                            </div>
                          )}
                          {selectedInspectUser.telegram && (
                            <div>
                              Telegram: <strong>{selectedInspectUser.telegram}</strong>
                            </div>
                          )}
                          {selectedInspectUser.whatsapp && (
                            <div>
                              WhatsApp: <strong>{selectedInspectUser.whatsapp}</strong>
                            </div>
                          )}
                        </div>

                        <div className="inspector-moderation-row">
                          <button
                            className="admin-action-pill"
                            disabled={actionBusy}
                            onClick={() =>
                              postAdminAction(
                                { action: 'toggleVerified', userId: selectedInspectUser.id },
                                selectedInspectUser.verified
                                  ? 'Tasdiqlash bekor qilindi'
                                  : 'Foydalanuvchi tasdiqlandi!'
                              )
                            }
                            type="button"
                          >
                            <BadgeCheck size={14} />
                            <span>{selectedInspectUser.verified ? 'Tasdiqni olish' : 'Tasdiqlash'}</span>
                          </button>

                          {isMainAdmin && (
                            <>
                              <select
                                className="form-control form-select inspector-role-select"
                                disabled={actionBusy}
                                onChange={(e) =>
                                  postAdminAction(
                                    {
                                      action: 'updateRole',
                                      userId: selectedInspectUser.id,
                                      role: e.target.value,
                                    },
                                    `Rol ${e.target.value} ga o‘zgartirildi`
                                  )
                                }
                                value={selectedInspectUser.role || 'user'}
                              >
                                <option value="user">Rol: User</option>
                                <option value="supporter">Rol: Supporter</option>
                                <option value="admin">Rol: Admin</option>
                              </select>

                              <button
                                className={`admin-action-pill ${selectedInspectUser.banned ? '' : 'danger'}`}
                                disabled={actionBusy}
                                onClick={() =>
                                  postAdminAction(
                                    { action: 'toggleBanned', userId: selectedInspectUser.id },
                                    selectedInspectUser.banned
                                      ? 'Foydalanuvchi blokdan chiqarildi'
                                      : 'Foydalanuvchi bloklandi'
                                  )
                                }
                                type="button"
                              >
                                <Ban size={14} />
                                <span>{selectedInspectUser.banned ? 'Blokdan chiqarish' : 'Bloklash'}</span>
                              </button>
                            </>
                          )}
                        </div>

                        {isMainAdmin && (
                          <div className="inspector-coin-manager">
                            <h4>
                              <Coins size={14} /> Tanga balansini boshqarish
                            </h4>
                            <div className="coin-quick-buttons">
                              {[-5, -1, 1, 5, 10].map((delta) => (
                                <button
                                  className={`coin-delta-btn ${delta > 0 ? 'plus' : 'minus'}`}
                                  disabled={actionBusy}
                                  key={delta}
                                  onClick={() => handleAdjustCoins(selectedInspectUser.id, delta)}
                                  type="button"
                                >
                                  {delta > 0 ? `+${delta}` : delta} ◈
                                </button>
                              ))}
                            </div>
                            <form
                              className="coin-custom-form"
                              onSubmit={(e) => {
                                e.preventDefault()
                                const parsed = parseInt(customCoinDelta, 10)
                                if (!Number.isNaN(parsed) && parsed !== 0) {
                                  handleAdjustCoins(selectedInspectUser.id, parsed)
                                }
                              }}
                            >
                              <input
                                className="form-control"
                                onChange={(e) => setCustomCoinDelta(e.target.value)}
                                placeholder="Masalan: 20 yoki -3"
                                type="number"
                                value={customCoinDelta}
                              />
                              <button className="button button-primary" disabled={actionBusy} type="submit">
                                Qo&apos;llash
                              </button>
                            </form>
                          </div>
                        )}

                        <div className="inspector-offers-section">
                          <h4>
                            @{selectedInspectUser.username} joylagan takliflar (
                            {selectedInspectUser.offers?.length || 0}):
                          </h4>
                          {selectedInspectUser.offers?.length === 0 ? (
                            <div className="no-offers-msg">
                              Ushbu foydalanuvchi hali taklif joylamagan.
                            </div>
                          ) : (
                            <div className="inspector-offers-list">
                              {selectedInspectUser.offers.map((offer: any) => (
                                <div className="inspector-offer-item" key={offer.id}>
                                  <div className="inspector-offer-meta">
                                    <strong>{offer.canTeach}</strong> <span>↔</span>{' '}
                                    <span>{offer.wantsToLearn}</span>
                                    <small className="offer-loc">
                                      {offer.category || 'Umumiy'} • {offer.location || 'Toshkent'}
                                    </small>
                                  </div>
                                  <button
                                    className="admin-delete-offer-btn"
                                    onClick={() => handleDeleteOffer(offer.id)}
                                    title="E'lonni o'chirish"
                                    type="button"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="select-user-prompt">
                        Chap tarafdagi ro&apos;yxatdan kuzatmoqchi bo&apos;lgan foydalanuvchini tanlang
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'payments' && adminData && (
              <div className="admin-payments-layout">
                <section className="admin-panel-card surface-card">
                  <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <h3>
                      <CreditCard size={16} /> Tanga to‘ldirish so‘rovlari
                    </h3>
                    <div className="admin-filter-pills" style={{ marginBottom: 0 }}>
                      {[
                        { id: 'all', label: 'Barchasi' },
                        { id: 'pending', label: 'Kutilmoqda' },
                        { id: 'completed', label: 'Tasdiqlangan' },
                        { id: 'rejected', label: 'Rad etilgan' },
                      ].map((f) => (
                        <button
                          className={`admin-filter-pill ${txFilter === f.id ? 'active' : ''}`}
                          key={f.id}
                          onClick={() => setTxFilter(f.id as any)}
                          type="button"
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="panel-empty">To‘lov so‘rovlari hozircha mavjud emas.</div>
                  ) : (
                    <div className="admin-tx-list">
                      {filteredTransactions.map((tx: any) => (
                        <div className={`admin-tx-row status-${tx.status}`} key={tx.id}>
                          <div className="admin-tx-info">
                            <div className="admin-tx-title">
                              <strong>{tx.id}</strong>
                              <span>
                                {tx.userName} (@{tx.userUsername})
                              </span>
                              <span className={`tx-status ${tx.status}`}>
                                {tx.status === 'pending'
                                  ? 'Kutilmoqda'
                                  : tx.status === 'completed'
                                    ? 'Tasdiqlandi'
                                    : 'Rad etildi'}
                              </span>
                            </div>
                            <div className="admin-tx-meta">
                              <span>{tx.note}</span> •{' '}
                              <strong>{(tx.amountUzs || 0).toLocaleString()} UZS</strong> •{' '}
                              <span>{(tx.provider || '').toUpperCase()}</span> • Chek: <code>{tx.paymentRef}</code>
                              {tx.promoCode && <span> • Promo: {tx.promoCode}</span>}
                            </div>
                          </div>

                          <div className="admin-tx-actions">
                            <strong className="tx-plus">+{tx.coinsDelta} ◈</strong>
                            {tx.status === 'pending' && isMainAdmin && (
                              <div className="report-actions">
                                <button
                                  className="button button-primary"
                                  disabled={actionBusy}
                                  onClick={() =>
                                    postAdminAction(
                                      { action: 'reviewTransaction', txId: tx.id, decision: 'completed' },
                                      `To‘lov ${tx.id} tasdiqlandi va +${tx.coinsDelta} ◈ qo‘shildi!`
                                    )
                                  }
                                  style={{ minHeight: 34, padding: '0 12px', fontSize: 11 }}
                                  type="button"
                                >
                                  <Check size={13} /> Tasdiqlash
                                </button>
                                <button
                                  className="admin-action-pill danger"
                                  disabled={actionBusy}
                                  onClick={() =>
                                    postAdminAction(
                                      { action: 'reviewTransaction', txId: tx.id, decision: 'rejected' },
                                      `To‘lov ${tx.id} rad etildi`
                                    )
                                  }
                                  type="button"
                                >
                                  Rad etish
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="admin-panel-card surface-card">
                  <div className="panel-card-header">
                    <h3>
                      <Tag size={16} /> Marketing Promo-kodlar
                    </h3>
                  </div>

                  {isMainAdmin && (
                    <form className="admin-promo-form" onSubmit={handleCreatePromoSubmit}>
                      <input
                        className="form-control"
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="Kod (masalan: BAHOR25)"
                        required
                        value={promoCodeInput}
                      />
                      <input
                        className="form-control"
                        onChange={(e) => setPromoBonusCoins(e.target.value)}
                        placeholder="+Tanga"
                        type="number"
                        value={promoBonusCoins}
                      />
                      <input
                        className="form-control"
                        onChange={(e) => setPromoBonusPercent(e.target.value)}
                        placeholder="+Foiz %"
                        type="number"
                        value={promoBonusPercent}
                      />
                      <input
                        className="form-control"
                        onChange={(e) => setPromoMaxUses(e.target.value)}
                        placeholder="Limit"
                        type="number"
                        value={promoMaxUses}
                      />
                      <input
                        className="form-control"
                        onChange={(e) => setPromoDesc(e.target.value)}
                        placeholder="Izoh (ixtiyoriy)"
                        value={promoDesc}
                      />
                      <button className="button button-primary" disabled={actionBusy} type="submit">
                        Qo‘shish
                      </button>
                    </form>
                  )}

                  <div className="admin-promo-list">
                    {(adminData.promoCodes || []).map((p: any) => (
                      <div className="admin-promo-row" key={p.code}>
                        <div>
                          <strong>{p.code}</strong>
                          <span>
                            {p.bonusCoins > 0 ? `+${p.bonusCoins} ◈` : ''}{' '}
                            {p.bonusPercent > 0 ? `+${p.bonusPercent}%` : ''} • Ishlatildi: {p.usedCount}/
                            {p.maxUses}
                            {p.description ? ` • ${p.description}` : ''}
                          </span>
                        </div>
                        {isMainAdmin && (
                          <div className="report-actions">
                            <button
                              className="admin-action-pill"
                              onClick={() =>
                                postAdminAction(
                                  { action: 'togglePromo', code: p.code },
                                  `${p.code} holati yangilandi`
                                )
                              }
                              type="button"
                            >
                              {p.active ? 'Faol (To‘xtatish)' : 'Nofaol (Yoqish)'}
                            </button>
                            <button
                              className="admin-delete-offer-btn"
                              onClick={() =>
                                postAdminAction(
                                  { action: 'deletePromo', code: p.code },
                                  `${p.code} o‘chirildi`
                                )
                              }
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {tab === 'offers' && adminData && (
              <div className="admin-offers-manager">
                <div className="admin-user-search-bar">
                  <Search size={15} />
                  <input
                    className="form-control"
                    onChange={(e) => setOfferSearch(e.target.value)}
                    placeholder="Takliflarni qidirish (ko'nikma, yo'nalish, shahar, muallif)..."
                    value={offerSearch}
                  />
                </div>

                {allOffers.length === 0 ? (
                  <div className="admin-empty-card surface-card">Hech qanday taklif topilmadi.</div>
                ) : (
                  <div className="admin-offers-grid">
                    {allOffers.map((offer) => (
                      <div className="admin-offer-card surface-card" key={offer.id}>
                        <div className="admin-offer-top">
                          <span className="admin-offer-cat">{offer.category || 'Umumiy'}</span>
                          <button
                            className="admin-delete-offer-btn"
                            onClick={() => handleDeleteOffer(offer.id)}
                            title="Taklifni o'chirish"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="admin-offer-skills">
                          <strong>{offer.canTeach}</strong>
                          <span>↔ {offer.wantsToLearn}</span>
                        </div>
                        <div className="admin-offer-footer">
                          <span>
                            {offer.userName} (@{offer.userUsername})
                          </span>
                          <span>{offer.location || 'Toshkent'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reports' && adminData && (
              <div className="admin-reports-manager">
                <div className="admin-filter-pills">
                  {[
                    { key: 'all', label: 'Barchasi' },
                    { key: 'pending', label: 'Kutilmoqda' },
                    { key: 'reviewed', label: "Ko'rib chiqilmoqda" },
                    { key: 'resolved', label: 'Hal qilindi' },
                  ].map((item) => (
                    <button
                      className={`admin-filter-pill ${reportFilter === item.key ? 'active' : ''}`}
                      key={item.key}
                      onClick={() => setReportFilter(item.key as any)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="admin-reports-list">
                  {filteredReports.length === 0 ? (
                    <div className="admin-empty-card surface-card">
                      Ushbu bo&apos;limda shikoyatlar topilmadi.
                    </div>
                  ) : (
                    filteredReports.map((rep: any) => (
                      <div className={`report-admin-card surface-card status-${rep.status}`} key={rep.id}>
                        <div className="report-card-top">
                          <div>
                            <strong className="report-title">{rep.reasonTitle}</strong>
                            <span className="report-target">
                              Obyekt: {rep.targetName} {rep.targetUsername && `(@${rep.targetUsername})`}
                            </span>
                          </div>
                          <span className={`report-status-badge ${rep.status}`}>{rep.status}</span>
                        </div>

                        <p className="report-desc-text">&ldquo;{rep.description}&rdquo;</p>

                        <div className="report-card-footer">
                          <small>
                            Yuboruvchi: {rep.reporterName} (@{rep.reporterUsername})
                          </small>
                          <div className="report-actions">
                            {rep.status === 'pending' && (
                              <button
                                className="admin-action-pill"
                                onClick={() =>
                                  postAdminAction(
                                    { action: 'updateReport', reportId: rep.id, status: 'reviewed' },
                                    "Shikoyat ko'rib chiqilmoqda!"
                                  )
                                }
                                type="button"
                              >
                                Ko&apos;rib chiqilmoqda
                              </button>
                            )}
                            {rep.status !== 'resolved' ? (
                              <button
                                className="button button-primary resolve-btn"
                                onClick={() =>
                                  postAdminAction(
                                    { action: 'updateReport', reportId: rep.id, status: 'resolved' },
                                    'Shikoyat hal qilindi deb belgilandi!'
                                  )
                                }
                                type="button"
                              >
                                <Check size={13} /> Hal qilindi
                              </button>
                            ) : (
                              <button
                                className="admin-action-pill"
                                onClick={() =>
                                  postAdminAction(
                                    { action: 'updateReport', reportId: rep.id, status: 'pending' },
                                    'Shikoyat qayta ochildi'
                                  )
                                }
                                type="button"
                              >
                                Qayta ochish
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page-root">
      {toastMsg && (
        <aside aria-label="Xabarnoma" className="toast-message surface-card">
          <span className="toast-check">
            <Sparkles aria-hidden="true" size={13} />
          </span>
          <span>{toastMsg}</span>
        </aside>
      )}
      {isLoggedIn ? renderDashboard() : renderAuth()}
      {pendingDeleteOfferId && (
        <ConfirmActionModal
          busy={actionBusy}
          confirmLabel="Ha, o‘chirilsin"
          description="Haqiqatan ham bu taklifni o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi."
          onClose={() => {
            if (!actionBusy) setPendingDeleteOfferId(null)
          }}
          onConfirm={confirmDeleteOffer}
          title="Taklifni o‘chirish"
        />
      )}
    </div>
  )
}
