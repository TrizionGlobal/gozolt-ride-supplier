'use client';

import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { AssignedVehicle } from '@/types';

interface VehicleTabProps {
  driverId: string;
}

export function VehicleTab({ driverId }: VehicleTabProps) {
  const [vehicle, setVehicle] = useState<AssignedVehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const data = await driverService.getAssignedVehicle(driverId);
        setVehicle(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, [driverId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="h-32 rounded-lg bg-[#27272A] animate-pulse" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-8 text-center">
        <Truck className="mx-auto mb-3 h-8 w-8 text-[#52525B]" />
        <p className="mb-3 text-sm text-[#71717A]">No vehicle assigned to this driver</p>
        <button
          onClick={() => toast.info('Vehicle assignment coming soon')}
          className="rounded-full bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          Assign Vehicle
        </button>
      </div>
    );
  }

  const details = [
    { label: 'Plate', value: vehicle.plateNumber },
    { label: 'Model', value: vehicle.model },
    { label: 'Type', value: vehicle.type },
    { label: 'Make', value: vehicle.make },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-[#A1A1AA]">
        Assigned: <span className="font-medium text-white">{vehicle.plateNumber}</span>
      </p>
      <div className="rounded-lg border border-[#FACC15]/30 bg-[#FACC15]/5 p-4">
        <div className="grid grid-cols-2 gap-4">
          {details.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-[#A1A1AA]">{item.label}:</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
