'use client';

import type { FleetVehicleDetail } from '@/types';
import { VehicleStatus } from '@/types';

interface DetailsTabProps {
  vehicle: FleetVehicleDetail;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [VehicleStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [VehicleStatus.PENDING_APPROVAL]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Admin Pending' },
  [VehicleStatus.MAINTENANCE]: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'In Maint.' },
  [VehicleStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
  [VehicleStatus.DECOMMISSIONED]: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Decom.' },
};

export function DetailsTab({ vehicle }: DetailsTabProps) {
  const style = statusStyles[vehicle.status] || statusStyles[VehicleStatus.ACTIVE];

  const details = [
    { label: 'Plate', value: vehicle.plateNumber },
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Type', value: vehicle.type },
    { label: 'Fuel', value: vehicle.fuelType },
    {
      label: 'Status',
      value: style.label,
      badge: true,
      badgeBg: style.bg,
      badgeText: style.text,
    },
    { label: 'Driver', value: vehicle.assignedDriverName || '—' },
    { label: 'Reg', value: new Date(vehicle.createdAt).toLocaleDateString('en-CA') },
    { label: 'VRT Exp', value: '2026-06-20' },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <div className="grid grid-cols-3 gap-6">
        {details.map((item) => (
          <div key={item.label}>
            <p className="text-xs uppercase text-[#71717A]">{item.label}</p>
            {item.badge ? (
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${item.badgeBg} ${item.badgeText}`}>
                {item.value}
              </span>
            ) : (
              <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
