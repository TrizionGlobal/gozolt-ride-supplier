'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ExpiringDocument } from '@/types';

interface ExpiringDocsBannerProps {
  docs: ExpiringDocument[];
}

export function ExpiringDocsBanner({ docs }: ExpiringDocsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || docs.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">Documents Expiring Soon</p>
          <ul className="mt-1 text-xs text-[#D4D4D8] space-y-0.5">
            {docs.map((d) => (
              <li key={d.id}>
                • {d.entityName} — {d.type} expires in {d.daysUntilExpiry} days
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-[#71717A] hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
