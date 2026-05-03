'use client';

import { Star } from 'lucide-react';
import type { Driver } from '@/types';

interface RatingsTabProps {
  driver: Driver;
}

export function RatingsTab({ driver }: RatingsTabProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <div className="mb-4 flex items-center gap-3">
        <Star className="h-10 w-10 fill-[#FACC15] text-[#FACC15]" />
        <div>
          <p className="text-3xl font-bold text-white">{driver.avgRating}</p>
          <p className="text-sm text-[#A1A1AA]">Based on {driver.totalRides} rides</p>
        </div>
      </div>
      <p className="text-sm text-[#71717A]">
        Individual ratings and reviews will appear here.
      </p>
    </div>
  );
}
