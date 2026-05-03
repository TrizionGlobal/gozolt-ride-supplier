'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import { DriverStatus } from '@/types';
import type { Driver } from '@/types';
import { OverviewTab } from '@/components/drivers/tabs/overview-tab';
import { DocumentsTab } from '@/components/drivers/tabs/documents-tab';
import { VehicleTab } from '@/components/drivers/tabs/vehicle-tab';
import { RidesTab } from '@/components/drivers/tabs/rides-tab';
import { ShiftsTab } from '@/components/drivers/tabs/shifts-tab';
import { RatingsTab } from '@/components/drivers/tabs/ratings-tab';

const tabs = ['Overview', 'Documents', 'Vehicle', 'Rides', 'Shifts', 'Ratings'] as const;
type TabName = (typeof tabs)[number];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [DriverStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [DriverStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  [DriverStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [DriverStatus.INACTIVE]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Inactive' },
};

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehiclePlate, setVehiclePlate] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

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
        const [driverData, vehicleMap] = await Promise.all([
          driverService.getDriver(driverId),
          driverService.getDriverVehicleMap(),
        ]);
        setDriver(driverData);
        setVehiclePlate(vehicleMap[driverId]);
      } catch {
        toast.error('Failed to load driver details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriver();
  }, [driverId]);

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
        <button onClick={() => router.push('/drivers')} className="mt-2 text-sm text-[#FACC15] hover:underline">
          Back to Drivers
        </button>
      </div>
    );
  }

  const style = statusStyles[driver.status] || statusStyles[DriverStatus.ACTIVE];

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab driver={driver} vehicle={vehiclePlate} />;
      case 'Documents':
        return <DocumentsTab driverId={driverId} />;
      case 'Vehicle':
        return <VehicleTab driverId={driverId} />;
      case 'Rides':
        return <RidesTab />;
      case 'Shifts':
        return <ShiftsTab />;
      case 'Ratings':
        return <RatingsTab driver={driver} />;
    }
  };

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/drivers')}
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
            <button
              onClick={() => toast.info('Edit mode coming soon')}
              className="rounded-md border border-[#FACC15] p-1.5 text-[#FACC15] hover:bg-[#FACC15]/10 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
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
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
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
