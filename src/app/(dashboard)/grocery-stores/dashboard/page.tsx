'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ClipboardList,
  Wallet,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Download,
  Calendar,
  RefreshCw,
  Truck,
  Sparkles,
  Layers,
  Check,
  Flame,
  Store,
  FolderPlus,
  Package,
  Activity,
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

export default function GroceryDashboardPage() {
  const [data, setData] = useState<SupplierProfileResponse | null>(null);
  const [activeOrders, setActiveOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  // Low Stock / Aisle Shelf Availability alerts
  const [lowStockItems, setLowStockItems] = useState([
    { id: '1', name: 'Fresh Organic Whole Milk 1L', aisle: 'Dairy & Eggs', unitsLeft: 4, price: 1.85, outOfStock: false },
    { id: '2', name: 'Hass Avocados (Pack of 4)', aisle: 'Fresh Produce', unitsLeft: 2, price: 3.90, outOfStock: false },
    { id: '3', name: 'Artisan Country Sourdough Loaf', aisle: 'Bakery', unitsLeft: 3, price: 2.75, outOfStock: false },
    { id: '4', name: 'Free-Range Organic Eggs (10-Pack)', aisle: 'Dairy & Eggs', unitsLeft: 5, price: 3.40, outOfStock: false },
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
      console.error('Failed to load grocery dashboard:', err);
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

  const storeName = data?.business?.name || 'Valletta Gourmet Supermarket';

  // Export report function
  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Period,Growth\n' +
      `Active Picking Orders,${activeOrders.length || 3},Realtime,Live\n` +
      `Completed Deliveries,48,${dateFilter},+14.8%\n` +
      `Gross Supermarket Sales,€1842.50,${dateFilter},+19.2%\n` +
      `Average Basket Value,€34.20,${dateFilter},+5.1%\n` +
      'Store Rating,4.9,All Time,248 Verified Shoppers\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grocery-summary-${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Supermarket report exported successfully', {
      description: `Downloaded operational summary for ${storeName} (${dateFilter.toUpperCase()})`,
    });
  };

  const toggleStockStatus = (id: string) => {
    setLowStockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, outOfStock: !item.outOfStock } : item
      )
    );
    toast.info('Aisle shelf inventory updated', {
      description: 'Stock status has been synced with customer mobile shopping app.',
    });
  };

  // Supermarket Hourly Order & Basket Velocity Chart
  const ordersChartData = [
    { time: '08:00', orders: 6, revenue: 198.0 },
    { time: '10:00', orders: 18, revenue: 612.0 },
    { time: '12:00', orders: 24, revenue: 840.0 }, // Lunch replenishment
    { time: '14:00', orders: 15, revenue: 510.0 },
    { time: '16:00', orders: 21, revenue: 735.0 },
    { time: '18:00', orders: 36, revenue: 1260.0 }, // Dinner prep surge
    { time: '20:00', orders: 28, revenue: 980.0 },
  ];

  const maxOrders = Math.max(...ordersChartData.map((d) => d.orders));
  const maxRevenue = Math.max(...ordersChartData.map((d) => d.revenue));

  // Top Selling Grocery Essentials
  const topSellingProducts = [
    { name: 'Organic Whole Milk 1L', aisle: 'Dairy & Eggs', units: 142, revenue: 262.70, pct: 95 },
    { name: 'Artisan Country Sourdough Loaf', aisle: 'Bakery', units: 118, revenue: 324.50, pct: 86 },
    { name: 'Hass Avocados (Pack of 4)', aisle: 'Fresh Produce', units: 94, revenue: 366.60, pct: 78 },
    { name: 'Cold-Pressed Olive Oil 750ml', aisle: 'Pantry Essentials', units: 62, revenue: 607.60, pct: 64 },
    { name: 'Free-Range Organic Eggs (10pk)', aisle: 'Dairy & Eggs', units: 108, revenue: 367.20, pct: 82 },
  ];

  // Recent Supermarket Orders
  const recentOrders = [
    {
      id: 'GZ-GR-4192',
      customer: 'Elena Vassallo',
      itemsCount: 8,
      itemsSummary: 'Whole Milk, Sourdough Loaf, Avocados (4pk), Greek Yogurt...',
      amount: 38.40,
      status: 'PICKING',
      time: '3 mins ago',
      courier: 'Courier Assigned',
    },
    {
      id: 'GZ-GR-4191',
      customer: 'David Camilleri',
      itemsCount: 14,
      itemsSummary: 'Olive Oil, Pasta Penne, Tomato Passata, Parmesan Cheese...',
      amount: 62.80,
      status: 'PACKED_READY',
      time: '9 mins ago',
      courier: 'Driver Arrived at Counter',
    },
    {
      id: 'GZ-GR-4190',
      customer: 'Martina Borg',
      itemsCount: 5,
      itemsSummary: 'Free-Range Eggs, Butter 250g, Orange Juice 1L...',
      amount: 19.50,
      status: 'NEW',
      time: 'Just now',
      courier: 'Awaiting Picker',
    },
    {
      id: 'GZ-GR-4189',
      customer: 'Luca Farrugia',
      itemsCount: 11,
      itemsSummary: 'Sparkling Mineral Water (6pk), Bananas 1kg, Apples 1kg...',
      amount: 44.20,
      status: 'DISPATCHED',
      time: '24 mins ago',
      courier: 'On Route to Customer',
    },
  ];

  // Recent Shopper Reviews
  const recentShopperReviews = [
    {
      id: 'rev-1',
      customer: 'Sarah Gauci',
      rating: 5,
      comment: 'Groceries arrived perfectly chilled! The avocados were ripe and ready to eat, and everything was packed neatly in paper bags.',
      time: '25m ago',
      basket: 'Fresh Produce & Dairy',
    },
    {
      id: 'rev-2',
      customer: 'Mark Zammit',
      rating: 5,
      comment: 'Super fast packing! Ordered 12 supermarket items and the Gozolt courier was at my apartment within 28 minutes.',
      time: '1h ago',
      basket: 'Pantry Essentials',
    },
    {
      id: 'rev-3',
      customer: 'Clara Mifsud',
      rating: 4,
      comment: 'Fresh sourdough was still warm from the bakery oven. Great selection of local items.',
      time: '3h ago',
      basket: 'Bakery & Fresh Market',
    },
  ];

  // Live Activity Log
  const liveStoreActivity = [
    { id: 'act-1', text: 'New grocery order #GZ-GR-4190 received from Martina Borg', time: 'Just now', type: 'order' },
    { id: 'act-2', text: 'Courier Liam B. arrived at store counter for pickup #GZ-GR-4191', time: '4 mins ago', type: 'driver' },
    { id: 'act-3', text: 'Picker completed bagging order #GZ-GR-4192 (8 items)', time: '8 mins ago', type: 'picker' },
    { id: 'act-4', text: 'Aisle 2: Fresh Organic Whole Milk restocked to 24 units', time: '18 mins ago', type: 'inventory' },
    { id: 'act-5', text: 'Daily supermarket payout reconciliation complete: €1,566.12', time: '1 hr ago', type: 'finance' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP SECTION: Welcome, Store Name, Date Filter, Export
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Supermarket Live • Accepting Mobile Orders
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              {storeName}
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              Verified Partner
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            {data?.business?.address || 'Merchants Street, Valletta'} • Live grocery picking, aisle inventory & fast courier dispatch
          </p>
        </div>

        {/* Date Filter & Export Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm">
            {(['today', 'week', 'month'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDateFilter(tab)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                  dateFilter === tab
                    ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                {tab === 'today' ? 'Today' : tab === 'week' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          <Button
            onClick={loadData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-[#A1A1AA] hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isRefreshing && 'animate-spin text-[#FCD223]')} />
            Refresh
          </Button>

          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5 hover:border-white/20"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
            Export Summary
          </Button>

          <Link href="/grocery-stores/orders">
            <Button
              size="sm"
              className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
            >
              <ClipboardList className="h-4 w-4 mr-1.5" />
              Live Orders ({activeOrders.length || 3})
            </Button>
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: KEY PERFORMANCE INDICATORS (4 CARDS)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Picking Orders */}
        <Link href="/grocery-stores/orders" className="block group">
          <div className="h-full rounded-2xl border border-white/10 bg-[#121214] p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#151518] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Active Picking Orders
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {activeOrders.length > 0 ? activeOrders.length : 3}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                    In Progress
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Avg. pick & pack: 14 mins</span>
              <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Open queue <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Today's Fulfilled Deliveries */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Completed Deliveries
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-white">48</span>
                <span className="text-xs font-bold text-blue-400 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +14.8%
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Truck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Total baskets completed: 1,840</span>
            <span className="text-white/60">On-time rate: 98.4%</span>
          </div>
        </div>

        {/* Card 3: Gross Supermarket Revenue */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Gross Supermarket Sales
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-400">
                  €1,842.50
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +19.2%
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Avg. basket size: <strong className="text-white">€34.20</strong></span>
            <span className="text-emerald-400 font-semibold">Automatic payout</span>
          </div>
        </div>

        {/* Card 4: Store Shopper Rating */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Shopper Satisfaction
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-white flex items-center gap-1.5">
                  4.9
                  <Star className="h-5 w-5 fill-[#FCD223] text-[#FCD223]" />
                </span>
                <span className="text-xs text-[#A1A1AA]">
                  (248 reviews)
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCD223]/10 text-[#FCD223] border border-[#FCD223]/20">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
            <span className="text-emerald-400 font-medium">99.1% Positive Experience</span>
            <Link href="/grocery-stores/reviews" className="text-[#FCD223] hover:underline">
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: QUICK ACTION SHORTCUT STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/grocery-stores/products"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121214] p-3.5 transition-all hover:border-[#FCD223]/40 hover:bg-[#18181B] group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-105 transition-transform">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Add Grocery Product</p>
            <p className="text-[11px] text-[#A1A1AA] truncate">Barcode & shelf stock</p>
          </div>
        </Link>

        <Link
          href="/grocery-stores/categories"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121214] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-[#18181B] group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Aisles & Categories</p>
            <p className="text-[11px] text-[#A1A1AA] truncate">Produce, Dairy, Pantry</p>
          </div>
        </Link>

        <Link
          href="/grocery-stores/orders"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121214] p-3.5 transition-all hover:border-blue-500/40 hover:bg-[#18181B] group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Order Packing Queue</p>
            <p className="text-[11px] text-[#A1A1AA] truncate">Live bagging & handover</p>
          </div>
        </Link>

        <Link
          href="/grocery-stores/delivery"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121214] p-3.5 transition-all hover:border-purple-500/40 hover:bg-[#18181B] group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Store Availability</p>
            <p className="text-[11px] text-[#A1A1AA] truncate">Online / Closed status</p>
          </div>
        </Link>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: MAIN TWO-COLUMN DASHBOARD GRID
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT TWO COLUMNS: LIVE ORDERS QUEUE + HOURLY VELOCITY + TOP PRODUCTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Picking & Packing Orders */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Active Grocery Picking & Bagging Stream
                </h2>
              </div>
              <Link
                href="/grocery-stores/orders"
                className="text-xs font-bold text-[#FCD223] hover:underline flex items-center gap-1"
              >
                Full Picking Station <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-[#18181B] p-4 transition-all hover:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-white">{order.customer}</span>
                      <span className="text-[11px] text-[#A1A1AA]">• {order.time}</span>
                      <Badge
                        className={cn(
                          'text-[10px] uppercase font-bold px-2 py-0.5',
                          order.status === 'PICKING'
                            ? 'bg-[#FCD223]/15 text-[#FCD223] border-[#FCD223]/30'
                            : order.status === 'PACKED_READY'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : order.status === 'DISPATCHED'
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        )}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#A1A1AA] line-clamp-1">
                      <span className="text-white font-medium">{order.itemsCount} items:</span> {order.itemsSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                    <div className="text-right">
                      <p className="text-sm font-black text-white">€{order.amount.toFixed(2)}</p>
                      <p className="text-[11px] text-emerald-400">{order.courier}</p>
                    </div>
                    <Link href="/grocery-stores/orders">
                      <Button
                        size="sm"
                        className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-1.5 h-8"
                      >
                        Pack Order
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supermarket Hourly Order & Basket Velocity Chart */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#FCD223]" />
                  Hourly Order Velocity & Customer Basket Turnover
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Peak customer shopping windows: Morning Restock (10:00) & Dinner Prep Surge (18:00–20:00)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#FCD223]" /> Order Baskets
                </span>
                <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                  <span className="h-2.5 w-2.5 rounded-sm bg-white/20" /> Capacity Limit
                </span>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="relative pt-6 pb-2">
              <div className="grid grid-cols-7 gap-3 items-end h-44 border-b border-white/10 pb-2">
                {ordersChartData.map((d, index) => {
                  const barHeightPct = Math.round((d.orders / maxOrders) * 100);
                  const isHovered = hoveredChartIndex === index;

                  return (
                    <div
                      key={d.time}
                      onMouseEnter={() => setHoveredChartIndex(index)}
                      onMouseLeave={() => setHoveredChartIndex(null)}
                      className="group relative flex flex-col items-center justify-end h-full cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-14 z-20 whitespace-nowrap rounded-lg bg-[#27272A] border border-white/20 px-2.5 py-1 text-[11px] shadow-xl text-center">
                          <p className="font-bold text-[#FCD223]">{d.orders} Baskets</p>
                          <p className="text-white/80">€{d.revenue.toFixed(2)} sales</p>
                        </div>
                      )}

                      {/* Bar */}
                      <div className="w-full max-w-[36px] bg-white/5 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${barHeightPct}%` }}
                          className={cn(
                            'w-full transition-all duration-300 rounded-t-md',
                            isHovered
                              ? 'bg-[#FCD223] shadow-[0_0_15px_rgba(252,210,35,0.5)]'
                              : 'bg-gradient-to-t from-[#FCD223]/60 to-[#FCD223]'
                          )}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#A1A1AA] mt-2 group-hover:text-white transition-colors">
                        {d.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Selling Grocery Essentials */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#FCD223]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  High-Velocity Grocery Essentials
                </h3>
              </div>
              <Link href="/grocery-stores/products" className="text-xs font-bold text-[#FCD223] hover:underline">
                View Full Catalogue
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#A1A1AA] uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-1">Rank</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Aisle / Department</th>
                    <th className="pb-3 text-right">Units Sold</th>
                    <th className="pb-3 text-right">Sales (€)</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topSellingProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-1 font-bold text-white/60">#{idx + 1}</td>
                      <td className="py-3 font-semibold text-white">{prod.name}</td>
                      <td className="py-3 text-[#A1A1AA]">
                        <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10 text-[11px]">
                          {prod.aisle}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-white">{prod.units}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">€{prod.revenue.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                          In Stock
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOW STOCK ALERTS + ACTIVITY FEED + REVIEWS */}
        <div className="space-y-6">
          {/* Low Stock & Aisle Shelf Availability alerts */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#FCD223]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Low Shelf Stock Alerts
                </h3>
              </div>
              <Badge className="bg-amber-500/15 border-amber-500/30 text-[#FCD223] text-[11px] font-bold">
                {lowStockItems.filter((i) => !i.outOfStock).length} Critical
              </Badge>
            </div>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Items approaching 0 stock. 1-click toggle to update mobile app checkout.
            </p>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-[#18181B] p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn('text-xs font-bold', item.outOfStock ? 'text-[#71717A] line-through' : 'text-white')}>
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA]">{item.aisle} • €{item.price.toFixed(2)}</p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0',
                        item.outOfStock
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-[#FCD223] border-amber-500/30'
                      )}
                    >
                      {item.outOfStock ? 'OUT OF STOCK' : `${item.unitsLeft} Left`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-[#71717A]">
                      {item.outOfStock ? 'Hidden on app' : 'Low stock warning'}
                    </span>
                    <button
                      onClick={() => toggleStockStatus(item.id)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
                        item.outOfStock
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                      )}
                    >
                      {item.outOfStock ? 'Restock Item' : 'Mark Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Store Fulfillment Activity */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Live Store Activity
              </h3>
            </div>

            <div className="space-y-3.5 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[1px] before:bg-white/10">
              {liveStoreActivity.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3 pl-6">
                  <div
                    className={cn(
                      'absolute left-1.5 top-1.5 h-2 w-2 rounded-full ring-4 ring-[#121214]',
                      act.type === 'order'
                        ? 'bg-[#FCD223]'
                        : act.type === 'driver'
                        ? 'bg-blue-400'
                        : act.type === 'picker'
                        ? 'bg-emerald-400'
                        : act.type === 'inventory'
                        ? 'bg-purple-400'
                        : 'bg-white'
                    )}
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs text-white leading-relaxed">{act.text}</p>
                    <p className="text-[10px] text-[#A1A1AA]">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Shopper Reviews */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[#FCD223]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Shopper Feedback
                </h3>
              </div>
              <Link href="/grocery-stores/reviews" className="text-xs font-bold text-[#FCD223] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentShopperReviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-white/10 bg-[#18181B] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.customer}</span>
                      <UserCheck className="h-3 w-3 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#FCD223] text-[#FCD223]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#71717A]">
                    <span>{rev.basket}</span>
                    <span>{rev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
