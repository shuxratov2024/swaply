import { SwaplyApp } from '@/components/swaply/swaply-app'
import { getAllOffers, getAllPublicUsers, sanitizeOfferForViewer } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function Page() {
  const initialOffers = getAllOffers().map((offer) => sanitizeOfferForViewer(offer, null))
  const initialMembers = getAllPublicUsers()

  return <SwaplyApp initialOffers={initialOffers} initialMembers={initialMembers} />
}
