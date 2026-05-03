'use client';

import { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { driverService } from '@/services/drivers/driver.service';
import type { DriverRide } from '@/types';

export function RidesTab() {
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const data = await driverService.getDriverRides();
        setRides(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchRides();
  }, []);

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
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      {rides.length === 0 ? (
        <div className="p-8 text-center">
          <Navigation className="mx-auto mb-2 h-8 w-8 text-[#52525B]" />
          <p className="text-sm text-[#71717A]">No rides recorded yet</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-[#71717A]">Route</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase text-[#71717A]">Fare</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id} className="border-b border-[#27272A] last:border-b-0 hover:bg-[#1A1A1A]/50 transition-colors">
                <td className="px-4 py-3 text-sm text-[#D4D4D8]">{ride.date}</td>
                <td className="px-4 py-3 text-sm text-white">{ride.route}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-white">€{ride.fare}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
