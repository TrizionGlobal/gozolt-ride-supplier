import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
