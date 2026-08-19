import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;
    const cookieStore = await cookies();

    console.log('[DEBUG /api/auth/login] Received body:', body);

    cookieStore.set(AUTH_COOKIE_NAME, accessToken || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ success: true, receivedBody: body });
  } catch (error: any) {
    console.error('[DEBUG /api/auth/login] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
