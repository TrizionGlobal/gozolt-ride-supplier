'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: string;
  badge?: string;
}

export function StatCard({ icon: Icon, iconBg, label, value, badge }: StatCardProps) {
  return (
    <div className="relative flex items-center gap-4 rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-[#A1A1AA]">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-[#22C55E]/20 px-2 py-0.5 text-[10px] font-medium text-[#22C55E]">
          {badge}
        </span>
      )}
    </div>
  );
}
