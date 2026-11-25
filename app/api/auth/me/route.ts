import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, sanitizeUser } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request, 'Token topilmadi')
    if (auth.error) return auth.error

    return NextResponse.json({
      user: sanitizeUser(auth.user),
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
