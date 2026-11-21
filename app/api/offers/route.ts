import { NextRequest, NextResponse } from 'next/server'
import { getAllOffers, createOffer, deleteOffer, findUserById } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')?.toLowerCase().trim()
    const userIdParam = searchParams.get('userId')
    const gender = searchParams.get('gender')
    const location = searchParams.get('location')

    let offers = getAllOffers(gender || undefined, location || undefined)

    if (userIdParam) {
      const parsedUserId = parseInt(userIdParam, 10)
      if (!isNaN(parsedUserId)) {
        offers = offers.filter((o) => o.userId === parsedUserId)
      }
    }

    if (category && category !== 'Barchasi' && category !== 'Все' && category !== 'All' && category !== 'All skills') {
      offers = offers.filter((o) => o.category === category)
    }

    if (gender && gender !== 'all') {
      offers = offers.filter((o) => o.gender === gender)
    }

    if (search) {
      offers = offers.filter((o) => {
        const text = `${o.name} ${o.username || ''} ${o.canTeach} ${o.wantsToLearn} ${o.category} ${o.description} ${o.location || ''}`.toLowerCase()
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
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Taklif qo‘shishingiz uchun ro‘yxatdan o‘ting yoki o‘z hisobingizga kiring' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Sessiya muddati tugagan. Qaytadan tizimga kiring' },
        { status: 401 }
      )
    }

    const user = findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      canTeach,
      wantsToLearn,
      category,
      description,
      location,
      gender,
      phone,
      telegram,
      whatsapp,
      language = 'UZ',
    } = body

    if (!canTeach?.trim() || !wantsToLearn?.trim() || !category?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Barcha asosiy maydonlarni to‘ldiring' },
        { status: 400 }
      )
    }

    const cleanPhone = phone?.trim() || ''
    const cleanTelegram = telegram?.trim() || ''
    const cleanWhatsapp = whatsapp?.trim() || ''

    if (!cleanPhone && !cleanTelegram && !cleanWhatsapp) {
      return NextResponse.json(
        { error: 'Kamida bitta aloqa vositasini (telefon, Telegram yoki WhatsApp) kiriting' },
        { status: 400 }
      )
    }

    // Kontakt matnini shakllantirish
    let primaryContact = cleanTelegram || cleanPhone || cleanWhatsapp
    if (cleanTelegram && !cleanTelegram.startsWith('@') && !cleanTelegram.startsWith('http')) {
      primaryContact = `@${cleanTelegram}`
    }

    const newOffer = createOffer({
      userId: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85',
      language: (language as 'UZ' | 'RU' | 'EN') || 'UZ',
      rating: '5.0',
      verified: true,
      canTeach: canTeach.trim(),
      wantsToLearn: wantsToLearn.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location?.trim() || 'Toshkent',
      gender: gender || user.gender || 'other',
      contact: primaryContact,
      phone: cleanPhone || undefined,
      telegram: cleanTelegram || undefined,
      whatsapp: cleanWhatsapp || undefined,
    })

    return NextResponse.json({ offer: newOffer }, { status: 201 })
  } catch (error) {
    console.error('Offers POST error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Taklifni o‘chirish uchun tizimga kirishingiz kerak' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Sessiya muddati tugagan' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')

    if (!offerId) {
      return NextResponse.json(
        { error: 'Taklif ID raqami kiritilmadi' },
        { status: 400 }
      )
    }

    const deleted = deleteOffer(offerId, payload.userId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Taklif topilmadi yoki uni o‘chirish huquqingiz yo‘q' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, message: 'Taklif muvaffaqiyatli o‘chirildi' })
  } catch (error) {
    console.error('Offers DELETE error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}
