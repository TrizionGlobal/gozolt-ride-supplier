'use client';

import { apiClient } from '@/lib/api-client';
import type { SupplierStatement, InvoiceKpis } from '@/types';


export const invoiceService = {
  async getStatements(): Promise<SupplierStatement[]> {
    try {
      const res = await apiClient.get('/suppliers/invoices');
      return res.data;
    } catch {
      return [];
    }
  },

  async getKpis(): Promise<InvoiceKpis> {
    try {
      const res = await apiClient.get('/suppliers/invoices/summary');
      return res.data;
    } catch {
      return { totalInvoiced: 0, paid: 0, pending: 0, tipPassThrough: 0 };
    }
  },

  async downloadStatement(id: string): Promise<void> {
    const res = await apiClient.get(`/suppliers/invoices/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
