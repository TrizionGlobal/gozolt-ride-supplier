import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'No token' });

  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
  
  // Test 1: Limit 10
  const res1 = await fetch(`${BACKEND_URL}/v1/suppliers/documents?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data1 = await res1.json();

  // Test 2: entityType=VEHICLE
  const res2 = await fetch(`${BACKEND_URL}/v1/suppliers/documents?page=1&limit=10&entityType=VEHICLE`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data2 = await res2.json();

  // Test 3: type=VEHICLE
  const res3 = await fetch(`${BACKEND_URL}/v1/suppliers/documents?page=1&limit=10&type=VEHICLE`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data3 = await res3.json();

  return NextResponse.json({
    test1_no_filter: data1.data?.length || data1.length || data1,
    test2_entityType: data2.data?.length || data2.length || data2,
    test3_type: data3.data?.length || data3.length || data3,
  });
}
