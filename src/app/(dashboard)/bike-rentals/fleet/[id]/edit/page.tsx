'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditRentalBikePage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.replace(`/bike-rentals/${params.id}/edit`);
    }
  }, [params.id, router]);

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
    </div>
  );
}
