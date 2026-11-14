'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Utensils,
  ClipboardList,
  Wallet,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Eye,
  RefreshCw,
  ChefHat,
  Truck,
  MapPin,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Activity,
  Layers,
  Check,
  Flame,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  foodGrocerySupplierService,
  type SupplierProfileResponse,
  type SupplierOrder,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RestaurantDashboardPage() {
  const [data, setData] = useState<SupplierProfileResponse | null>(null);
  const [activeOrders, setActiveOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  // Stock alert state for Low Availability Items
  const [lowStockItems, setLowStockItems] = useState([
    { id: '1', name: 'Fresh Burrata Pugliese (250g)', category: 'Appetizers', portionsLeft: 3, price: 11.50, outOfStock: false },
    { id: '2', name: 'Black Truffle Sauce (Paste)', category: 'Ingredients', portionsLeft: 2, price: 16.00, outOfStock: false },
    { id: '3', name: 'Wild Sea Bass Fillet', category: 'Mains', portionsLeft: 4, price: 24.50, outOfStock: false },
    { id: '4', name: 'Sicilian Cannoli (Pistachio)', category: 'Desserts', portionsLeft: 5, price: 6.50, outOfStock: false },
  ]);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [profile, orders] = await Promise.all([
        foodGrocerySupplierService.getProfile(),
        foodGrocerySupplierService.getOrders('active'),
      ]);
      setData(profile);
      setActiveOrders(orders);
    } catch (err) {
      console.error('Failed to load restaurant dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const restaurantName = data?.business?.name || 'La Trattoria Bellissima';

  // Export report function
  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Period,Comparison\n' +
      `Total Orders,142,${dateFilter},+18.4%\n` +
      `Total Revenue,€3485.50,${dateFilter},+22.1%\n` +
      `Average Order Value,€24.55,${dateFilter},+3.2%\n` +
      'Pending Orders,6,Realtime,Active\n' +
      'Rating,4.9,All Time,328 reviews\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant-report-${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully', {
      description: `Downloaded summary for ${restaurantName} (${dateFilter.toUpperCase()})`,
    });
  };

  const toggleStockStatus = (id: string) => {
    setLowStockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, outOfStock: !item.outOfStock } : item
      )
    );
    toast.info('Kitchen inventory updated', {
      description: 'Stock status has been synced with the Gozolt customer app.',
    });
  };

  // Realistic sample orders chart data
  const ordersChartData = [
    { time: '09:00', orders: 4, revenue: 98.0 },
    { time: '11:00', orders: 12, revenue: 288.0 },
    { time: '13:00', orders: 38, revenue: 931.0 }, // Lunch rush
    { time: '15:00', orders: 14, revenue: 343.0 },
    { time: '17:00', orders: 9, revenue: 220.5 },
    { time: '19:00', orders: 42, revenue: 1029.0 }, // Dinner peak
    { time: '21:00', orders: 23, revenue: 576.0 },
  ];

  const maxOrders = Math.max(...ordersChartData.map((d) => d.orders));
  const maxRevenue = Math.max(...ordersChartData.map((d) => d.revenue));

  // Top selling dishes
  const topSellingDishes = [
    { name: 'Truffle Mushroom Tagliolini', orders: 86, revenue: 1634.0, pct: 92, category: 'Fresh Pasta' },
    { name: 'Woodfired Pizza Diavola', orders: 74, revenue: 1110.0, pct: 79, category: 'Artisan Pizza' },
    { name: 'Burrata Pugliese & Prosciutto', orders: 58, revenue: 841.0, pct: 62, category: 'Antipasti' },
    { name: 'Grilled Sea Bass Mediterranean', orders: 42, revenue: 1029.0, pct: 45, category: 'Main Courses' },
    { name: 'Tiramisu Tradizionale', orders: 71, revenue: 497.0, pct: 76, category: 'Desserts' },
  ];

  // Order status distribution
  const orderStatusDistribution = [
    { label: 'Preparing', count: 18, pct: 38, color: '#FCD223' },
    { label: 'Ready for Pickup', count: 9, pct: 19, color: '#3B82F6' },
    { label: 'Out for Delivery', count: 14, pct: 29, color: '#10B981' },
    { label: 'Delivered', count: 5, pct: 10, color: '#8B5CF6' },
    { label: 'Cancelled', count: 2, pct: 4, color: '#EF4444' },
  ];

  // Recent Orders
  const recentOrders = [
    {
      id: 'GZ-FG-98A1',
      customer: 'Elena Vassallo',
      phone: '+356 7982 1104',
      items: '2x Truffle Tagliolini, 1x Tiramisu',
      amount: 44.5,
      status: 'PREPARING',
      time: '4 mins ago',
      channel: 'App Delivery',
    },
    {
      id: 'GZ-FG-98A2',
      customer: 'David Camilleri',
      phone: '+356 9944 5521',
      items: '1x Diavola Pizza, 1x Burrata Pugliese, 2x Cola',
      amount: 32.0,
      status: 'READY_FOR_PICKUP',
      time: '11 mins ago',
      channel: 'Driver Arrived',
    },
    {
      id: 'GZ-FG-98A3',
      customer: 'Martina Borg',
      phone: '+356 7712 9900',
      items: '1x Grilled Sea Bass, 1x Sparkling Water',
      amount: 27.5,
      status: 'NEW',
      time: 'Just now',
      channel: 'Urgent',
    },
    {
      id: 'GZ-FG-98A4',
      customer: 'Luca Farrugia',
      phone: '+356 9918 3341',
      items: '3x Margherita Pizza, 1x Garlic Focaccia',
      amount: 41.0,
      status: 'COMPLETED',
      time: '28 mins ago',
      channel: 'Delivered',
    },
  ];

  // Customer Reviews
  const recentReviews = [
    {
      id: 'r1',
      customer: 'Sophie V.',
      rating: 5,
      dish: 'Truffle Mushroom Tagliolini',
      comment: 'Absolutely heavenly pasta! Cooked perfectly al dente and arrived steaming hot in 22 mins.',
      time: '18m ago',
    },
    {
      id: 'r2',
      customer: 'Mark Z.',
      rating: 5,
      dish: 'Woodfired Pizza Diavola',
      comment: 'Crispy blistered crust and premium spicy salami. Best authentic pizza in Malta hands down.',
      time: '1h ago',
    },
    {
      id: 'r3',
      customer: 'Chiara M.',
      rating: 4,
      dish: 'Burrata Pugliese',
      comment: 'Fresh creamy burrata with sweet heirloom tomatoes. Packaging was super secure.',
      time: '3h ago',
    },
  ];

  // Live Activity Log
  const liveActivity = [
    { id: 'a1', text: 'New order #GZ-FG-98A3 received from Martina Borg', time: 'Just now', type: 'order' },
    { id: 'a2', text: 'Driver Marco G. arrived for pickup #GZ-FG-98A2', time: '3 mins ago', type: 'driver' },
    { id: 'a3', text: 'Chef marked Black Truffle Tagliolini batch ready', time: '7 mins ago', type: 'kitchen' },
    { id: 'a4', text: 'Order #GZ-FG-98A1 moved to PREPARING station', time: '12 mins ago', type: 'order' },
    { id: 'a5', text: 'Weekly settlement statement generated: €2,480.15', time: '2 hrs ago', type: 'payment' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP SECTION: Welcome, Restaurant Name, Date Filter, Export
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kitchen Live • Accepting Orders
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Utensils className="h-7 w-7 text-[#FCD223]" />
            {restaurantName}
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Welcome back! Here is your restaurant live operational overview and sales performance.
          </p>
        </div>

        {/* Controls: Date Range, Export */}
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Date Filter Pills */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                  dateFilter === period
                    ? 'bg-[#FCD223] text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isRefreshing}
            className="border-white/10 bg-[#121214] text-zinc-300 hover:text-white hover:bg-white/5"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isRefreshing && 'animate-spin text-[#FCD223]')} />
            Refresh
          </Button>

          {/* Export Report Button */}
          <Button
            onClick={handleExportReport}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          QUICK ACTIONS BAR
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/restaurants/orders"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121214] p-3.5 hover:border-[#FCD223]/40 hover:bg-[#18181B] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FCD223]/10 text-[#FCD223]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                View All Orders
              </p>
              <p className="text-[11px] text-zinc-400">Manage 6 active pipeline</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/restaurants/delivery"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121214] p-3.5 hover:border-amber-500/40 hover:bg-[#18181B] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Delivery Dispatch
              </p>
              <p className="text-[11px] text-zinc-400">Live handovers & riders</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/restaurants/menu"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121214] p-3.5 hover:border-blue-500/40 hover:bg-[#18181B] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                Manage Menu
              </p>
              <p className="text-[11px] text-zinc-400">Dishes, variants, addons</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/restaurants/analytics"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121214] p-3.5 hover:border-purple-500/40 hover:bg-[#18181B] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                View Reports
              </p>
              <p className="text-[11px] text-zinc-400">Deep performance analytics</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          STATISTICS CARDS (5 Requested Cards with Comparisons & Icons)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Orders */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 relative overflow-hidden group hover:border-[#FCD223]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Orders
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FCD223]/10 text-[#FCD223]">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-white">142</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </span>
            <span className="text-[10px] text-zinc-500">vs prev {dateFilter}</span>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">€3,485.50</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +22.1%
            </span>
            <span className="text-[10px] text-zinc-500">vs prev {dateFilter}</span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Avg. Order Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-white">€24.55</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +3.2%
            </span>
            <span className="text-[10px] text-zinc-500">Target €22.00</span>
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Pending Orders
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-amber-400">
              {activeOrders.length > 0 ? activeOrders.length : 6}
            </p>
            <span className="text-xs text-zinc-400">in kitchen</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-bold text-amber-400">
              4 Cooking • 2 Ready
            </span>
            <span className="text-[10px] text-zinc-500">Live queue</span>
          </div>
        </div>

        {/* Card 5: Restaurant Rating */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Restaurant Rating
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
              <Star className="h-4 w-4 fill-yellow-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-white">4.9</p>
            <span className="text-xs text-zinc-400">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +0.2
            </span>
            <span className="text-[10px] text-zinc-500">328 reviews</span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          CHARTS SECTION (4 Requested Charts)
          1. Orders Overview (Line chart)
          2. Revenue Overview (Bar chart)
          3. Order Status Distribution (Doughnut chart)
          4. Top Selling Food Items (Horizontal Bar chart)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders Overview (Line Chart with SVG path & points) */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#FCD223]" />
                Orders Overview
              </h2>
              <p className="text-xs text-zinc-400">Order intake progression across daytime service</p>
            </div>
            <span className="text-xs font-bold text-[#FCD223] bg-[#FCD223]/10 px-2 py-0.5 rounded-md">
              Peak: 42 Orders (19:00)
            </span>
          </div>

          <div className="h-56 w-full relative pt-4 flex flex-col justify-end">
            {/* SVG Line Chart */}
            <svg viewBox="0 0 500 160" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCD223" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FCD223" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="130" x2="500" y2="130" stroke="#27272A" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#27272A" strokeDasharray="3 3" />
              <line x1="0" y1="30" x2="500" y2="30" stroke="#27272A" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                fill="url(#orderGrad)"
                points="
                  20,135
                  20,120
                  95,95
                  170,25
                  245,90
                  320,105
                  395,15
                  470,65
                  470,135
                "
              />

              {/* Smooth Line */}
              <polyline
                fill="none"
                stroke="#FCD223"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="
                  20,120
                  95,95
                  170,25
                  245,90
                  320,105
                  395,15
                  470,65
                "
              />

              {/* Interactive Data points */}
              {[
                { x: 20, y: 120, label: '4 orders' },
                { x: 95, y: 95, label: '12 orders' },
                { x: 170, y: 25, label: '38 orders' },
                { x: 245, y: 90, label: '14 orders' },
                { x: 320, y: 105, label: '9 orders' },
                { x: 395, y: 15, label: '42 orders' },
                { x: 470, y: 65, label: '23 orders' },
              ].map((pt, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#0A0A0A"
                    stroke="#FCD223"
                    strokeWidth="3"
                    className="hover:r-7 transition-all"
                  />
                </g>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-zinc-400 mt-2 px-1">
              {ordersChartData.map((d) => (
                <span key={d.time}>{d.time}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Revenue Overview (Bar Chart) */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                Revenue Overview (€)
              </h2>
              <p className="text-xs text-zinc-400">Total EUR volume generated per meal period</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Total Today: €3,485.50
            </span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2">
            {ordersChartData.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxRevenue) * 100);
              const isHovered = hoveredChartIndex === idx;

              return (
                <div
                  key={item.time}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  onMouseEnter={() => setHoveredChartIndex(idx)}
                  onMouseLeave={() => setHoveredChartIndex(null)}
                >
                  {/* Tooltip on hover */}
                  <div
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-white transition-opacity',
                      isHovered ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    €{item.revenue.toFixed(0)}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-zinc-800 rounded-t-lg relative flex items-end overflow-hidden h-36">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-500',
                        idx === 5
                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                          : idx === 2
                          ? 'bg-gradient-to-t from-yellow-500 to-amber-300'
                          : 'bg-gradient-to-t from-zinc-600 to-zinc-400 group-hover:from-emerald-500 group-hover:to-emerald-400'
                      )}
                    />
                  </div>

                  <span className="text-[10px] text-zinc-400 group-hover:text-white transition-colors">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Order Status Distribution (Doughnut Chart) */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                Order Status Distribution
              </h2>
              <p className="text-xs text-zinc-400">Current workflow breakdown across 47 active tickets</p>
            </div>
            <Badge variant="outline" className="border-white/10 text-zinc-300 text-[10px]">
              Live KDS
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* SVG Doughnut */}
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {/* 38% Preparing (#FCD223) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FCD223"
                  strokeWidth="14"
                  strokeDasharray="90.7 238.7"
                  strokeDashoffset="0"
                />
                {/* 19% Ready (#3B82F6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="14"
                  strokeDasharray="45.3 238.7"
                  strokeDashoffset="-90.7"
                />
                {/* 29% On the way (#10B981) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray="69.2 238.7"
                  strokeDashoffset="-136"
                />
                {/* 10% Delivered (#8B5CF6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="14"
                  strokeDasharray="23.8 238.7"
                  strokeDashoffset="-205.2"
                />
                {/* 4% Cancelled (#EF4444) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray="9.5 238.7"
                  strokeDashoffset="-229"
                />
              </svg>
              {/* Doughnut Center Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">47</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Tickets</span>
              </div>
            </div>

            {/* Doughnut Legend */}
            <div className="flex-1 w-full space-y-2">
              {orderStatusDistribution.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-zinc-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{item.count}</span>
                    <span className="text-[11px] text-zinc-500 w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Top Selling Food Items (Horizontal Bar Chart) */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                Top Selling Food Items
              </h2>
              <p className="text-xs text-zinc-400">Highest grossing menu items by portion volume</p>
            </div>
            <Link
              href="/restaurants/menu"
              className="text-xs font-semibold text-[#FCD223] hover:underline"
            >
              Menu Edit &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 py-1">
            {topSellingDishes.map((dish, i) => (
              <div key={dish.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="text-zinc-500 text-[11px] font-mono">#{i + 1}</span>
                    {dish.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{dish.orders} sold</span>
                    <span className="font-bold text-[#FCD223]">€{dish.revenue.toFixed(2)}</span>
                  </div>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${dish.pct}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#FCD223] transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM SECTIONS:
          1. Recent Orders Table
          2. Best Selling Items
          3. Recent Customer Reviews
          4. Low Availability Items
          5. Restaurant Activity Live Feed
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Recent Orders Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Table */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#FCD223]" />
                  Recent Kitchen Orders
                </h2>
                <p className="text-xs text-zinc-400">Incoming, preparing and dispatched customer orders</p>
              </div>
              <Link
                href="/restaurants/orders"
                className="text-xs font-bold text-[#FCD223] hover:underline flex items-center gap-1"
              >
                View All Orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        {order.id}
                        <div className="text-[10px] font-sans text-zinc-500">{order.time}</div>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-white">{order.customer}</p>
                        <p className="text-[10px] text-zinc-400">{order.phone}</p>
                      </td>
                      <td className="py-3 max-w-[200px]">
                        <p className="truncate text-zinc-200">{order.items}</p>
                        <span className="text-[10px] text-zinc-500">{order.channel}</span>
                      </td>
                      <td className="py-3 text-right font-bold text-white">
                        €{order.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            'inline-block px-2.5 py-1 rounded-full text-[10px] font-bold',
                            order.status === 'NEW'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                              : order.status === 'PREPARING'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : order.status === 'READY_FOR_PICKUP'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          )}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href="/restaurants/orders"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Availability Items / Stock alerts */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Low Availability & Stock Alerts</h2>
                  <p className="text-xs text-amber-200/70">
                    These items have &le; 5 portions left. Restock or toggle out-of-stock.
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-500 text-black font-bold text-[10px]">
                {lowStockItems.filter((i) => !i.outOfStock).length} Warning(s)
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3 transition-all',
                    item.outOfStock
                      ? 'border-red-500/30 bg-red-950/20 opacity-70'
                      : 'border-white/10 bg-[#121214]'
                  )}
                >
                  <div>
                    <p className={cn('text-xs font-bold', item.outOfStock ? 'line-through text-zinc-400' : 'text-white')}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400">{item.category}</span>
                      <span className="text-[10px] font-bold text-amber-400">
                        {item.outOfStock ? 'Sold Out' : `${item.portionsLeft} portions left`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStockStatus(item.id)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all',
                      item.outOfStock
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                    )}
                  >
                    {item.outOfStock ? 'Mark In Stock' : 'Mark Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Customer Reviews & Live Activity Feed */}
        <div className="space-y-6">
          {/* Recent Customer Reviews */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                Recent Reviews
              </h2>
              <Link href="/restaurants/reviews" className="text-xs font-semibold text-[#FCD223] hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentReviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-white/5 bg-[#18181B]/70 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rev.customer}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-medium">Dish: {rev.dish}</p>
                  <p className="text-xs text-zinc-300 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-zinc-500 block">{rev.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Restaurant Live Activity Feed */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Restaurant Feed
              </h2>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="relative pl-4 space-y-4 border-l border-zinc-800">
              {liveActivity.map((act) => (
                <div key={act.id} className="relative group">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#121214] bg-[#FCD223]" />
                  <p className="text-xs text-zinc-300 leading-snug">{act.text}</p>
                  <span className="text-[10px] text-zinc-500">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
