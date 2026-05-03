'use client';

import { Info } from 'lucide-react';

export function OthersTab() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-8 text-center">
      <Info className="mx-auto mb-3 h-8 w-8 text-[#52525B]" />
      <p className="text-sm text-[#71717A]">
        Additional vehicle information will appear here.
      </p>
    </div>
  );
}
