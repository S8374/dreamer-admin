import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isLoginPage = request.nextUrl.pathname === '/';

  // If user has a token and tries to access login page, redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user doesn't have a token and tries to access a protected route (e.g. /dashboard)
  // we could redirect them to login, but for now we'll just handle the login page restriction as requested.
  if (!token && !isLoginPage) {
    // Optionally redirect to login if trying to access dashboard without token
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/user-management') ||
        request.nextUrl.pathname.startsWith('/services-management') ||
        request.nextUrl.pathname.startsWith('/listings')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/user-management/:path*', '/listings/:path*', '/memberships/:path*', '/services-management/:path*', '/documents/:path*', '/support/:path*', '/reports/:path*', '/settings/:path*'],
}
