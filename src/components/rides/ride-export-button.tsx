'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/export-csv';
import type { SupplierRideListItem } from '@/types';

interface RideExportButtonProps {
  rides: SupplierRideListItem[];
}

export function RideExportButton({ rides }: RideExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);
    exportToCSV(rides, 'rides-export', [
      { key: 'displayId', label: 'Ride ID' },
      { key: 'driverName', label: 'Driver' },
      { key: 'riderName', label: 'Rider' },
      { key: 'pickup', label: 'Pickup' },
      { key: 'dropoff', label: 'Dropoff' },
      { key: 'status', label: 'Status' },
      { key: 'actualFare', label: 'Fare' },
      { key: 'tipAmount', label: 'Tip' },
      { key: 'paymentMethod', label: 'Payment' },
      { key: 'requestedAt', label: 'Date' },
    ]);
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
