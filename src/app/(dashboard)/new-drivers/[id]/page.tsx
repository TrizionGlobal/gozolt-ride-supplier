'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import { DriverStatus } from '@/types';
import type { Driver } from '@/types';
import { OverviewTab } from '@/components/drivers/tabs/overview-tab';
import { DocumentsTab } from '@/components/drivers/tabs/documents-tab';

const tabs = ['Overview', 'Documents'] as const;
type TabName = (typeof tabs)[number];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [DriverStatus.NEW_DRIVER]: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Unclaimed' },
};

export default function NewDriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabName>(
    tabs.includes(tabParam as TabName) ? (tabParam as TabName) : 'Overview',
  );

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab.toLowerCase());
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const driverData = await driverService.getDriver(driverId);
        setDriver(driverData);
      } catch {
        toast.error('Failed to load driver details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriver();
  }, [driverId]);

  const handleClaim = async () => {
    setClaimingId(driverId);
    try {
      await driverService.claimDriver(driverId);
      toast.success('Driver claimed successfully!');
      router.push('/new-drivers'); // Redirect back to list after claiming
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to claim driver');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-[#27272A] animate-pulse" />
        <div className="h-6 w-32 rounded-lg bg-[#27272A] animate-pulse" />
        <div className="h-10 w-full rounded-lg bg-[#27272A] animate-pulse" />
        <div className="h-64 w-full rounded-lg bg-[#27272A] animate-pulse" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center">
        <p className="text-[#71717A]">Driver not found</p>
        <button onClick={() => router.push('/new-drivers')} className="mt-2 text-sm text-[#FACC15] hover:underline">
          Back to Find New Drivers
        </button>
      </div>
    );
  }

  const style = statusStyles[driver.status] || { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Unclaimed' };

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab driver={driver} onUpdate={(d) => setDriver({ ...driver, ...d })} />;
      case 'Documents':
        return <DocumentsTab driverId={driverId} />;
    }
  };

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/new-drivers')}
          className="mb-3 flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {driver.firstName} {driver.lastName}
            </h1>
            <p className="text-sm text-[#A1A1AA]">{driver.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>

            {/* Claim Action */}
            <button
              onClick={handleClaim}
              disabled={claimingId === driver.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50"
            >
              {claimingId === driver.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Claim Driver
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                activeTab === tab
                  ? 'bg-[#FACC15] text-black font-medium'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTab()}
    </div>
  );
}
