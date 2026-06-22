'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/export-excel';
import { maintenanceFuelService } from '@/services/maintenance-fuel/maintenance-fuel.service';
import { MaintenanceTable } from '@/components/maintenance-fuel/maintenance-table';
import { FuelTable } from '@/components/maintenance-fuel/fuel-table';
import { AddEntryModal } from '@/components/maintenance-fuel/add-entry-modal';
import { MaintenanceReminders } from '@/components/maintenance-fuel/maintenance-reminders';
import type { MaintenanceLogEntry, FuelLogEntry } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';

type TabType = 'maintenance' | 'fuel';

export default function MaintenanceFuelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('maintenance');
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogEntry[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLogEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [fuelPage, setFuelPage] = useState(1);
  const [maintenanceTotal, setMaintenanceTotal] = useState(0);
  const [fuelTotal, setFuelTotal] = useState(0);
  const [maintenanceLimit, setMaintenanceLimit] = useState(10);
  const [fuelLimit, setFuelLimit] = useState(10);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [maint, fuel] = await Promise.all([
        maintenanceFuelService.getMaintenanceLogs(maintenancePage, maintenanceLimit, searchQuery),
        maintenanceFuelService.getFuelLogs(fuelPage, fuelLimit, searchQuery),
      ]);
      
      const sortedMaint = maint.data.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());
      const sortedFuel = fuel.data.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());

      setMaintenanceLogs(sortedMaint);
      setMaintenanceTotal(maint.total);
      
      setFuelLogs(sortedFuel);
      setFuelTotal(fuel.total);
    } catch {
      // handled in service
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [maintenancePage, fuelPage, maintenanceLimit, fuelLimit, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useFleetTracking({ onRefresh: () => fetchData(false) });

  const reminders = maintenanceLogs
    .filter((log) => log.status === 'Scheduled' || log.status === 'Overdue')
    .map((log) => {
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
      };
      
      const due = log.nextDueAt ? parseDate(log.nextDueAt) : new Date();
      const diffTime = due.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        id: log.id,
        vehiclePlate: log.vehicle,
        type: log.type,
        dueDate: log.nextDueAt || 'Unknown',
        daysUntilDue: Math.abs(diffDays),
        status: diffDays < 0 ? 'overdue' : 'due_soon',
      } as any;
    });

  const handleExportMaintenance = () => {
    if (maintenanceLogs.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const formattedData = maintenanceLogs.map((log) => ({
      Vehicle: log.vehicle,
      Type: log.type,
      Date: log.date,
      Mileage: log.mileage,
      Cost: log.cost,
      Status: log.status,
    }));

    exportToExcel(formattedData, 'maintenance_logs', 'Maintenance');
  };

  const handleExportFuel = () => {
    if (fuelLogs.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const formattedData = fuelLogs.map((log) => ({
      Vehicle: log.vehicle,
      Date: log.date,
      Liters: log.liters,
      Cost: log.cost,
      Mileage: log.mileage,
    }));

    exportToExcel(formattedData, 'fuel_logs', 'Fuel');
  };

  // Local filtering removed as it is now handled server-side

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Maintenance & Fuel</h1>

      {/* Maintenance Reminders */}
      {isLoading ? (
        <div className="h-24 w-full animate-pulse rounded-lg border border-[#27272A] bg-[#111111]" />
      ) : (
        <MaintenanceReminders reminders={reminders} />
      )}

      {/* Tabs, Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              activeTab === 'maintenance'
                ? 'bg-[#FACC15] text-black font-medium'
                : 'bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46] hover:bg-[#3F3F46]'
            }`}
          >
            Maintenance Log
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              activeTab === 'fuel'
                ? 'bg-[#FACC15] text-black font-medium'
                : 'bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46] hover:bg-[#3F3F46]'
            }`}
          >
            Fuel Log
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-[#3F3F46] bg-[#111111] pl-9 pr-4 text-sm text-white placeholder-[#71717A] focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
            />
          </div>

          <div className="flex gap-2">
          <button
            onClick={activeTab === 'maintenance' ? handleExportMaintenance : handleExportFuel}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors print:hidden ${
              isLoading 
                ? 'border-[#27272A] bg-[#111111] text-[#52525B] cursor-not-allowed' 
                : 'border-[#3F3F46] bg-[#27272A] text-white hover:bg-[#3F3F46]'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#FACC15] bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors print:hidden"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Entry
          </button>
        </div>
        </div>
      </div>

      {/* Table */}
      {activeTab === 'maintenance' ? (
        <MaintenanceTable 
          data={maintenanceLogs} 
          isLoading={isLoading} 
          page={maintenancePage}
          total={maintenanceTotal}
          limit={maintenanceLimit}
          onPageChange={setMaintenancePage}
          onLimitChange={setMaintenanceLimit}
        />
      ) : (
        <FuelTable 
          data={fuelLogs} 
          isLoading={isLoading} 
          page={fuelPage}
          total={fuelTotal}
          limit={fuelLimit}
          onPageChange={setFuelPage}
          onLimitChange={setFuelLimit}
        />
      )}

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={() => fetchData(false)}
        activeTab={activeTab}
      />
    </div>
  );
}
