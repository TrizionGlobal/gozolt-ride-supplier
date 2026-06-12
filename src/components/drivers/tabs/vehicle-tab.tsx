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

  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchVehicleAndAvailable = async () => {
      try {
        const [data, available] = await Promise.all([
          driverService.getAssignedVehicle(driverId),
          driverService.getAvailableVehicles()
        ]);
        setVehicle(data);
        setAvailableVehicles(available);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicleAndAvailable();
  }, [driverId]);

  const handleAssign = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    setIsAssigning(true);
    try {
      await driverService.assignVehicle(driverId, selectedVehicle);
      toast.success('Vehicle assigned successfully!');
      // Reload to refresh tabs and status
      window.location.reload();
    } catch {
      toast.error('Failed to assign vehicle');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="h-32 rounded-lg bg-[#27272A] animate-pulse" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-8 text-center max-w-lg mx-auto">
        <Truck className="mx-auto mb-3 h-8 w-8 text-[#52525B]" />
        <p className="mb-3 text-sm text-[#71717A]">No vehicle assigned to this driver</p>
        <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full rounded-md border border-[#3F3F46] bg-[#0A0A0A] p-2 text-sm text-white"
          >
            <option value="">Select an available vehicle...</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id}>{v.plateNumber} ({v.make} {v.model})</option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={isAssigning || !selectedVehicle}
            className="w-full rounded-md bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            {isAssigning ? 'Assigning...' : 'Assign Vehicle'}
          </button>
        </div>
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
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-[#A1A1AA]">
          Assigned: <span className="font-medium text-white">{vehicle.plateNumber}</span>
        </p>
        <button
          onClick={() => setIsChanging(!isChanging)}
          className="text-xs text-[#FACC15] hover:underline"
        >
          {isChanging ? 'Cancel' : 'Change Vehicle'}
        </button>
      </div>

      {isChanging && (
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-3 w-full rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full flex-1 rounded-md border border-[#3F3F46] bg-[#0A0A0A] p-2 text-sm text-white"
          >
            <option value="">Select a new vehicle...</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateNumber} ({v.make} {v.model})
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={isAssigning || !selectedVehicle}
            className="whitespace-nowrap rounded-md bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            {isAssigning ? 'Updating...' : 'Update Vehicle'}
          </button>
        </div>
      )}

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
