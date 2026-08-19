'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const periodOptions = [
  'All Time',
  'Today',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Custom Range',
];

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  
  const [period, setPeriod] = useState('All Time');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const fetchEarnings = useCallback(async () => {
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

      const params: any = { page, limit };
      if (fromDate) params.startDate = fromDate.toISOString();
      if (toDate) params.endDate = toDate.toISOString();
      
      const res = await apiClient.get('/supplier-earnings', { params });
      setEarnings(res.data.items || []);
      setSummary(res.data.summary);
      setTotal(res.data.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, period, customFrom, customTo]);

  useEffect(() => {
    if (period !== 'Custom Range' || (customFrom && customTo)) {
      fetchEarnings();
    }
  }, [fetchEarnings, period, customFrom, customTo]);

  const columns: ColumnDef<any>[] = [
    {
      key: 'bookingId',
      title: 'Booking ID',
      dataIndex: 'bookingId',
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.bookingId.split('-')[0].toUpperCase()}</span>
    },
    {
      key: 'vehicle',
      title: 'Vehicle',
      dataIndex: 'vehicleName',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.vehicleName}</span>
          <span className="text-xs text-gray-400">{row.vehicleNumberPlate}</span>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Rental Amount',
      dataIndex: 'rentalAmount',
      render: (row) => <span className="text-white">€{row.rentalAmount.toFixed(2)}</span>
    },
    {
      key: 'commission',
      title: 'Commission',
      dataIndex: 'platformCommission',
      render: (row) => <span className="text-red-400">-€{row.platformCommission.toFixed(2)}</span>
    },
    {
      key: 'penalty',
      title: 'Damage Penalty',
      dataIndex: 'deductions',
      render: (row) => <span className="text-red-400">-€{row.deductions.toFixed(2)}</span>
    },
    {
      key: 'net',
      title: 'Net Earnings',
      dataIndex: 'netEarnings',
      render: (row) => <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">€{row.netEarnings.toFixed(2)}</span>
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-[#27272A] text-gray-300">
          {row.status}
        </span>
      )
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'earningDate',
      render: (row) => <span className="text-gray-400 text-sm">{format(new Date(row.earningDate), 'MMM dd, yyyy')}</span>
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Earnings</h1>
          <p className="text-gray-400">Track your completed rental earnings and commissions.</p>
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

      {isLoading && !summary ? (
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-[#27272A] p-6 rounded-xl animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-4" />
              <div className="h-8 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#111111] border border-[#27272A] p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Today's Earnings</h3>
            <p className="text-2xl font-bold text-white">€{summary.todayEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-[#111111] border border-[#27272A] p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">This Week</h3>
            <p className="text-2xl font-bold text-white">€{summary.weekEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-[#111111] border border-[#27272A] p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-2">This Month</h3>
            <p className="text-2xl font-bold text-white">€{summary.monthEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-[#111111] border border-[#FACC15]/20 p-6 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <h3 className="text-[#FACC15] text-sm font-medium mb-2">Total Earnings</h3>
            <p className="text-2xl font-bold text-[#FACC15]">€{summary.totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
        <ServerSideTable
          columns={columns}
          data={earnings}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyText="No earnings found for this period."
        />
      </div>
    </div>
  );
}
