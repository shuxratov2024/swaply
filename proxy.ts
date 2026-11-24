import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { SESSION_COOKIE_NAME } from '@/lib/session'

function requiresAuthentication(pathname: string) {
  return (
    pathname === '/favorites' ||
    pathname === '/offers/new' ||
    pathname === '/profile' ||
    pathname === '/wallet' ||
    pathname === '/admin'
  )
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const hasValidSession = Boolean(token && verifyToken(token))

  if (pathname === '/login' || pathname === '/register') {
    return hasValidSession
      ? NextResponse.redirect(new URL('/offers', request.url))
      : NextResponse.next()
  }

  if (!requiresAuthentication(pathname)) {
    return NextResponse.next()
  }

  if (hasValidSession) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/login', '/register', '/favorites', '/offers/new', '/profile/:path*', '/wallet', '/admin'],
}
