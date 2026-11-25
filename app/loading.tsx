export default function Loading() {
  return (
    <div className="page-loading-shell" aria-busy="true" aria-label="Sahifa yuklanmoqda">
      <div className="page-loading-topbar">
        <div className="skeleton-pill" style={{ width: 140, height: 34 }} />
        <div className="skeleton-pill" style={{ width: 280, height: 38 }} />
        <div className="skeleton-pill" style={{ width: 180, height: 36 }} />
      </div>
      <div className="page-loading-hero">
        <div className="skeleton-pill" style={{ width: '58%', height: 44 }} />
        <div className="skeleton-pill" style={{ width: '42%', height: 20, marginTop: 14 }} />
      </div>
      <div className="page-loading-grid">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div className="page-loading-card" key={idx}>
            <div className="skeleton-row">
              <div className="skeleton-circle" />
              <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                <div className="skeleton-pill" style={{ width: '60%', height: 16 }} />
                <div className="skeleton-pill" style={{ width: '40%', height: 12 }} />
              </div>
            </div>
            <div className="skeleton-pill" style={{ width: '100%', height: 54, marginTop: 16 }} />
            <div className="skeleton-pill" style={{ width: '85%', height: 14, marginTop: 14 }} />
            <div className="skeleton-pill" style={{ width: '100%', height: 40, marginTop: 18 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
