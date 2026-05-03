'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { FleetSidebar } from '@/components/gps/fleet-sidebar';

// Leaflet must be loaded client-side only (uses window object)
const FleetMap = dynamic(() => import('@/components/gps/fleet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#111111]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
        <p className="text-sm text-[#71717A]">Loading map...</p>
      </div>
    </div>
  ),
});

export default function GpsTrackingPage() {
  const { locations, isConnected } = useFleetTracking();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 overflow-hidden rounded-lg border border-[#27272A]">
      {/* Map Area */}
      <div className="flex-1 min-w-0">
        <FleetMap
          locations={locations}
          selectedDriverId={selectedDriverId}
          onMarkerClick={handleSelectDriver}
        />
      </div>

      {/* Sidebar */}
      <FleetSidebar
        locations={locations}
        isConnected={isConnected}
        selectedDriverId={selectedDriverId}
        onSelectDriver={handleSelectDriver}
      />
    </div>
  );
}
