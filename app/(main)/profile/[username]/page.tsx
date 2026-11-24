export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return {
    title: `@${username} | Swaply`,
    description: `Swaply hamjamiyatidagi @${username} profilini ko‘ring.`,
  }
}

export default function PublicProfilePage() {
  return null
}
