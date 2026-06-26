'use client';

import { apiClient } from '@/lib/api-client';
import type { FinancialKPIs, PerDriverEarning, PayoutRecord, RevenueTrendPoint, PayoutSettings } from '@/types';


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
      const commissionRate = profile.defaultDriverCommission || 0;
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
      let period = 'daily';
      if (from) {
        const startDate = new Date(from);
        const endDate = to ? new Date(to) : new Date();
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 180) {
          period = 'monthly';
        } else if (diffDays > 35) {
          period = 'weekly';
        }
      }

      const params: any = { range: 'month', period };
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

  async getPerDriverEarnings(from?: string, to?: string, page = 1, limit = 20, search?: string): Promise<any> {
    try {
      const params: any = { page, limit };
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;

      const res = await apiClient.get('/suppliers/analytics/driver-earnings', { params });
      return res.data;
    } catch {
      return { data: [], total: 0 };
    }
  },

  async getDriverSettlementsKpis(from?: string, to?: string): Promise<{ totalOwed: number, totalCash: number, totalCard: number, totalPaid: number }> {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await apiClient.get('/suppliers/analytics/driver-earnings-kpis', { params });
      return res.data;
    } catch {
      return { totalOwed: 0, totalCash: 0, totalCard: 0, totalPaid: 0 };
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

  async getDriverPayoutLogs(page = 1, limit = 20, search?: string): Promise<any> {
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      
      const res = await apiClient.get('/suppliers/payouts/driver-logs', {
        params,
      });
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
  },

  async getPayoutSettings(): Promise<PayoutSettings> {
    try {
      const res = await apiClient.get('/suppliers/payouts/settings');
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  async updatePayoutSettings(schedule: string): Promise<void> {
    try {
      await apiClient.put('/suppliers/payouts/settings', { schedule });
    } catch (error: any) {
      throw error;
    }
  }
};
