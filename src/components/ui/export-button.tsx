'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToExcel } from '@/lib/export-excel';

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label = 'Export Excel' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);
    exportToExcel(data, `${filename}-${new Date().toISOString().split('T')[0]}`);
    setTimeout(() => setExporting(false), 1500);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || data.length === 0}
      className="flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {exporting ? 'Exporting...' : label}
    </button>
  );
}
