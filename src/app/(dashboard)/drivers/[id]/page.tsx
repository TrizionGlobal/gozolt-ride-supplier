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
import { RatingsTab } from '@/components/drivers/tabs/ratings-tab';

const tabs = ['Overview', 'Documents', 'Vehicle', 'Rides', 'Ratings'] as const;
type TabName = (typeof tabs)[number];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [DriverStatus.NEW_DRIVER]: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'New Driver' },
  [DriverStatus.SUPPLIER_APPROVED]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Admin Pending' },
  [DriverStatus.SUPPLIER_SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Supplier Suspended' },
  [DriverStatus.ADMIN_APPROVED]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Needs Vehicle' },
  [DriverStatus.ADMIN_SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Admin Suspended' },
  [DriverStatus.VEHICLE_ASSIGNED]: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Vehicle Assigned' },
  [DriverStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [DriverStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
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

  const isVehicleTabVisible = 
    driver.status === DriverStatus.ACTIVE || 
    driver.status === DriverStatus.ADMIN_APPROVED ||
    driver.status === DriverStatus.VEHICLE_ASSIGNED ||
    driver.status === DriverStatus.SUSPENDED;

  const visibleTabs = tabs.filter(tab => tab !== 'Vehicle' || isVehicleTabVisible);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab driver={driver} vehicle={vehiclePlate} onUpdate={(d) => setDriver({ ...driver, ...d })} />;
      case 'Documents':
        return <DocumentsTab driverId={driverId} />;
      case 'Vehicle':
        return <VehicleTab driverId={driverId} />;
      case 'Rides':
        return <RidesTab />;
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

            {/* Supplier Flow Action Buttons */}
            {driver.status === DriverStatus.NEW_DRIVER && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await driverService.supplierApproveDriver(driver.id);
                      toast.success('Driver application approved. Sent to admin for final review.');
                      window.location.reload();
                    } catch {
                      toast.error('Failed to approve driver');
                    }
                  }}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    try {
                      await driverService.supplierSuspendDriver(driver.id);
                      toast.success('Driver suspended.');
                      window.location.reload();
                    } catch {
                      toast.error('Failed to suspend driver');
                    }
                  }}
                  className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 transition-colors ml-2"
                >
                  Suspend
                </button>
              </>
            )}

            {driver.status === DriverStatus.SUPPLIER_APPROVED && (
              <span className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed">
                Awaiting Admin Approval
              </span>
            )}

            {driver.status === DriverStatus.ADMIN_APPROVED && (
              <button
                onClick={() => handleTabChange('Vehicle')}
                className="rounded-md bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
              >
                Assign Vehicle
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex gap-1">
          {visibleTabs.map((tab) => (
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
