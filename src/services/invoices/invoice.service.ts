'use client';

import { apiClient } from '@/lib/api-client';
import type { SupplierStatement, InvoiceKpis } from '@/types';

export const invoiceService = {
  async getStatements(page = 1, limit = 10): Promise<{ data: SupplierStatement[], total: number }> {
    try {
      const res = await apiClient.get('/suppliers/invoices', { params: { page, limit } });
      const statements = res.data.data || res.data || [];
      const total = res.data.meta?.total || statements.length;
      return { data: statements, total };
    } catch {
      return { data: [], total: 0 };
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
