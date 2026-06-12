'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { fleetService } from '@/services/fleet/fleet.service';
import { VehicleStatus } from '@/types';
import type { FleetVehicleDetail } from '@/types';
import { DetailsTab } from '@/components/fleet/tabs/details-tab';
import { DriverTab } from '@/components/fleet/tabs/driver-tab';
import { DocumentsTab } from '@/components/fleet/tabs/documents-tab';
import { MaintenanceTab } from '@/components/fleet/tabs/maintenance-tab';
import { FuelTab } from '@/components/fleet/tabs/fuel-tab';
import { RidesTab } from '@/components/fleet/tabs/rides-tab';
import { OthersTab } from '@/components/fleet/tabs/others-tab';

const tabs = ['Details', 'Driver', 'Documents', 'Rides'] as const;
type TabName = (typeof tabs)[number];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [VehicleStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [VehicleStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Admin Pending' },
  [VehicleStatus.MAINTENANCE]: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'In Maint.' },
  [VehicleStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [VehicleStatus.DECOMMISSIONED]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Decom.' },
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const [vehicle, setVehicle] = useState<FleetVehicleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('Details');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await fleetService.getVehicle(vehicleId);
        setVehicle(data);
      } catch {
        toast.error('Failed to load vehicle details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId]);

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

  if (!vehicle) {
    return (
      <div className="text-center">
        <p className="text-[#71717A]">Vehicle not found</p>
        <button onClick={() => router.push('/fleet')} className="mt-2 text-sm text-[#FACC15] hover:underline">
          Back to Fleet
        </button>
      </div>
    );
  }

  const style = statusStyles[vehicle.status] || statusStyles[VehicleStatus.ACTIVE];

  const renderTab = () => {
    switch (activeTab) {
      case 'Details':
        return <DetailsTab vehicle={vehicle} />;
      case 'Driver':
        return <DriverTab vehicle={vehicle} />;
      case 'Documents':
        return <DocumentsTab vehicle={vehicle} />;
      case 'Rides':
        return <RidesTab vehicle={vehicle} />;
    }
  };

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/fleet')}
          className="mb-3 flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{vehicle.plateNumber}</h1>
            <p className="text-sm text-[#A1A1AA]">{vehicle.make} {vehicle.model}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-[#27272A]">
        <div className="flex gap-1 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
