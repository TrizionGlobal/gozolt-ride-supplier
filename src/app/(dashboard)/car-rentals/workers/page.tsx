'use client';

import { WorkersTab } from '@/components/settings/workers-tab';

export default function WorkersPage() {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Staff & Workers</h1>
        <p className="text-[#A1A1AA] mt-1">Manage the staff members who handle car handovers and returns.</p>
      </div>
      
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <WorkersTab />
      </div>
    </div>
  );
}
