'use client';

import { apiClient } from '@/lib/api-client';
import type { FinancialKPIs, PerDriverEarning, PayoutRecord, RevenueTrendPoint } from '@/types';
import {
  mockFinancialKPIs,
  mockRevenueTrend,
  mockPerDriverEarnings,
  mockPayoutHistory,
} from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export const financialService = {
  async getFinancialKPIs(): Promise<FinancialKPIs> {
    if (isDevBypassed()) return mockFinancialKPIs;

    try {
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
      return mockFinancialKPIs;
    }
  },

  async getRevenueTrend(): Promise<RevenueTrendPoint[]> {
    // No backend endpoint yet — always return mock data
    return mockRevenueTrend;
  },

  async getPerDriverEarnings(): Promise<PerDriverEarning[]> {
    // No backend endpoint yet — always return mock data
    return mockPerDriverEarnings;
  },

  async getPayoutHistory(): Promise<PayoutRecord[]> {
    if (isDevBypassed()) return mockPayoutHistory;

    try {
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
      return mockPayoutHistory;
    }
  },

  async downloadStatementPDF(): Promise<void> {
    // Mock — actual implementation would fetch PDF from backend
    // GET /invoices/statements/supplier/:supplierId → get latest statement
    // GET /invoices/statements/:statementId/pdf → get PDF
  },
};
