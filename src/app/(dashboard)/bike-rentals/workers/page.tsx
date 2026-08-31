'use client';

import { Plus } from 'lucide-react';
import { WorkersTab } from '@/components/settings/workers-tab';

export default function WorkersPage() {
  const openAddWorkerModal = () => {
    window.dispatchEvent(new CustomEvent('open-add-worker-modal'));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff & Workers</h1>
          <p className="text-[#A1A1AA] mt-1">Manage the staff members who handle bike handovers and returns.</p>
        </div>
        <button
          onClick={openAddWorkerModal}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Worker
        </button>
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
        <WorkersTab />
      </div>
    </div>
  );
}
