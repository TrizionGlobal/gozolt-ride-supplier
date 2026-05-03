'use client';

import { useState, useEffect } from 'react';
import { Printer, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { maintenanceFuelService } from '@/services/maintenance-fuel/maintenance-fuel.service';
import { MaintenanceTable } from '@/components/maintenance-fuel/maintenance-table';
import { FuelTable } from '@/components/maintenance-fuel/fuel-table';
import { AddEntryModal } from '@/components/maintenance-fuel/add-entry-modal';
import { MaintenanceReminders } from '@/components/maintenance-fuel/maintenance-reminders';
import { mockMaintenanceReminders } from '@/lib/mock-data';
import type { MaintenanceLogEntry, FuelLogEntry } from '@/types';

type TabType = 'maintenance' | 'fuel';

export default function MaintenanceFuelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('maintenance');
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogEntry[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLogEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [maint, fuel] = await Promise.all([
        maintenanceFuelService.getMaintenanceLogs(),
        maintenanceFuelService.getFuelLogs(),
      ]);
      setMaintenanceLogs(maint);
      setFuelLogs(fuel);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Maintenance & Fuel</h1>

      {/* Maintenance Reminders */}
      <MaintenanceReminders reminders={mockMaintenanceReminders} />

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          {activeTab === 'maintenance' && (
            <button
              onClick={() => toast.info('Print coming soon')}
              className="flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#FACC15] bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Table */}
      {activeTab === 'maintenance' ? (
        <MaintenanceTable data={maintenanceLogs} isLoading={isLoading} />
      ) : (
        <FuelTable data={fuelLogs} isLoading={isLoading} />
      )}

      {/* Add Entry Modal */}
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={fetchData}
        activeTab={activeTab}
      />
    </div>
  );
}
