import { NextRequest, NextResponse } from 'next/server'
import { getAllOffers, createOffer, deleteOffer } from '@/lib/db'
import { authenticateRequest, isAdminUser, parseJsonBody } from '@/lib/api-helpers'

const VALID_LANGUAGES = new Set(['UZ', 'RU', 'EN'])
const VALID_GENDERS = new Set(['male', 'female', 'other'])

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
    const auth = authenticateRequest(
      request,
      'Taklif qo‘shishingiz uchun ro‘yxatdan o‘ting yoki o‘z hisobingizga kiring'
    )
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{
      canTeach?: unknown
      wantsToLearn?: unknown
      category?: unknown
      description?: unknown
      location?: unknown
      gender?: unknown
      phone?: unknown
      telegram?: unknown
      whatsapp?: unknown
      language?: unknown
    }>(request)
    if (parsed.error) return parsed.error

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
    } = parsed.data

    if (
      typeof canTeach !== 'string' || !canTeach.trim() ||
      typeof wantsToLearn !== 'string' || !wantsToLearn.trim() ||
      typeof category !== 'string' || !category.trim() ||
      typeof description !== 'string' || !description.trim()
    ) {
      return NextResponse.json(
        { error: 'Barcha asosiy maydonlarni to‘ldiring' },
        { status: 400 }
      )
    }

    if (canTeach.trim().length > 100 || wantsToLearn.trim().length > 100 || description.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Matn uzunligi ruxsat etilgan chegaradan oshib ketdi' },
        { status: 400 }
      )
    }

    const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : ''
    const cleanTelegram = typeof telegram === 'string' ? telegram.trim().slice(0, 60) : ''
    const cleanWhatsapp = typeof whatsapp === 'string' ? whatsapp.trim().slice(0, 40) : ''

    if (!cleanPhone && !cleanTelegram && !cleanWhatsapp) {
      return NextResponse.json(
        { error: 'Kamida bitta aloqa vositasini (telefon, Telegram yoki WhatsApp) kiriting' },
        { status: 400 }
      )
    }

    let primaryContact = cleanTelegram || cleanPhone || cleanWhatsapp
    if (cleanTelegram && !cleanTelegram.startsWith('@') && !cleanTelegram.startsWith('http')) {
      primaryContact = `@${cleanTelegram}`
    }

    const validLanguage = typeof language === 'string' && VALID_LANGUAGES.has(language)
      ? (language as 'UZ' | 'RU' | 'EN')
      : 'UZ'

    const validGender = typeof gender === 'string' && VALID_GENDERS.has(gender)
      ? (gender as 'male' | 'female' | 'other')
      : auth.user.gender || 'other'

    const newOffer = createOffer({
      userId: auth.user.id,
      name: auth.user.name,
      username: auth.user.username,
      avatar: auth.user.avatar || '',
      language: validLanguage,
      rating: '5.0',
      verified: true,
      canTeach: canTeach.trim(),
      wantsToLearn: wantsToLearn.trim(),
      category: category.trim().slice(0, 60),
      description: description.trim(),
      location: typeof location === 'string' && location.trim() ? location.trim().slice(0, 80) : 'Toshkent',
      gender: validGender,
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
    const auth = authenticateRequest(
      request,
      'Taklifni o‘chirish uchun tizimga kirishingiz kerak'
    )
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')

    if (!offerId) {
      return NextResponse.json(
        { error: 'Taklif ID raqami kiritilmadi' },
        { status: 400 }
      )
    }

    const deleted = deleteOffer(offerId, auth.user.id, isAdminUser(auth.user))
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
