export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `Taklif ${id} | Swaply`,
    description: 'Mahorat almashish taklifining tafsilotlari.',
  }
}

export default function OfferDetailPage() {
  return null
}
