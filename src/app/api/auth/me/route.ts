import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/constants';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function tryRefreshToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  // If no access token but refresh token exists, try to refresh automatically
  if (!token && refresh) {
    const newToken = await tryRefreshToken(refresh);
    if (newToken) {
      token = newToken;
      // Set the refreshed access token cookie
      cookieStore.set(AUTH_COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      });
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/v1/suppliers/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      // Token might be invalid — clear it so next call uses refresh token
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({ user: data, token });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
