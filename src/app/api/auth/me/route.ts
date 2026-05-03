import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/v1/suppliers/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
