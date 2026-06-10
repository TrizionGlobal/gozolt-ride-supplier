'use client';

import { apiClient } from '@/lib/api-client';
import type { FinancialKPIs, PerDriverEarning, PayoutRecord, RevenueTrendPoint } from '@/types';


export const financialService = {
  async getFinancialKPIs(): Promise<FinancialKPIs> {    try {
      const [analyticsRes, profileRes, payoutsRes] = await Promise.all([
        apiClient.get('/suppliers/analytics'),
        apiClient.get('/suppliers/me'),
        apiClient.get('/suppliers/payouts', { params: { page: 1, limit: 100 } }),
      ]);

      const analytics = analyticsRes.data;
      const profile = profileRes.data;
      const payouts = payoutsRes.data.data || payoutsRes.data;

      const grossRevenue = analytics.totalRevenue || 0;
      const commissionRate = profile.commissionRate || 15;
      const commissionAmount = grossRevenue * (commissionRate / 100);
      const netRevenue = grossRevenue - commissionAmount;
      const pendingPayout = payouts
        .filter((p: PayoutRecord) => p.status === 'PENDING')
        .reduce((sum: number, p: PayoutRecord) => sum + p.amount, 0);

      const tipEarnings = analytics.tipEarnings || 0;
      return { grossRevenue, commissionRate, commissionAmount, netRevenue, pendingPayout, tipEarnings };
    } catch {
      return { grossRevenue: 0, commissionRate: 15, commissionAmount: 0, netRevenue: 0, pendingPayout: 0, tipEarnings: 0 };
    }
  },

  async getRevenueTrend(): Promise<RevenueTrendPoint[]> {
    try {
      const res = await apiClient.get('/suppliers/analytics/revenue-trend', { params: { range: 'month' } });
      return res.data;
    } catch {
      return [];
    }
  },

  async getPerDriverEarnings(): Promise<PerDriverEarning[]> {
    try {
      const res = await apiClient.get('/suppliers/analytics/driver-earnings');
      return res.data;
    } catch {
      return [];
    }
  },

  async getPayoutHistory(): Promise<PayoutRecord[]> {    try {
      const res = await apiClient.get('/suppliers/payouts', {
        params: { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' },
      });
      const payouts = res.data.data || res.data;
      return payouts.map((p: PayoutRecord) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        processedAt: p.processedAt,
        createdAt: p.createdAt,
      }));
    } catch {
      return [];
    }
  },

  async downloadStatementPDF(): Promise<void> {
    // Mock — actual implementation would fetch PDF from backend
    // GET /invoices/statements/supplier/:supplierId → get latest statement
    // GET /invoices/statements/:statementId/pdf → get PDF
  },
};
