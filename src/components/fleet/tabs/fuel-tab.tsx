'use client';

import { useState, useEffect } from 'react';
import { Plus, Fuel } from 'lucide-react';
import { toast } from 'sonner';
import { fleetService } from '@/services/fleet/fleet.service';
import type { FuelLog } from '@/types';

interface FuelTabProps {
  vehicleId: string;
}

export function FuelTab({ vehicleId }: FuelTabProps) {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fleetService.getFuelLogs(vehicleId);
        setLogs(res.data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [vehicleId]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => toast.info('Add fuel record coming soon')}
          className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Record
        </button>
      </div>

      <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <Fuel className="mx-auto mb-2 h-8 w-8 text-[#52525B]" />
            <p className="text-sm text-[#71717A]">No fuel records yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Liters</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Cost</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#27272A] last:border-b-0 hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">
                    {new Date(log.filledAt).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A1A1AA]">{log.liters}L</td>
                  <td className="px-4 py-3 text-sm text-[#A1A1AA]">€ {Number(log.cost ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
