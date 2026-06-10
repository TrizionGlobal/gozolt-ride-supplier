import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const metadataStr = formData.get('metadata') as string;
    if (!metadataStr) {
      throw new Error('Metadata is missing');
    }
    const metadata = JSON.parse(metadataStr);

    const uploadPromises = metadata.map(async (meta: any, idx: number) => {
      const file = formData.get(`file_${idx}`);
      if (!file) return null;

      const singleFormData = new FormData();
      singleFormData.append('type', meta.type);
      singleFormData.append('entityType', meta.entityType || 'SUPPLIER');
      singleFormData.append('file', file);
      if (meta.vehicleId) {
        singleFormData.append('vehicleId', meta.vehicleId);
      }
      if (meta.expiresAt) {
        singleFormData.append('expiresAt', meta.expiresAt);
      }

      const res = await fetch(`${BACKEND_URL}/v1/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: singleFormData as any,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed for ${meta.type}: ${errText}`);
      }
      return res.json();
    });

    const results = await Promise.all(uploadPromises);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Batch upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
