'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { financialService } from '@/services/financials/financial.service';
import { PerDriverEarningsTable } from '@/components/financials/per-driver-earnings-table';
import { SettlementKPICards } from '@/components/financials/settlement-kpi-cards';
import { DriverPayoutHistoryTable, type DriverPayoutLog } from '@/components/financials/driver-payout-history-table';
import { Users, History } from 'lucide-react';
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import type { PerDriverEarning } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';

const { RangePicker } = DatePicker;

const periodOptions = [
  'Today',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Custom Range',
];

type ActiveTab = 'settlements' | 'history';

export default function DriverSettlementsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('settlements');
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('Today');
  const [kpis, setKpis] = useState({ totalOwed: 0, totalCash: 0, totalCard: 0, totalPaid: 0 });
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      let fromDate: Date | undefined;
      const today = new Date();
      if (period === 'Today') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } else if (period === 'This Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (period === 'Last Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      } else if (period === 'Last 3 Months') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      } else if (period === 'Custom Range') {
        if (customFrom) fromDate = new Date(customFrom);
      }
      
      let toDate: Date | undefined;
      if (period === 'Today') {
        toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      } else if (period === 'Last Month') {
        toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      } else if (period === 'Custom Range') {
        if (customTo) {
          toDate = new Date(customTo);
          toDate.setHours(23, 59, 59, 999);
        }
      }

      const fromStr = fromDate ? fromDate.toISOString() : undefined;
      const toStr = toDate ? toDate.toISOString() : undefined;

      const kpiData = await financialService.getDriverSettlementsKpis(fromStr, toStr);
      setKpis(kpiData);
    } catch {
      // handled in services
    } finally {
      setIsLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    // Only load if not Custom Range, or if Custom Range has both dates selected
    if (period !== 'Custom Range' || (customFrom && customTo)) {
      loadAll();
    }
  }, [loadAll, period, customFrom, customTo]);

  useFleetTracking({ onRefresh: loadAll });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver Settlements</h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Manage your drivers' earnings, view cash & card transactions, and settle payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center rounded-md border border-[#3F3F46] bg-[#1A1A1A] p-2 text-[#A1A1AA] hover:text-white transition-colors">
            <Calendar className="h-4 w-4" />
          </button>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-md border border-[#3F3F46] bg-[#1A1A1A] pl-3 pr-8 py-2 text-sm text-white focus:border-[#FACC15] focus:outline-none"
            >
              {periodOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
          </div>
          
          {period === 'Custom Range' && (
            <div className="flex items-center ml-2">
              <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                <RangePicker
                  value={[customFrom ? dayjs(customFrom) : null, customTo ? dayjs(customTo) : null]}
                  onChange={(dates) => {
                    if (dates) {
                      setCustomFrom(dates[0] ? dates[0].format('YYYY-MM-DD') : '');
                      setCustomTo(dates[1] ? dates[1].format('YYYY-MM-DD') : '');
                    } else {
                      setCustomFrom('');
                      setCustomTo('');
                    }
                  }}
                  className="rounded-md border border-[#3F3F46] bg-[#1A1A1A] px-3 py-2 text-sm focus:border-[#FACC15] hover:border-[#FACC15]"
                />
              </ConfigProvider>
            </div>
          )}
        </div>
      </div>

      <SettlementKPICards data={kpis} isLoading={isLoading} />

      {/* Tabs */}
      <div className="flex border-b border-[#27272A] gap-4">
        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === 'settlements'
              ? 'border-[#FACC15] text-[#FACC15]'
              : 'border-transparent text-[#A1A1AA] hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Driver Settlements
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === 'history'
              ? 'border-[#FACC15] text-[#FACC15]'
              : 'border-transparent text-[#A1A1AA] hover:text-white'
          }`}
        >
          <History className="h-4 w-4" />
          Payout History
        </button>
      </div>

      {activeTab === 'settlements' && (
        <PerDriverEarningsTable />
      )}

      {activeTab === 'history' && (
        <DriverPayoutHistoryTable />
      )}
    </div>
  );
}
