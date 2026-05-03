'use client';

import { useState, useEffect } from 'react';
import { fleetService } from '@/services/fleet/fleet.service';
import type { FleetVehicleDetail, FleetDriverDetail } from '@/types';

interface DriverTabProps {
  vehicle: FleetVehicleDetail;
}

export function DriverTab({ vehicle }: DriverTabProps) {
  const [driver, setDriver] = useState<FleetDriverDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!vehicle.assignedDriverId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fleetService.getDriverDetail(vehicle.assignedDriverId);
        setDriver(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriver();
  }, [vehicle.assignedDriverId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <p className="text-center text-sm text-[#71717A]">No driver assigned to this vehicle.</p>
      </div>
    );
  }

  const fields = [
    { label: 'First Name', value: driver.firstName },
    { label: 'Last Name', value: driver.lastName },
    { label: 'Email', value: driver.email },
    { label: 'Phone number', value: driver.phone },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      <p className="mb-4 text-sm text-[#A1A1AA]">
        Assigned Driver: <span className="font-medium text-white">{driver.firstName} {driver.lastName}</span>
      </p>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-4">
            <span className="w-36 shrink-0 text-sm text-[#A1A1AA]">{field.label}</span>
            <div className="rounded-md border border-[#27272A] bg-[#0A0A0A] px-3 py-2 text-sm text-white min-w-[200px]">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
