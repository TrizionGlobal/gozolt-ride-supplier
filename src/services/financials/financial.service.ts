'use client';

import { apiClient } from '@/lib/api-client';
import type { FinancialKPIs, PerDriverEarning, PayoutRecord, RevenueTrendPoint } from '@/types';


export const financialService = {
  async getFinancialKPIs(from?: string, to?: string): Promise<FinancialKPIs> {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [analyticsRes, profileRes, payoutsRes] = await Promise.all([
        apiClient.get('/suppliers/analytics', { params }),
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

  async getRevenueTrend(from?: string, to?: string): Promise<RevenueTrendPoint[]> {
    try {
      const params: any = { range: 'month', period: 'daily' };
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await apiClient.get('/suppliers/analytics/revenue-trend', { params });
      return res.data.map((d: any) => ({
        month: new Date(d.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: d.revenue
      }));
    } catch {
      return [];
    }
  },

  async getPerDriverEarnings(from?: string, to?: string): Promise<PerDriverEarning[]> {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await apiClient.get('/suppliers/analytics/driver-earnings', { params });
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

  async connectStripeAccount(): Promise<{ message: string; stripeAccountId: string }> {
    try {
      const res = await apiClient.post('/suppliers/payouts/connect');
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  async payDriver(driverId: string, amount: number, deductions?: number, notes?: string): Promise<void> {
    try {
      await apiClient.post(`/suppliers/payouts/driver/${driverId}`, { amount, deductions, notes });
    } catch (error: any) {
      throw error;
    }
  }
};
