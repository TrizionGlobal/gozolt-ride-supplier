'use client';

import { Plus, ArrowLeft } from 'lucide-react';
import { WorkersTab } from '@/components/settings/workers-tab';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSupplierQuickServiceBySlug } from '@/lib/supplier-quick-services';
import { useAuthStore } from '@/stores/auth.store';

export default function QuickServiceWorkersPage() {
  const params = useParams<{ service: string }>();
  const service = getSupplierQuickServiceBySlug(params.service);
  const { user } = useAuthStore();

  const openAddWorkerModal = () => {
    window.dispatchEvent(new CustomEvent('open-add-worker-modal'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link
            href="/quick-services/workers"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FCD223] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-white">{service?.name || 'Quick Services'} Staff & Workers</h1>
          <p className="text-[#A1A1AA] mt-1">Manage the staff members assigned to {service?.name?.toLowerCase() || 'these'} bookings.</p>
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
