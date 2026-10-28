'use client';

import { apiClient } from '@/lib/api-client';
import type { FinancialKPIs, PerDriverEarning, PayoutRecord, RevenueTrendPoint, PayoutSettings } from '@/types';


export const financialService = {
  async getFinancialKPIs(from?: string, to?: string, module?: string): Promise<FinancialKPIs> {
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (module) params.module = module;

      const [analyticsRes, profileRes, payoutsRes] = await Promise.all([
        apiClient.get('/suppliers/analytics', { params }),
        apiClient.get('/suppliers/me'),
        apiClient.get('/suppliers/payouts', { params: { page: 1, limit: 100, module } }),
      ]);

      const analytics = analyticsRes.data;
      const profile = profileRes.data;
      const payouts = payoutsRes.data.data || payoutsRes.data;

      let bd = analytics.breakdown || {};
      let grossRevenue = 0;
      let commissionAmount = 0;
      let netRevenue = 0;
      let totalRefunds = 0;
      let totalCancellations = 0;

      if (module === 'AIRPORT_TRANSFER') {
        const atRes = await apiClient.get('/airport-transfers/supplier/dashboard');
        const at = atRes.data;
        const completedAmount = Number(at.completedRevenue ?? at.totalRevenue ?? 0);
        grossRevenue = Number(at.totalGrossVolume ?? completedAmount);
        commissionAmount = 0; // 0% commission for airport transfers
        netRevenue = completedAmount; // gained amount after ride completed which are fixed
        totalRefunds = Number(at.totalCancelledRefunded || 0);
        totalCancellations = totalRefunds;
        bd = { airportTransfer: at };
      } else {
        if (module === 'CAB') {
          bd = { cab: bd.cab };
        } else if (module === 'RENTAL') {
          bd = { carRental: bd.carRental };
        } else if (module === 'BIKE_RENTAL') {
          bd = { bikeRental: bd.bikeRental };
        } else if (module === 'QUICK_SERVICES') {
          bd = { quickServices: bd.quickServices };
        }

        grossRevenue = (bd.cab?.totalEarned || 0) + (bd.carRental?.totalEarned || 0) + (bd.bikeRental?.totalEarned || 0) + (bd.quickServices?.totalEarned || 0);
        commissionAmount = (bd.cab?.totalEarned || 0) - (bd.cab?.netAmount || 0);
        netRevenue = grossRevenue - commissionAmount;
        totalRefunds = (bd.cab?.refunds || 0) + (bd.carRental?.refunds || 0) + (bd.bikeRental?.refunds || 0) + (bd.quickServices?.refunds || 0);
        totalCancellations = (bd.cab?.cancellations || 0) + (bd.carRental?.cancellations || 0) + (bd.bikeRental?.cancellations || 0) + (bd.quickServices?.cancellations || 0);
      }
      
      const commissionRate = module === 'AIRPORT_TRANSFER' ? 0 : (profile.defaultDriverCommission || 0);
      
      const settledPayout = payouts
        .filter((p: PayoutRecord) => (p.status as string) === 'PAID' || p.status === 'COMPLETED')
        .reduce((sum: number, p: PayoutRecord) => sum + Number(p.amount), 0);

      const pendingPayout = module === 'AIRPORT_TRANSFER'
        ? Number(bd.airportTransfer?.pendingActiveRevenue ?? 0)
        : payouts
            .filter((p: PayoutRecord) => p.status === 'PENDING')
            .reduce((sum: number, p: PayoutRecord) => sum + Number(p.amount), 0);

      const tipEarnings = analytics.tipEarnings || 0;
      const adminPendingAmount = module === 'AIRPORT_TRANSFER'
        ? Math.max(0, netRevenue - settledPayout)
        : undefined;

      return { 
        grossRevenue, 
        commissionRate, 
        commissionAmount, 
        netRevenue, 
        pendingPayout, 
        settledPayout,
        adminPendingAmount,
        totalRefunds,
        totalCancellations,
        tipEarnings,
        breakdown: bd,
        activeModules: {
          cab: profile.isCabActive ?? false,
          carRental: profile.isCarRentalActive ?? false,
          bikeRental: profile.isBikeRentalActive ?? false,
        }
      };
    } catch {
      return { 
        grossRevenue: 0, 
        commissionRate: 15, 
        commissionAmount: 0, 
        netRevenue: 0, 
        pendingPayout: 0, 
        settledPayout: 0,
        totalRefunds: 0,
        totalCancellations: 0,
        tipEarnings: 0 
      };
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
        month: new Date(d.periodStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
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

  async getPayoutHistory(module?: string, page = 1, limit = 10): Promise<{ data: PayoutRecord[], meta: { total: number } }> {    try {
      const res = await apiClient.get('/suppliers/payouts', {
        params: { page, limit, sortBy: 'createdAt', order: 'desc', module },
      });
      const payouts = res.data.data || res.data;
      const total = res.data.meta?.total || payouts.length;
      return {
        data: payouts.map((p: PayoutRecord) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          processedAt: p.processedAt,
          createdAt: p.createdAt,
          details: p.details,
        })),
        meta: { total }
      };
    } catch {
      return { data: [], meta: { total: 0 } };
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

  async payDriver(driverId: string, amount: number, deductions?: number, totalRides?: number, totalFare?: number, notes?: string): Promise<void> {
    try {
      await apiClient.post(`/suppliers/payouts/driver/${driverId}`, { amount, deductions, totalRides, totalFare, notes });
    } catch (error: any) {
      throw error;
    }
  },

  async settleDriverDebt(driverId: string, amount: number, notes?: string): Promise<void> {
    try {
      await apiClient.post(`/suppliers/payouts/settle-debt/${driverId}`, { amount, notes });
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
