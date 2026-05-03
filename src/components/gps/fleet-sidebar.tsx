'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { FleetLocationData, FleetStatusFilter } from '@/types';

const filters: FleetStatusFilter[] = ['All', 'Online', 'On Ride', 'Available', 'Offline'];

interface FleetSidebarProps {
  locations: FleetLocationData[];
  isConnected: boolean;
  selectedDriverId: string | null;
  onSelectDriver: (driverId: string) => void;
}

export function FleetSidebar({ locations, isConnected, selectedDriverId, onSelectDriver }: FleetSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<FleetStatusFilter>('All');
  const [search, setSearch] = useState('');

  const filteredLocations = locations.filter((loc) => {
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      const matchesName = loc.driverName.toLowerCase().includes(s);
      const matchesPlate = loc.vehicle?.plateNumber.toLowerCase().includes(s) ?? false;
      if (!matchesName && !matchesPlate) return false;
    }

    // Status filter
    switch (activeFilter) {
      case 'Online':
        return true; // All WebSocket-reported drivers are online
      case 'On Ride':
        return loc.speed != null && loc.speed > 0;
      case 'Available':
        return loc.speed == null || loc.speed === 0;
      case 'Offline':
        return false; // Offline drivers not in WebSocket data
      default:
        return true;
    }
  });

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-[#27272A] bg-[#0F0F0F] p-4">
      {/* Header with connection status */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Fleet Status</h2>
        <span className="flex items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeFilter === filter
                ? 'bg-[#FACC15] text-black font-medium'
                : 'bg-[#27272A] text-[#A1A1AA] hover:bg-[#3F3F46]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] py-2 pl-9 pr-3 text-sm text-white placeholder-[#71717A] focus:border-[#FACC15] focus:outline-none"
        />
      </div>

      {/* Driver List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLocations.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#52525B]">No drivers found</p>
        ) : (
          filteredLocations.map((loc) => (
            <button
              key={loc.driverId}
              onClick={() => onSelectDriver(loc.driverId)}
              className={`flex w-full items-center gap-3 border-b border-[#27272A] py-3 text-left transition-colors hover:bg-[#1A1A1A] ${
                selectedDriverId === loc.driverId ? 'bg-[#1A1A1A]' : ''
              }`}
            >
              {/* Status dot */}
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  loc.speed != null && loc.speed > 0
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              />

              {/* Name + plate */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{loc.driverName}</p>
                <p className="text-xs text-[#52525B]">{loc.vehicle?.plateNumber || '—'}</p>
              </div>

              {/* Speed */}
              <span className="shrink-0 text-xs text-[#A1A1AA]">
                {loc.speed != null ? `${loc.speed}km/h` : '—'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
