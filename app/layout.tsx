import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Swaply — Skilllarni pulsiz almashtir',
  description: 'Swaply’da bilimingizni boshqalarning tajribasiga almashtiring. Pul emas — vaqt va mahorat barter qilinadi.',
  applicationName: 'Swaply',
  keywords: ['skill barter', 'ko‘nikma almashish', 'Uzbekistan', 'Swaply'],
  openGraph: {
    title: 'Swaply — Skilllarni pulsiz almashtir',
    description: 'Pul emas, faqat vaqt va mahorat barter qilinadi.',
    type: 'website',
    locale: 'uz_UZ',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1F3D2B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
