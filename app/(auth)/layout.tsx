import type { ReactNode } from 'react'
import { SwaplyApp } from '@/components/swaply/swaply-app'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SwaplyApp />
      {children}
    </>
  )
}
