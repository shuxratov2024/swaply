import { NextRequest, NextResponse } from 'next/server'
import { updateUser, isUsernameAvailable } from '@/lib/db'
import { authenticateRequest, parseJsonBody, sanitizeUser } from '@/lib/api-helpers'

const MAX_AVATAR_LENGTH = 700_000 // ~500KB base64 limit

export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Token topilmadi')
    if (auth.error) return auth.error

    const parsed = await parseJsonBody<{
      name?: unknown
      username?: unknown
      bio?: unknown
      avatar?: unknown
      gender?: unknown
      phone?: unknown
      telegram?: unknown
      whatsapp?: unknown
    }>(request)
    if (parsed.error) return parsed.error

    const { name, username, bio, avatar, gender, phone, telegram, whatsapp } = parsed.data

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
        return NextResponse.json(
          { error: 'Ism 2 dan 60 tagacha belgidan iborat bo‘lishi kerak' },
          { status: 400 }
        )
      }
    }

    if (username !== undefined) {
      if (typeof username !== 'string') {
        return NextResponse.json({ error: 'Username formati noto‘g‘ri' }, { status: 400 })
      }
      const check = isUsernameAvailable(username, auth.user.id)
      if (!check.available) {
        return NextResponse.json(
          { error: check.error || 'Bu username band' },
          { status: 409 }
        )
      }
    }

    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json(
        { error: 'Bio ko‘pi bilan 500 ta belgidan iborat bo‘lishi kerak' },
        { status: 400 }
      )
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > MAX_AVATAR_LENGTH) {
        return NextResponse.json(
          { error: 'Rasm hajmi juda katta (maksimum 500KB)' },
          { status: 400 }
        )
      }
      if (
        avatar !== '' &&
        !avatar.startsWith('data:image/') &&
        !avatar.startsWith('https://') &&
        !avatar.startsWith('http://') &&
        !avatar.startsWith('/')
      ) {
        return NextResponse.json(
          { error: 'Rasm manzili noto‘g‘ri formatda' },
          { status: 400 }
        )
      }
    }

    if (gender !== undefined && gender !== 'male' && gender !== 'female' && gender !== 'other') {
      return NextResponse.json({ error: 'Jins qiymati noto‘g‘ri' }, { status: 400 })
    }

    const updated = updateUser(auth.user.id, {
      ...(typeof name === 'string' ? { name } : {}),
      ...(typeof username === 'string' ? { username } : {}),
      ...(typeof bio === 'string' ? { bio: bio.trim() } : {}),
      ...(typeof avatar === 'string' ? { avatar } : {}),
      ...(gender === 'male' || gender === 'female' || gender === 'other' ? { gender } : {}),
      ...(typeof phone === 'string' ? { phone: phone.trim().slice(0, 40) } : {}),
      ...(typeof telegram === 'string' ? { telegram: telegram.trim().slice(0, 60) } : {}),
      ...(typeof whatsapp === 'string' ? { whatsapp: whatsapp.trim().slice(0, 40) } : {}),
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profil yangilandi',
      user: sanitizeUser(updated),
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
