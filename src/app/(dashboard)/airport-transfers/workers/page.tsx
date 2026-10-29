'use client';

import { Plus } from 'lucide-react';
import { WorkersTab } from '@/components/settings/workers-tab';

export default function AirportTransferWorkersPage() {
  const openAddWorkerModal = () => {
    window.dispatchEvent(new CustomEvent('open-add-worker-modal'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff &amp; Drivers</h1>
          <p className="text-[#A1A1AA] text-sm mt-1">
            Manage your staff and drivers assigned to airport transfer dispatches.
          </p>
        </div>
        <button
          onClick={openAddWorkerModal}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
        <WorkersTab />
      </div>
    </div>
  );
}
