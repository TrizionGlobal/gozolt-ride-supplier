import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/constants';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const refreshTokenValue = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshTokenValue) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const data = await res.json();
    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_COOKIE_NAME, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set(REFRESH_COOKIE_NAME, data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
