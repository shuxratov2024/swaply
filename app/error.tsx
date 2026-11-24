'use client'

import { useEffect } from 'react'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Swaply route error:', 'A route failed to render.')
  }, [])

  return (
    <main className="route-message-shell">
      <section aria-labelledby="route-error-title" className="route-message-card">
        <p className="route-message-kicker">SWAPLY</p>
        <h1 id="route-error-title">Sahifani yuklab bo‘lmadi</h1>
        <p>Qayta urinib ko‘ring. Muammo davom etsa, sahifani yangilang.</p>
        <button className="button button-primary" onClick={reset} type="button">
          Qayta urinish
        </button>
      </section>
    </main>
  )
}
