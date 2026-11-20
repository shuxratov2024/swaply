import { NextRequest, NextResponse } from 'next/server'
import { getAllOffers, createOffer } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')?.toLowerCase().trim()

    let offers = getAllOffers()

    if (category && category !== 'Barchasi' && category !== 'Все' && category !== 'All' && category !== 'All skills') {
      offers = offers.filter((o) => o.category === category)
    }

    if (search) {
      offers = offers.filter((o) => {
        const text = `${o.name} ${o.canTeach} ${o.wantsToLearn} ${o.category} ${o.description}`.toLowerCase()
        return text.includes(search)
      })
    }

    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Offers GET error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    let userId: number | undefined

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7))
      if (payload) {
        userId = payload.userId
      }
    }

    const body = await request.json()
    const { name, avatar, language, canTeach, wantsToLearn, category, description, contact } = body

    if (!canTeach || !wantsToLearn || !category || !description) {
      return NextResponse.json(
        { error: 'Barcha maydonlarni to\'ldiring' },
        { status: 400 }
      )
    }

    const newOffer = createOffer({
      userId,
      name: name || 'Foydalanuvchi',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
      language: language || 'UZ',
      rating: '5.0',
      verified: true,
      canTeach,
      wantsToLearn,
      category,
      description,
      contact: contact || '@swaply_user',
    })

    return NextResponse.json({ offer: newOffer }, { status: 201 })
  } catch (error) {
    console.error('Offers POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
