'use client';

import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoices/invoice.service';
import { InvoiceKPICards } from '@/components/invoices/invoice-kpi-cards';
import { InvoiceTable } from '@/components/invoices/invoice-table';
import type { SupplierStatement, InvoiceKpis } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useCallback } from 'react';

export default function InvoicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statements, setStatements] = useState<SupplierStatement[]>([]);
  const [kpis, setKpis] = useState<InvoiceKpis | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stmts, kpisData] = await Promise.all([
        invoiceService.getStatements(),
        invoiceService.getKpis(),
      ]);
      setStatements(stmts);
      setKpis(kpisData);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFleetTracking({ onRefresh: loadData });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Invoices & Statements</h1>
      <InvoiceKPICards kpis={kpis} isLoading={isLoading} />
      <InvoiceTable data={statements} isLoading={isLoading} />
    </div>
  );
}
