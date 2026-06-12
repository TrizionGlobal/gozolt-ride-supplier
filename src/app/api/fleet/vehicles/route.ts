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
    
    // Parse vehicle details
    const vehicleDataStr = formData.get('vehicleData') as string;
    if (!vehicleDataStr) {
      throw new Error('Vehicle data is missing');
    }
    const vehicleData = JSON.parse(vehicleDataStr);
    
    // 1. Create vehicle
    const createRes = await fetch(`${BACKEND_URL}/v1/suppliers/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create vehicle: ${err}`);
    }

    const vehicle = await createRes.json();

    // 2. Upload documents
    const metadataStr = formData.get('metadata') as string;
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      
      const uploadPromises = metadata.map(async (meta: any, idx: number) => {
        const file = formData.get(`file_${idx}`);
        if (!file) return null;

        const singleFormData = new FormData();
        singleFormData.append('type', meta.type);
        singleFormData.append('entityType', 'SUPPLIER');
        singleFormData.append('file', file);
        singleFormData.append('vehicleId', vehicle.id);
        if (meta.expiresAt) {
          singleFormData.append('expiresAt', meta.expiresAt);
        }

        const res = await fetch(`${BACKEND_URL}/v1/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: singleFormData as any,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Upload failed for ${meta.type}: ${errText}`);
        }
        return res.json();
      });

      await Promise.all(uploadPromises);
    }

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    console.error('Vehicle creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
