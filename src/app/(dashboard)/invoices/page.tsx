'use client';

import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoices/invoice.service';
import { InvoiceKPICards } from '@/components/invoices/invoice-kpi-cards';
import { InvoiceTable } from '@/components/invoices/invoice-table';
import type { SupplierStatement, InvoiceKpis } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useCallback } from 'react';

type DateFilter = 'all' | 'this_month' | 'last_month' | 'this_year';

export default function InvoicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statements, setStatements] = useState<SupplierStatement[]>([]);
  const [kpis, setKpis] = useState<InvoiceKpis | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stmts, kpisData] = await Promise.all([
        invoiceService.getStatements(page, limit),
        invoiceService.getKpis(),
      ]);
      setStatements(stmts.data);
      setTotal(stmts.total);
      setKpis(kpisData);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFleetTracking({ onRefresh: loadData });

  const filteredStatements = statements.filter((stmt) => {
    if (dateFilter === 'all') return true;
    
    const date = new Date(stmt.periodStart);
    const now = new Date();
    
    if (dateFilter === 'this_month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getMonth() === lastMonth && date.getFullYear() === year;
    }
    if (dateFilter === 'this_year') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Invoices & Statements</h1>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#71717A]">Filter:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-1.5 text-sm text-white focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15] transition-colors cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>
      
      <InvoiceKPICards kpis={kpis} isLoading={isLoading} />
      <InvoiceTable 
        data={filteredStatements} 
        isLoading={isLoading}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
