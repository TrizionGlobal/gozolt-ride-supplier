'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Download,
  Euro,
  ShoppingBag,
  Printer,
  FileSpreadsheet,
  FileText,
  Truck,
  Flame,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export type DateRangeKey = 'today' | '7d' | '30d' | '90d' | 'ytd';

export default function GroceryAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [revenueView, setRevenueView] = useState<'day' | 'week' | 'month'>('week');
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Financial Data Model (15% Platform Commission, No VAT, No Promo Deductions)
  const financialTotals = {
    grossSales: 42850.0,
    platformCommissionRate: 0.15, // 15%
    platformCommission: 6427.5,
    netStorePayout: 36422.5,
    totalOrders: 1296,
    completedOrders: 1280,
    cancelledOrders: 16,
    cancellationRate: '1.2%',
    averageBasketValue: 33.06,
    avgPickingTimeMins: 13.8,
  };

  // Department / Aisle Breakdown
  const departmentBreakdown = [
    { name: 'Fresh Fruits & Vegetables', revenue: 14140.0, sharePct: 33.0, orders: 490, popularItem: 'Hass Avocados (4pk)' },
    { name: 'Dairy, Eggs & Fresh Cheeses', revenue: 11140.0, sharePct: 26.0, orders: 410, popularItem: 'Organic Whole Milk 1L' },
    { name: 'Pantry, Pasta & Oils', revenue: 7280.0, sharePct: 17.0, orders: 240, popularItem: 'Cold-Pressed Olive Oil' },
    { name: 'Artisan Bakery', revenue: 4710.0, sharePct: 11.0, orders: 195, popularItem: 'Country Sourdough Loaf' },
    { name: 'Beverages & Waters', revenue: 3430.0, sharePct: 8.0, orders: 115, popularItem: 'Mineral Water (6x1L)' },
    { name: 'Snacks & Nuts', revenue: 2150.0, sharePct: 5.0, orders: 85, popularItem: 'Roasted Almonds 200g' },
  ];

  // Best Selling Grocery Items
  const bestSellingItems = [
    {
      rank: 1,
      name: 'Fresh Organic Whole Milk 1L',
      aisle: 'Dairy & Eggs',
      unitsSold: 580,
      grossRevenue: 1073.0,
      price: 1.85,
      marginPct: 38,
      trend: '+19%',
    },
    {
      rank: 2,
      name: 'Hass Avocados (Pack of 4)',
      aisle: 'Fresh Produce',
      unitsSold: 420,
      grossRevenue: 1638.0,
      price: 3.90,
      marginPct: 44,
      trend: '+24%',
    },
    {
      rank: 3,
      name: 'Artisan Country Sourdough Loaf',
      aisle: 'Bakery',
      unitsSold: 395,
      grossRevenue: 1086.25,
      price: 2.75,
      marginPct: 52,
      trend: '+14%',
    },
    {
      rank: 4,
      name: 'Free-Range Organic Eggs (10pk)',
      aisle: 'Dairy & Eggs',
      unitsSold: 360,
      grossRevenue: 1224.0,
      price: 3.40,
      marginPct: 40,
      trend: '+12%',
    },
    {
      rank: 5,
      name: 'Cold-Pressed Extra Virgin Olive Oil',
      aisle: 'Pantry & Oils',
      unitsSold: 210,
      grossRevenue: 2058.0,
      price: 9.80,
      marginPct: 48,
      trend: '+8%',
    },
  ];

  // Least Selling Items
  const leastSellingItems = [
    {
      name: 'Artisan Fig & Walnut Jam 320g',
      aisle: 'Pantry',
      unitsSold: 12,
      grossRevenue: 46.80,
      recommendation: 'Feature in weekend breakfast collections',
    },
    {
      name: 'Gluten-Free Buckwheat Crispbread',
      aisle: 'Bakery',
      unitsSold: 16,
      grossRevenue: 52.80,
      recommendation: 'Tag in specialty health dietary filters',
    },
    {
      name: 'Sparkling Lemon Verbena Infusion',
      aisle: 'Beverages',
      unitsSold: 19,
      grossRevenue: 47.50,
      recommendation: 'Bundle with fresh citrus promo baskets',
    },
  ];

  // Revenue chart data over week
  const revenueChartData = [
    { label: 'Mon', revenue: 5120, orders: 154 },
    { label: 'Tue', revenue: 5460, orders: 165 },
    { label: 'Wed', revenue: 5890, orders: 178 },
    { label: 'Thu', revenue: 6240, orders: 189 },
    { label: 'Fri', revenue: 7380, orders: 224 },
    { label: 'Sat', revenue: 8150, orders: 246 },
    { label: 'Sun', revenue: 4610, orders: 140 },
  ];

  const maxRevenue = Math.max(...revenueChartData.map((d) => d.revenue));

  // CSV Export
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Amount\n' +
      `Gross Supermarket Sales,€${financialTotals.grossSales.toFixed(2)}\n` +
      `Platform Fee (15%),-€${financialTotals.platformCommission.toFixed(2)}\n` +
      `Net Supermarket Payout,€${financialTotals.netStorePayout.toFixed(2)}\n` +
      `Orders Completed,${financialTotals.completedOrders}\n` +
      `Average Basket Value,€${financialTotals.averageBasketValue.toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grocery-analytics-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics CSV Exported');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-[#FCD223]">Reports & Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Reports & Analytics
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              Audited & Reconciled
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Comprehensive supermarket sales turnover, department velocity, order volume, and net bank payouts.
          </p>
        </div>

        {/* Date Filters & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm">
            {(['today', '7d', '30d', '90d', 'ytd'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition-all',
                  dateRange === r
                    ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
            CSV
          </Button>

          <Button
            onClick={() => setIsPdfModalOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
            PDF
          </Button>

          <Button
            onClick={() => window.print()}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-md"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: AUDITED FINANCIAL ACCOUNTING (4 CLEAN CARDS)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-[#FCD223]" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Audited Financial Accounting (Gross vs Net)
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Transparent breakdown of customer basket totals, 15% platform commission, and net bank payout.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            Reconciled
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Total Gross Sales */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#18181B] space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Total Gross Sales
            </p>
            <p className="text-2xl font-black text-white">
              €{financialTotals.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#71717A]">Customer checkout basket value</p>
          </div>

          {/* Orders Fulfilled */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#18181B] space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Orders Fulfilled
            </p>
            <p className="text-2xl font-black text-white">
              {financialTotals.completedOrders.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">98.8% fulfillment success rate</p>
          </div>

          {/* Platform Fee (15%) */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#18181B] space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Platform Fee (15%)
            </p>
            <p className="text-2xl font-black text-blue-400">
              -€{financialTotals.platformCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#71717A]">Gozolt automated dispatch & service</p>
          </div>

          {/* Net Payout to Bank */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Net Payout to Bank
            </p>
            <p className="text-2xl font-black text-emerald-400">
              €{financialTotals.netStorePayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-300 font-medium">Available for SEPA transfer</p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: SALES TURNOVER OVER TIME (CHART)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#FCD223]" />
              Supermarket Sales Performance
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Daily revenue velocity and checkout basket volumes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> +16.4% vs prev period
            </span>
            <div className="flex items-center rounded-xl border border-white/10 bg-[#18181B] p-1 text-xs">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setRevenueView(v)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg uppercase font-bold transition-all',
                    revenueView === v ? 'bg-[#FCD223] text-black' : 'text-[#A1A1AA] hover:text-white'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-3 items-end h-48 border-b border-white/10 pb-2">
            {revenueChartData.map((d, index) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100);
              const isHovered = hoveredRevenueIndex === index;

              return (
                <div
                  key={d.label}
                  onMouseEnter={() => setHoveredRevenueIndex(index)}
                  onMouseLeave={() => setHoveredRevenueIndex(null)}
                  className="group relative flex flex-col items-center justify-end h-full cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-14 z-20 whitespace-nowrap rounded-lg bg-[#27272A] border border-white/20 px-2.5 py-1 text-[11px] shadow-xl text-center">
                      <p className="font-bold text-[#FCD223]">€{d.revenue.toLocaleString()}</p>
                      <p className="text-white/80">{d.orders} baskets</p>
                    </div>
                  )}

                  <div className="w-full max-w-[40px] bg-white/5 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        'w-full transition-all duration-300 rounded-t-md',
                        isHovered
                          ? 'bg-[#FCD223] shadow-[0_0_15px_rgba(252,210,35,0.5)]'
                          : 'bg-gradient-to-t from-[#FCD223]/60 to-[#FCD223]'
                      )}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#A1A1AA] mt-2 group-hover:text-white transition-colors">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: PEAK SHOPPING TIMINGS & DEPARTMENT SHARE
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Ordering Timings */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FCD223]" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Peak Grocery Shopping Timings
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Customer checkout volume concentration on mobile app
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#18181B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Evening Dinner Prep Surge</span>
                <span className="text-xs font-mono font-bold text-[#FCD223]">17:30 – 20:00</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div style={{ width: '46%' }} className="h-full bg-[#FCD223] rounded-full" />
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                46% of all daily supermarket orders. Fresh produce, meats, pasta and wine.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-[#18181B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Morning Breakfast & Pantry Restock</span>
                <span className="text-xs font-mono font-bold text-[#FCD223]">08:30 – 10:30</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div style={{ width: '38%' }} className="h-full bg-emerald-400 rounded-full" />
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                38% of daily orders. Fresh milk, farm eggs, artisan sourdough, and citrus juice.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-white/5 bg-[#18181B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Midday Quick Top-Up</span>
                <span className="text-xs font-mono font-bold text-[#FCD223]">12:00 – 14:00</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div style={{ width: '16%' }} className="h-full bg-blue-400 rounded-full" />
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                16% of daily orders. Salads, beverages, snacks, and quick work pantry essentials.
              </p>
            </div>
          </div>
        </div>

        {/* Revenue by Department / Aisle */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#FCD223]" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Revenue by Department & Aisle
                </h3>
                <p className="text-xs text-[#A1A1AA]">Category share of customer checkout volume</p>
              </div>
            </div>
            <span className="text-xs font-bold text-white/60">6 Departments</span>
          </div>

          <div className="space-y-3 pt-2">
            {departmentBreakdown.map((dept) => (
              <div key={dept.name} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{dept.name}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    €{dept.revenue.toLocaleString()} ({dept.sharePct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${dept.sharePct}%` }}
                    className="h-full bg-[#FCD223] rounded-full"
                  />
                </div>
                <p className="text-[11px] text-[#71717A]">
                  Top seller: <strong className="text-white/80">{dept.popularItem}</strong> • {dept.orders} orders
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: BEST VS LEAST SELLERS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Items (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#FCD223]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Top Velocity Grocery Essentials
              </h3>
            </div>
            <Link href="/grocery-stores/products" className="text-xs font-bold text-[#FCD223] hover:underline">
              Catalogue & Stock
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#A1A1AA] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Aisle</th>
                  <th className="pb-3 text-right">Units Sold</th>
                  <th className="pb-3 text-right">Gross Sales</th>
                  <th className="pb-3 text-right pr-2">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bestSellingItems.map((item) => (
                  <tr key={item.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2 font-bold text-white/60">#{item.rank}</td>
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-[#A1A1AA]">{item.aisle}</td>
                    <td className="py-3 text-right font-bold text-white">{item.unitsSold}</td>
                    <td className="py-3 text-right font-bold text-emerald-400">€{item.grossRevenue.toFixed(2)}</td>
                    <td className="py-3 text-right pr-2 font-bold text-emerald-400">{item.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Least Selling Items (1 Col) */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Low Velocity Items
            </h3>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Products with low shelf turnover this period. Action recommended.
          </p>

          <div className="space-y-3 pt-1">
            {leastSellingItems.map((item) => (
              <div key={item.name} className="p-3 rounded-xl border border-white/5 bg-[#18181B] space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <span className="text-[11px] font-mono text-white/70 shrink-0">
                    {item.unitsSold} sold
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A]">{item.aisle} • €{item.grossRevenue.toFixed(2)}</p>
                <p className="text-[11px] text-[#FCD223] pt-1 flex items-center gap-1">
                  <span>→</span> {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: PDF EXPORT SUMMARY
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FCD223]" />
              Supermarket Statement (PDF)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Generate official audited monthly settlement statement for accounting and tax reporting.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/5 space-y-2">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Reporting Window</span>
                <span className="text-white font-bold uppercase">{dateRange}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Gross Customer Checkout</span>
                <span className="text-white font-bold">€{financialTotals.grossSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Gozolt Commission (15%)</span>
                <span className="text-blue-400 font-bold">-€{financialTotals.platformCommission.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-white">
                <span>Net Bank Payout</span>
                <span className="text-emerald-400">€{financialTotals.netStorePayout.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPdfModalOpen(false)}
              className="rounded-xl border-white/10 text-[#A1A1AA] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsPdfModalOpen(false);
                toast.success('PDF Statement Generated', {
                  description: 'Document ready for bookkeeping and SEPA reconciliation.',
                });
              }}
              className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
            >
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
