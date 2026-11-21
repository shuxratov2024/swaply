import { NextRequest, NextResponse } from 'next/server'
import { isUsernameAvailable } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ available: false, error: 'Username kiritilmadi' }, { status: 400 })
    }

    let excludeUserId: number | undefined
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7))
      if (payload) {
        excludeUserId = payload.userId
      }
    }

    const result = isUsernameAvailable(username, excludeUserId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json({ available: false, error: 'Server xatoligi' }, { status: 500 })
  }
}
