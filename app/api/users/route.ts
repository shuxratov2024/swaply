import { NextRequest, NextResponse } from 'next/server'
import { searchUsers } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.trim() || ''
    const gender = searchParams.get('gender')?.trim() || ''

    const users = searchUsers(query, gender || undefined)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Foydalanuvchilarni yuklashda xatolik' }, { status: 500 })
  }
}
