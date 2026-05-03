'use client';

import Link from 'next/link';
import { Truck, UserPlus, MapPin, Download } from 'lucide-react';
import { toast } from 'sonner';

const actions = [
  { label: 'Add Vehicle', icon: Truck, href: '/fleet/add' },
  { label: 'Add Driver', icon: UserPlus, href: '/drivers/add' },
  { label: 'GPS Tracking', icon: MapPin, href: '/gps-tracking' },
  { label: 'Download Report', icon: Download, href: null },
];

export function QuickActions() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-[#3F3F46] bg-[#1A1A1A] p-4 transition-colors hover:border-[#FACC15] cursor-pointer">
              <Icon className="h-6 w-6 text-[#A1A1AA]" />
              <span className="text-xs text-[#D4D4D8] font-medium">{action.label}</span>
            </div>
          );

          if (action.href) {
            return (
              <Link key={action.label} href={action.href}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.label}
              onClick={() => toast.info('Report download coming soon')}
              className="text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
