import type { ReactNode } from 'react'
import { SwaplyApp } from '@/components/swaply/swaply-app'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SwaplyApp />
      {children}
    </>
  )
}
