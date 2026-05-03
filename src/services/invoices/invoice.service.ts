'use client';

import { apiClient } from '@/lib/api-client';
import type { SupplierStatement, InvoiceKpis } from '@/types';
import { mockSupplierStatements, mockInvoiceKpis } from '@/lib/mock-data';
import { toast } from 'sonner';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const invoiceService = {
  async getStatements(): Promise<SupplierStatement[]> {
    if (isDevBypassed()) return mockSupplierStatements;
    try {
      const res = await apiClient.get('/suppliers/invoices');
      return res.data;
    } catch {
      return mockSupplierStatements;
    }
  },

  async getKpis(): Promise<InvoiceKpis> {
    if (isDevBypassed()) return mockInvoiceKpis;
    try {
      const res = await apiClient.get('/suppliers/invoices/summary');
      return res.data;
    } catch {
      return mockInvoiceKpis;
    }
  },

  async downloadStatement(id: string): Promise<void> {
    if (isDevBypassed()) {
      toast.success('Download started (mock)');
      return;
    }
    const res = await apiClient.get(`/suppliers/invoices/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
