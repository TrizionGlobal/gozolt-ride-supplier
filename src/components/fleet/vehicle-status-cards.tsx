'use client';

import type { FleetVehicle } from '@/types';
import { VehicleStatus } from '@/types';

interface VehicleStatusCardsProps {
  vehicles: FleetVehicle[];
}

const statusConfig = [
  { key: 'total', label: 'Total', color: 'bg-[#FACC15]' },
  { key: VehicleStatus.ACTIVE, label: 'Active', color: 'bg-[#22C55E]' },
  { key: VehicleStatus.PENDING_APPROVAL, label: 'Pending Approval', color: 'bg-[#EAB308]' },
  { key: VehicleStatus.MAINTENANCE, label: 'In Maintenance', color: 'bg-[#F97316]' },
  { key: VehicleStatus.SUSPENDED, label: 'Suspended', color: 'bg-[#EF4444]' },
] as const;

export function VehicleStatusCards({ vehicles }: VehicleStatusCardsProps) {
  const getCount = (key: string) => {
    if (key === 'total') return vehicles.length;
    return vehicles.filter((v) => v.status === key).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statusConfig.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#111111] p-3"
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.color}`}>
            <span className="text-sm font-bold text-black">{getCount(item.key)}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{getCount(item.key)}</p>
            <p className="text-xs text-[#A1A1AA]">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
