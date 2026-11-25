import { SwaplyApp } from '@/components/swaply/swaply-app'
import { getAllOffers, getAllPublicUsers } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function Page() {
  const initialOffers = getAllOffers()
  const initialMembers = getAllPublicUsers()

  return <SwaplyApp initialOffers={initialOffers} initialMembers={initialMembers} />
}
