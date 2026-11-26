import type { Metadata } from 'next'
import { AdminPage } from '@/components/swaply/admin-page'

export const metadata: Metadata = {
  title: 'Swaply — Admin Dashboard',
  description: 'Swaply platformasi tahlili, foydalanuvchilar, takliflar va shikoyatlarni boshqarish paneli.',
}

export default function AdminRoutePage() {
  return <AdminPage />
}
