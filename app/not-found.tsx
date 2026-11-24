import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="route-message-shell">
      <section aria-labelledby="not-found-title" className="route-message-card">
        <p className="route-message-kicker">SWAPLY</p>
        <h1 id="not-found-title">Sahifa topilmadi</h1>
        <p>Bu manzil mavjud emas yoki ko‘chirilgan.</p>
        <Link className="button button-primary" href="/">
          Bosh sahifaga qaytish
        </Link>
      </section>
    </main>
  )
}
