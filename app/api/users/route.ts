import { NextRequest, NextResponse } from 'next/server'
import { searchUsers, getAllPublicUsers } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.trim() || ''

    const users = query ? searchUsers(query) : getAllPublicUsers()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Foydalanuvchilarni yuklashda xatolik' }, { status: 500 })
  }
}
