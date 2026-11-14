'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Download,
  Filter,
  DollarSign,
  ShoppingBag,
  Percent,
  XCircle,
  Layers,
  ChefHat,
  ChevronDown,
  Utensils,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileSpreadsheet,
  FileText,
  Building2,
  PieChart,
  Truck,
  Timer,
  AlertTriangle,
  Flame,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// ── Types ───────────────────────────────────────────────────────────────────

export type DateRangeKey = 'today' | '7d' | '30d' | '90d' | 'ytd';

export default function RestaurantAnalyticsPage() {
  // Screen 44: Filters & Range Selection
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [revenueView, setRevenueView] = useState<'day' | 'week' | 'month'>('week');
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // ── Financial Data Model (Accurate Gross vs Net Calculations) ──
  const financialTotals = {
    grossSales: 38620.0,
    subsidizedPromos: 1420.0,
    netBilledToCustomers: 37200.0,
    platformCommissionRate: 0.15, // 15%
    platformCommission: 5580.0,
    vatOnCommission: 1004.4, // 18% VAT on service fee
    netRestaurantPayout: 30615.6,
    totalOrders: 1482,
    completedOrders: 1460,
    cancelledOrders: 22,
    cancellationRate: '1.5%',
    averageOrderValue: 26.06,
    avgPrepTimeMins: 15.2,
    avgAcceptanceSeconds: 42,
    delayedOrdersCount: 18,
    delayedOrdersRate: '1.2%',
  };

  // Fulfillment Breakdown (Delivery vs Pickup)
  const fulfillmentBreakdown = [
    {
      id: 'delivery',
      name: 'Gozolt Platform Delivery',
      channel: 'Orders dispatched via Gozolt Fleet',
      grossRevenue: 31240.0,
      netPayout: 24748.2,
      orders: 1180,
      aov: 26.47,
      completedRate: 98.6,
      avgPrepTime: '15.0 min',
      sharePct: 80.9,
    },
    {
      id: 'pickup',
      name: 'Direct Store Pickup',
      channel: 'Customer self-collection / takeaway',
      grossRevenue: 7380.0,
      netPayout: 5867.4,
      orders: 302,
      aov: 24.44,
      completedRate: 99.3,
      avgPrepTime: '12.4 min',
      sharePct: 19.1,
    },
  ];

  // Category Breakdown
  const categoryBreakdown = [
    { name: 'Pizza', revenue: 14820.0, sharePct: 38.4, orders: 580, popularItem: 'Diavola' },
    { name: 'Pasta', revenue: 10240.0, sharePct: 26.5, orders: 395, popularItem: 'Truffle Tagliolini' },
    { name: 'Main Course', revenue: 5460.0, sharePct: 14.1, orders: 198, popularItem: 'Sea Bass' },
    { name: 'Starters', revenue: 3820.0, sharePct: 9.9, orders: 165, popularItem: 'Burrata Pugliese' },
    { name: 'Desserts', revenue: 2480.0, sharePct: 6.4, orders: 94, popularItem: 'Espresso Tiramisu' },
    { name: 'Beverages', revenue: 1800.0, sharePct: 4.7, orders: 50, popularItem: 'San Pellegrino' },
  ];

  // Best Selling Items
  const bestSellingItems = [
    {
      rank: 1,
      name: 'Woodfired Pizza Diavola',
      category: 'Pizza',
      unitsSold: 312,
      grossRevenue: 4680.0,
      price: 15.0,
      marginPct: 74,
      trend: '+18%',
    },
    {
      rank: 2,
      name: 'Truffle Mushroom Tagliolini',
      category: 'Pasta',
      unitsSold: 284,
      grossRevenue: 5396.0,
      price: 19.0,
      marginPct: 68,
      trend: '+12%',
    },
    {
      rank: 3,
      name: 'Classic Espresso Tiramisu',
      category: 'Desserts',
      unitsSold: 226,
      grossRevenue: 1582.0,
      price: 7.0,
      marginPct: 82,
      trend: '+24%',
    },
    {
      rank: 4,
      name: 'Burrata Pugliese & San Daniele',
      category: 'Starters',
      unitsSold: 210,
      grossRevenue: 3045.0,
      price: 14.5,
      marginPct: 64,
      trend: '+8%',
    },
    {
      rank: 5,
      name: 'Margherita D.O.P.',
      category: 'Pizza',
      unitsSold: 198,
      grossRevenue: 2574.0,
      price: 13.0,
      marginPct: 78,
      trend: '+5%',
    },
  ];

  // Least Selling Items
  const leastSellingItems = [
    {
      rank: 1,
      name: 'Seafood Calzone Special',
      category: 'Pizza',
      unitsSold: 14,
      grossRevenue: 266.0,
      price: 19.0,
      marginPct: 52,
      action: 'Consider redesigning or seasonal removal',
    },
    {
      rank: 2,
      name: 'Gluten-Free Penne Arrabbiata',
      category: 'Pasta',
      unitsSold: 18,
      grossRevenue: 270.0,
      price: 15.0,
      marginPct: 58,
      action: 'Promote in healthy & special collections',
    },
    {
      rank: 3,
      name: 'Vegan Lemon Cheesecake',
      category: 'Desserts',
      unitsSold: 21,
      grossRevenue: 168.0,
      price: 8.0,
      marginPct: 60,
      action: 'Bundle with lunch specials',
    },
  ];

  // Peak Ordering Times (Hourly breakdown)
  const peakHours = [
    { hour: '11:00', orders: 18, label: 'Early Lunch', intensity: 'low' },
    { hour: '12:00', orders: 54, label: 'Lunch Rush Start', intensity: 'high' },
    { hour: '13:00', orders: 68, label: 'Peak Lunch Hour', intensity: 'peak' },
    { hour: '14:00', orders: 38, label: 'Late Lunch', intensity: 'medium' },
    { hour: '15:00', orders: 12, label: 'Afternoon Slump', intensity: 'low' },
    { hour: '16:00', orders: 10, label: 'Kitchen Prep', intensity: 'low' },
    { hour: '17:00', orders: 16, label: 'Early Takeout', intensity: 'low' },
    { hour: '18:00', orders: 42, label: 'Aperitivo Hour', intensity: 'medium' },
    { hour: '19:00', orders: 72, label: 'Dinner Wave #1', intensity: 'peak' },
    { hour: '20:00', orders: 84, label: 'Main Dinner Peak', intensity: 'peak' },
    { hour: '21:00', orders: 58, label: 'Late Evening Rush', intensity: 'high' },
    { hour: '22:00', orders: 24, label: 'Late Night Call', intensity: 'medium' },
  ];

  // Revenue Series for Visual Charts
  const revenueSeries = {
    day: [
      { label: '11:00', revenue: 380, orders: 18 },
      { label: '13:00', revenue: 1420, orders: 68 },
      { label: '15:00', revenue: 310, orders: 12 },
      { label: '17:00', revenue: 290, orders: 16 },
      { label: '19:00', revenue: 1680, orders: 72 },
      { label: '20:00', revenue: 1980, orders: 84 },
      { label: '21:00', revenue: 1120, orders: 58 },
      { label: '22:00', revenue: 420, orders: 24 },
    ],
    week: [
      { label: 'Mon', revenue: 4120, orders: 158 },
      { label: 'Tue', revenue: 4450, orders: 172 },
      { label: 'Wed', revenue: 4890, orders: 188 },
      { label: 'Thu', revenue: 5340, orders: 205 },
      { label: 'Fri', revenue: 6820, orders: 262 },
      { label: 'Sat', revenue: 7680, orders: 295 },
      { label: 'Sun', revenue: 5320, orders: 202 },
    ],
    month: [
      { label: 'Week 1', revenue: 8640, orders: 332 },
      { label: 'Week 2', revenue: 9480, orders: 364 },
      { label: 'Week 3', revenue: 9820, orders: 376 },
      { label: 'Week 4', revenue: 10680, orders: 410 },
    ],
  };

  const activeSeries = revenueSeries[revenueView];
  const maxRevenueVal = Math.max(...activeSeries.map((s) => s.revenue));

  // ── Screen 44: Action Handlers (CSV Export, PDF Export, Print) ──

  const handleExportCSV = () => {
    const csvRows = [
      ['Gozolt Restaurant Performance Report'],
      ['Date Range', dateRange.toUpperCase()],
      ['Generated At', new Date().toISOString()],
      [],
      ['FINANCIAL SUMMARY'],
      ['Gross Sales (EUR)', financialTotals.grossSales.toFixed(2)],
      ['Promotions Subsidized (EUR)', financialTotals.subsidizedPromos.toFixed(2)],
      ['Net Billed to Customers (EUR)', financialTotals.netBilledToCustomers.toFixed(2)],
      ['Platform Commission 15% (EUR)', financialTotals.platformCommission.toFixed(2)],
      ['VAT on Commission 18% (EUR)', financialTotals.vatOnCommission.toFixed(2)],
      ['Net Restaurant Payout (EUR)', financialTotals.netRestaurantPayout.toFixed(2)],
      [],
      ['OPERATIONAL METRICS'],
      ['Total Orders', financialTotals.totalOrders],
      ['Completed Orders', financialTotals.completedOrders],
      ['Cancelled Orders', financialTotals.cancelledOrders],
      ['Cancellation Rate', financialTotals.cancellationRate],
      ['Average Order Value (EUR)', financialTotals.averageOrderValue.toFixed(2)],
      ['Avg Preparation Time (mins)', financialTotals.avgPrepTimeMins],
      ['Avg Order Acceptance (sec)', financialTotals.avgAcceptanceSeconds],
      ['Delayed Orders (>30m)', financialTotals.delayedOrdersCount],
      [],
      ['TOP SELLING ITEMS'],
      ['Rank', 'Item Name', 'Category', 'Units Sold', 'Gross Revenue EUR', 'Food Margin %'],
      ...bestSellingItems.map((item) => [
        item.rank,
        item.name,
        item.category,
        item.unitsSold,
        item.grossRevenue.toFixed(2),
        `${item.marginPct}%`,
      ]),
      [],
      ['FULFILLMENT CHANNELS'],
      ['Channel Name', 'Gross Revenue EUR', 'Net Payout EUR', 'Orders', 'AOV EUR', 'Avg Prep Time'],
      ...fulfillmentBreakdown.map((f) => [
        f.name,
        f.grossRevenue.toFixed(2),
        f.netPayout.toFixed(2),
        f.orders,
        f.aov.toFixed(2),
        f.avgPrepTime,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `gozolt-reports-analytics-${dateRange}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Report Exported', {
      description: `Downloaded full financial spreadsheet for ${dateRange.toUpperCase()}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPdfModal = () => {
    setIsPdfModalOpen(true);
  };

  return (
    <div className="space-y-7 pb-24 w-full print:p-0 print:space-y-4">
      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 44 CONTROLS: HEADER, DATE RANGE, EXPORT ACTIONS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5 print:border-b-2 print:border-black">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FCD223]/10 p-2 text-[#FCD223] print:hidden">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl print:text-black">
              Reports &amp; Analytics
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl print:text-zinc-700">
            Comprehensive sales turnover, fulfillment distribution, product velocity, order volume, and operational kitchen SLAs.
          </p>
        </div>

        {/* Screen 44 Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#121214] p-1">
            {[
              { key: 'today', label: 'Today' },
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '90d', label: '90D' },
              { key: 'ytd', label: 'YTD' },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDateRange(d.key as DateRangeKey)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                  dateRange === d.key
                    ? 'bg-[#FCD223] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Screen 44 Export Actions: CSV, PDF, Print */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:text-white cursor-pointer"
              title="Export Full CSV Spreadsheet"
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              CSV
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenPdfModal}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:text-white cursor-pointer"
              title="Export Formal PDF Statement"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
              PDF
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10 cursor-pointer"
              title="Print Current Analytics Report"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 44 CORE: ACCURATE FINANCIAL CALCULATIONS (GROSS VS NET BREAKDOWN)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4 print:border-zinc-300">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#FCD223]" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Audited Financial Accounting (Gross vs Net)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Transparent breakdown of customer cart totals, platform commission, and net restaurant bank payout.
              </p>
            </div>
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
            Audited &amp; Reconciled
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Gross Sales
            </span>
            <p className="text-lg font-black text-white font-mono">
              €{financialTotals.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500">Customer checkout value</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Promo Discounts
            </span>
            <p className="text-lg font-black text-amber-400 font-mono">
              -€{financialTotals.subsidizedPromos.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-500">Campaign vouchers applied</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Net Billed Orders
            </span>
            <p className="text-lg font-black text-white font-mono">
              €{financialTotals.netBilledToCustomers.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500">Gross minus promo discounts</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Platform Fee (15%)
            </span>
            <p className="text-lg font-black text-blue-400 font-mono">
              -€{financialTotals.platformCommission.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-500">Gozolt marketplace service</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              VAT on Fee (18%)
            </span>
            <p className="text-lg font-black text-zinc-400 font-mono">
              -€{financialTotals.vatOnCommission.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-500">Malta tax authority</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Net Payout to Bank
            </span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              €{financialTotals.netRestaurantPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-emerald-300">Available for SEPA transfer</p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 43: SECTION 1 – SALES ANALYTICS
          Total Revenue, Fulfillment Channels, Revenue by Category, Revenue by Food Item
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#FCD223]" />
            Sales Performance (Revenue by Fulfillment, Category &amp; Item)
          </h2>
          {/* Revenue chart view toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#121214] p-0.5 print:hidden">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRevenueView(mode)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-bold uppercase transition-all cursor-pointer',
                  revenueView === mode
                    ? 'bg-[#FCD223] text-black'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Revenue SVG Bar Chart */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400">Total Sales Over Time</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                €{activeSeries.reduce((acc, s) => acc + s.revenue, 0).toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +16.4% vs prev period
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 border-b border-white/10 pb-2">
            {activeSeries.map((bar, idx) => {
              const heightPct = Math.round((bar.revenue / maxRevenueVal) * 100);
              const isHovered = hoveredRevenueIndex === idx;

              return (
                <div
                  key={bar.label}
                  onMouseEnter={() => setHoveredRevenueIndex(idx)}
                  onMouseLeave={() => setHoveredRevenueIndex(null)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 rounded-lg border border-white/10 bg-[#18181B] px-2.5 py-1 text-center shadow-xl">
                      <p className="font-mono text-xs font-bold text-[#FCD223]">€{bar.revenue}</p>
                      <p className="text-[10px] text-zinc-400">{bar.orders} orders</p>
                    </div>
                  )}

                  <div className="w-full max-w-[42px] bg-white/5 rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all',
                        isHovered ? 'bg-[#FCD223]' : 'bg-[#FCD223]/70 group-hover:bg-[#FCD223]'
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Fulfillment & Revenue by Category (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by Fulfillment Channel */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#FCD223]" />
                Revenue by Fulfillment Channel
              </h3>
              <span className="text-xs text-zinc-500 font-mono">2 Fulfillment Channels</span>
            </div>

            <div className="space-y-3">
              {fulfillmentBreakdown.map((channel) => (
                <div
                  key={channel.id}
                  className="rounded-xl border border-white/5 bg-[#18181B] p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{channel.name}</h4>
                      <p className="text-[10px] text-zinc-400">{channel.orders} orders • AOV €{channel.aov.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-sm text-[#FCD223]">
                        €{channel.grossRevenue.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Net: €{channel.netPayout.toLocaleString()} ({channel.sharePct}%)
                      </p>
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FCD223]"
                      style={{ width: `${channel.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-[#FCD223]" />
                Revenue by Category
              </h3>
              <span className="text-xs text-zinc-500 font-mono">6 Menu Groups</span>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{cat.name}</span>
                    <span className="font-mono text-zinc-300">
                      €{cat.revenue.toLocaleString()} ({cat.sharePct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${cat.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 43: SECTION 2 – ORDERS ANALYTICS
          Total Orders, Average Order Value, Completed, Cancelled, Peak Ordering Times
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#FCD223]" />
          Order Volume &amp; Peak Hour Distribution
        </h2>

        {/* 4 KPI Cards: Total Orders, AOV, Completed, Cancelled */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total Orders
            </span>
            <p className="text-2xl font-black text-white font-mono">
              {financialTotals.totalOrders.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold">+11.2% this period</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Avg Order Value (AOV)
            </span>
            <p className="text-2xl font-black text-[#FCD223] font-mono">
              €{financialTotals.averageOrderValue.toFixed(2)}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold">+€2.40 with add-ons</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Completed Orders
            </span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {financialTotals.completedOrders.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500">98.5% fulfillment rate</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Cancelled Orders
            </span>
            <p className="text-2xl font-black text-red-400 font-mono">
              {financialTotals.cancelledOrders}
            </p>
            <p className="text-[10px] text-zinc-500">{financialTotals.cancellationRate} cancellation rate</p>
          </div>
        </div>

        {/* Peak Ordering Times Heat Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Peak Ordering Times (Hourly Kitchen Ticket Velocity)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Key demand surges: Lunch (12:00–14:00) &amp; Dinner Rush (19:00–21:30)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="h-2.5 w-2.5 rounded bg-zinc-600" /> Light
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="h-2.5 w-2.5 rounded bg-amber-400" /> Busy
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="h-2.5 w-2.5 rounded bg-orange-500" /> Peak
              </span>
            </div>
          </div>

          {/* Hourly Timeline */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
            {peakHours.map((slot) => (
              <div
                key={slot.hour}
                className={cn(
                  'rounded-xl border p-2.5 text-center space-y-1 transition-all',
                  slot.intensity === 'peak'
                    ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                    : slot.intensity === 'high'
                    ? 'border-amber-400/30 bg-amber-400/10'
                    : slot.intensity === 'medium'
                    ? 'border-white/10 bg-[#18181B]'
                    : 'border-white/5 bg-[#121214] opacity-70'
                )}
              >
                <span className="font-mono text-xs font-bold text-white">{slot.hour}</span>
                <p
                  className={cn(
                    'font-mono text-sm font-black',
                    slot.intensity === 'peak'
                      ? 'text-orange-400'
                      : slot.intensity === 'high'
                      ? 'text-amber-400'
                      : 'text-zinc-300'
                  )}
                >
                  {slot.orders}
                </p>
                <p className="text-[9px] text-zinc-400 truncate">{slot.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 43: SECTION 3 – PRODUCTS ANALYTICS
          Best Selling Items, Least Selling Items, Most Popular Categories
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Utensils className="h-5 w-5 text-[#FCD223]" />
          Products Analytics (Best vs Least Sellers &amp; Velocity)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Best Selling Items Table */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-[#FCD223]" />
                Best Selling Items
              </h3>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                High Velocity
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#18181B]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase font-mono text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Units</th>
                    <th className="py-2.5 px-3 text-right">Gross Rev.</th>
                    <th className="py-2.5 px-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {bestSellingItems.map((item) => (
                    <tr key={item.name} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#FCD223]/10 text-[#FCD223] flex items-center justify-center text-[10px] font-mono">
                          {item.rank}
                        </span>
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-zinc-400">{item.category}</td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">{item.unitsSold}</td>
                      <td className="py-2.5 px-3 text-right text-[#FCD223]">€{item.grossRevenue.toFixed(0)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{item.marginPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Least Selling Items & Category Dominance */}
          <div className="lg:col-span-5 space-y-4">
            {/* Least Selling Items */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Least Selling Items (Low Velocity)
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Action Recommended</span>
              </div>

              <div className="space-y-2">
                {leastSellingItems.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-white/5 bg-[#18181B] p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="font-mono text-zinc-400">{item.unitsSold} sold (€{item.grossRevenue})</span>
                    </div>
                    <p className="text-[11px] text-amber-300/80 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Popular Categories Share */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#FCD223]" />
                Category Share of Customer Orders
              </h3>

              <div className="space-y-2">
                {[
                  { name: 'Pizza', pct: 39 },
                  { name: 'Pasta', pct: 27 },
                  { name: 'Main Course', pct: 14 },
                  { name: 'Starters', pct: 11 },
                  { name: 'Desserts & Drinks', pct: 9 },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="w-28 text-zinc-300 font-medium">{c.name}</span>
                    <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FCD223]"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-zinc-400">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 43: SECTION 4 – OPERATIONS ANALYTICS
          Average Prep Time, Order Acceptance Time, Delayed Orders, Cancellation Rate
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-[#FCD223]" />
          Operations &amp; Kitchen Speed SLAs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Avg Preparation Time
              </span>
              <Timer className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white font-mono">
              {financialTotals.avgPrepTimeMins} <span className="text-sm font-normal text-zinc-400">mins</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-bold">
              Well within 20m kitchen target
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Order Acceptance Time
              </span>
              <Clock className="h-4 w-4 text-[#FCD223]" />
            </div>
            <p className="text-3xl font-black text-white font-mono">
              {financialTotals.avgAcceptanceSeconds} <span className="text-sm font-normal text-zinc-400">secs</span>
            </p>
            <p className="text-[11px] text-zinc-400">
              Kitchen accepts in &lt; 1 minute
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Delayed Orders
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-amber-400 font-mono">
              {financialTotals.delayedOrdersCount}
            </p>
            <p className="text-[11px] text-zinc-400">
              {financialTotals.delayedOrdersRate} rate during weekend peak
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Cancellation Rate
              </span>
              <XCircle className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-3xl font-black text-white font-mono">
              {financialTotals.cancellationRate}
            </p>
            <p className="text-[11px] text-emerald-400 font-bold">
              Top tier (Platform target &lt; 2.5%)
            </p>
          </div>
        </div>

        {/* Cancellation Reasons Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Cancellation Reasons Breakdown</h3>
            <span className="text-xs text-zinc-500 font-mono">Total 22 Orders Cancelled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { reason: 'Station overload during peak', count: 10, pct: 45 },
              { reason: 'Ingredient stockout', count: 7, pct: 32 },
              { reason: 'Customer requested change', count: 3, pct: 14 },
              { reason: 'Courier dispatch timeout', count: 2, pct: 9 },
            ].map((r) => (
              <div key={r.reason} className="rounded-xl border border-white/5 bg-[#18181B] p-3 text-xs space-y-1">
                <span className="font-semibold text-white">{r.reason}</span>
                <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                  <span className="text-amber-400">{r.count} orders</span>
                  <span className="text-zinc-500">{r.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: PDF EXPORT PREVIEW
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-xl border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Generate Official Statement PDF
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Download formal audited performance &amp; settlement statement for accounting and tax records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Gozolt Technologies Malta Ltd</span>
                <Badge className="bg-[#FCD223] text-black font-bold text-[10px]">OFFICIAL AUDIT</Badge>
              </div>
              <p className="text-zinc-400 font-mono text-[11px]">
                Statement Period: {dateRange.toUpperCase()}
              </p>
              <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-400">Gross Customer Revenue:</span>
                  <p className="font-bold text-white font-mono">€{financialTotals.grossSales.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Net Merchant Payout:</span>
                  <p className="font-bold text-emerald-400 font-mono">€{financialTotals.netRestaurantPayout.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#18181B] p-3 text-zinc-400 text-[11px]">
              This export complies with MFSA and EU e-commerce VAT declarations. Includes detailed line item deductions and transaction logs.
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsPdfModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsPdfModalOpen(false);
                handlePrint();
              }}
              className="bg-[#FCD223] text-black font-bold text-xs hover:bg-[#FCD223]/90"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
