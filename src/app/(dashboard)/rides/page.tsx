'use client';

import { useState, useEffect, useCallback } from 'react';
import { ridesService } from '@/services/rides/rides.service';
import { RideKPICards } from '@/components/rides/ride-kpi-cards';
import { RideTable } from '@/components/rides/ride-table';
import { RideDetailDrawer } from '@/components/rides/ride-detail-drawer';
import { RideExportButton } from '@/components/rides/ride-export-button';
import type { SupplierRideListItem, SupplierRideKpis } from '@/types';

export default function RidesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<SupplierRideListItem[]>([]);
  const [kpis, setKpis] = useState<SupplierRideKpis | null>(null);
  const [selectedRide, setSelectedRide] = useState<SupplierRideListItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRides = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ridesRes, kpisRes] = await Promise.all([
        ridesService.getRides({ status: statusFilter, search: searchTerm }),
        ridesService.getKpis(),
      ]);
      setRides(ridesRes.data);
      setKpis(kpisRes);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Rides Management</h1>
        <RideExportButton rides={rides} />
      </div>

      {/* KPI Cards */}
      <RideKPICards kpis={kpis} isLoading={isLoading} />

      {/* Rides Table */}
      <RideTable
        rides={rides}
        isLoading={isLoading}
        onSearch={setSearchTerm}
        onStatusFilter={setStatusFilter}
        activeFilter={statusFilter}
        onSelectRide={setSelectedRide}
      />

      {/* Detail Drawer */}
      <RideDetailDrawer ride={selectedRide} onClose={() => setSelectedRide(null)} />
    </div>
  );
}
