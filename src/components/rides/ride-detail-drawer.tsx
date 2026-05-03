'use client';

import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SupplierRideListItem } from '@/types';

interface RideDetailDrawerProps {
  ride: SupplierRideListItem | null;
  onClose: () => void;
}

export function RideDetailDrawer({ ride, onClose }: RideDetailDrawerProps) {
  if (!ride) return null;

  const fareBreakdown = [
    { label: 'Base Fare', value: ride.baseFare },
    { label: 'Distance Fare', value: ride.distanceFare },
    { label: 'Time Fare', value: ride.timeFare },
    { label: 'Booking Fee', value: ride.bookingFee },
    { label: 'Surge', value: ride.surgeMultiplier > 1 ? `${ride.surgeMultiplier}x` : null },
    { label: 'Total Fare', value: ride.actualFare, bold: true },
    { label: 'Tip', value: ride.tipAmount, green: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[#27272A] bg-[#0A0A0A] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Ride {ride.displayId}</h3>
          <button onClick={onClose} className="text-[#71717A] hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {/* Route */}
        <div className="mb-6 rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <p className="text-xs text-[#71717A] mb-1">Route</p>
          <p className="text-sm text-white">{ride.pickup}</p>
          <p className="text-xs text-[#52525B] my-1">↓</p>
          <p className="text-sm text-white">{ride.dropoff}</p>
        </div>

        {/* Driver & Vehicle */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <p className="text-xs text-[#71717A]">Driver</p>
            <p className="mt-1 text-sm font-medium text-white">{ride.driverName}</p>
          </div>
          <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <p className="text-xs text-[#71717A]">Vehicle</p>
            <p className="mt-1 text-sm font-medium text-white">{ride.vehiclePlate}</p>
            <p className="text-xs text-[#52525B]">{ride.vehicleType}</p>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="mb-6 rounded-lg border border-[#27272A] bg-[#111111] p-4">
          <p className="text-sm font-semibold text-white mb-3">Fare Breakdown</p>
          <div className="space-y-2">
            {fareBreakdown.map(({ label, value, bold, green }) => {
              if (value === null || value === undefined) return null;
              return (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-sm ${bold ? 'font-semibold text-white' : 'text-[#A1A1AA]'}`}>{label}</span>
                  <span className={`text-sm ${green ? 'text-green-400 font-medium' : bold ? 'font-bold text-white' : 'text-[#D4D4D8]'}`}>
                    {typeof value === 'number' ? formatCurrency(value) : value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <p className="text-xs text-[#71717A]">Payment</p>
            <p className="mt-1 text-sm font-medium text-white">{ride.paymentMethod}</p>
          </div>
          <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
            <p className="text-xs text-[#71717A]">Status</p>
            <p className="mt-1 text-sm font-medium text-white">{ride.status}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-6 rounded-lg border border-[#27272A] bg-[#111111] p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-[#A1A1AA]">Requested</span>
            <span className="text-sm text-[#D4D4D8]">{ride.requestedAt ? new Date(ride.requestedAt).toLocaleString() : 'N/A'}</span>
          </div>
          {ride.completedAt && (
            <div className="flex justify-between">
              <span className="text-sm text-[#A1A1AA]">Completed</span>
              <span className="text-sm text-[#D4D4D8]">{new Date(ride.completedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
