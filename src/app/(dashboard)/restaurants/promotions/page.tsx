'use client';

import { useState } from 'react';
import {
  Percent,
  Plus,
  Tag,
  Calendar,
  CheckCircle2,
  Gift,
  Clock,
  Sparkles,
  Search,
  Filter,
  Building2,
  Store,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  PieChart,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────

export type FundingSource = 'RESTAURANT_FUNDED' | 'PLATFORM_FUNDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type PromoStatus = 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'EXPIRED';

export interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  fundingSource: FundingSource;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  applicableCategories: string[];
  applicableItems: string[];
  startDate: string;
  endDate: string;
  usageLimit: number;
  currentUsage: number;
  userLimit: number;
  status: PromoStatus;
  // Estimated metrics
  estimatedGrossRevenue: number;
  estimatedDiscountCost: number;
}

// ── Mock Initial Data ────────────────────────────────────────────────────────

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'First Order Welcome Feast',
    code: 'WELCOME20',
    description: '20% off entire food cart for first-time Gozolt customers with €20 min spend.',
    fundingSource: 'RESTAURANT_FUNDED',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 20.0,
    maxDiscount: 8.0,
    applicableCategories: ['All Categories'],
    applicableItems: ['All Items'],
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    currentUsage: 142,
    userLimit: 1,
    status: 'ACTIVE',
    estimatedGrossRevenue: 4544.0,
    estimatedDiscountCost: 890.0,
  },
  {
    id: 'promo-2',
    name: 'Gozolt Malta Co-Op Free Delivery',
    code: 'FREESHIP-MT',
    description: '100% Platform-subsidized delivery promo for orders over €25 across Valletta.',
    fundingSource: 'PLATFORM_FUNDED',
    discountType: 'FIXED_AMOUNT',
    discountValue: 2.5,
    minOrderValue: 25.0,
    maxDiscount: 2.5,
    applicableCategories: ['All Categories'],
    applicableItems: ['All Items'],
    startDate: '2026-11-10',
    endDate: '2026-11-30',
    usageLimit: 1000,
    currentUsage: 418,
    userLimit: 3,
    status: 'ACTIVE',
    estimatedGrossRevenue: 10868.0,
    estimatedDiscountCost: 1045.0,
  },
  {
    id: 'promo-3',
    name: 'Midweek Pizza Craze',
    code: 'PIZZA15',
    description: '15% discount on all artisan pizzas every Tuesday & Wednesday.',
    fundingSource: 'RESTAURANT_FUNDED',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 18.0,
    maxDiscount: 6.0,
    applicableCategories: ['Pizza'],
    applicableItems: ['Diavola', 'Margherita D.O.P.', 'Quattro Formaggi', 'Capricciosa'],
    startDate: '2026-11-05',
    endDate: '2026-12-15',
    usageLimit: 300,
    currentUsage: 89,
    userLimit: 2,
    status: 'ACTIVE',
    estimatedGrossRevenue: 2492.0,
    estimatedDiscountCost: 373.8,
  },
  {
    id: 'promo-4',
    name: 'Gozolt Black Friday Growth Subsidy',
    code: 'BF-GOZOLT',
    description: 'Platform co-funded €5 discount on premium dinner orders above €35.',
    fundingSource: 'PLATFORM_FUNDED',
    discountType: 'FIXED_AMOUNT',
    discountValue: 5.0,
    minOrderValue: 35.0,
    maxDiscount: 5.0,
    applicableCategories: ['Main Course', 'Pizza', 'Pasta'],
    applicableItems: ['All Items'],
    startDate: '2026-11-27',
    endDate: '2026-11-30',
    usageLimit: 600,
    currentUsage: 0,
    userLimit: 1,
    status: 'SCHEDULED',
    estimatedGrossRevenue: 0.0,
    estimatedDiscountCost: 0.0,
  },
  {
    id: 'promo-5',
    name: 'October Pasta Fest',
    code: 'PASTA5',
    description: '€5 off handmade pasta selections during October culinary week.',
    fundingSource: 'RESTAURANT_FUNDED',
    discountType: 'FIXED_AMOUNT',
    discountValue: 5.0,
    minOrderValue: 22.0,
    maxDiscount: 5.0,
    applicableCategories: ['Pasta'],
    applicableItems: ['Truffle Tagliatelle', 'Carbonara Tradizionale'],
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    usageLimit: 250,
    currentUsage: 250,
    userLimit: 1,
    status: 'EXPIRED',
    estimatedGrossRevenue: 6125.0,
    estimatedDiscountCost: 1250.0,
  },
];

const AVAILABLE_CATEGORIES = [
  'All Categories',
  'Pizza',
  'Pasta',
  'Burgers',
  'Starters',
  'Main Course',
  'Desserts',
  'Beverages',
  'Salads',
];

export default function RestaurantPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFunding, setFilterFunding] = useState<'ALL' | 'RESTAURANT' | 'PLATFORM'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'>('ALL');

  // ── Screen 32: Create / Edit Promotion Modal State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFundingSource, setFormFundingSource] = useState<FundingSource>('RESTAURANT_FUNDED');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [formDiscountValue, setFormDiscountValue] = useState('20');
  const [formMinOrderValue, setFormMinOrderValue] = useState('20.00');
  const [formMaxDiscount, setFormMaxDiscount] = useState('8.00');
  const [formSelectedCategories, setFormSelectedCategories] = useState<string[]>(['All Categories']);
  const [formApplicableItems, setFormApplicableItems] = useState('All Items');
  const [formStartDate, setFormStartDate] = useState('2026-11-15');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formUsageLimit, setFormUsageLimit] = useState('500');
  const [formUserLimit, setFormUserLimit] = useState('1');
  const [formIsActive, setFormIsActive] = useState(true);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPromoId(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormFundingSource('RESTAURANT_FUNDED');
    setFormDiscountType('PERCENTAGE');
    setFormDiscountValue('15');
    setFormMinOrderValue('20.00');
    setFormMaxDiscount('6.00');
    setFormSelectedCategories(['All Categories']);
    setFormApplicableItems('All Items');
    setFormStartDate('2026-11-15');
    setFormEndDate('2026-12-31');
    setFormUsageLimit('300');
    setFormUserLimit('1');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Promotion) => {
    setEditingPromoId(p.id);
    setFormName(p.name);
    setFormCode(p.code);
    setFormDescription(p.description);
    setFormFundingSource(p.fundingSource);
    setFormDiscountType(p.discountType);
    setFormDiscountValue(p.discountValue.toString());
    setFormMinOrderValue(p.minOrderValue.toString());
    setFormMaxDiscount(p.maxDiscount ? p.maxDiscount.toString() : '');
    setFormSelectedCategories(p.applicableCategories);
    setFormApplicableItems(p.applicableItems.join(', '));
    setFormStartDate(p.startDate);
    setFormEndDate(p.endDate);
    setFormUsageLimit(p.usageLimit.toString());
    setFormUserLimit(p.userLimit.toString());
    setFormIsActive(p.status === 'ACTIVE');
    setIsModalOpen(true);
  };

  // Toggle Category selection
  const toggleCategory = (cat: string) => {
    if (cat === 'All Categories') {
      setFormSelectedCategories(['All Categories']);
      return;
    }
    setFormSelectedCategories((prev) => {
      const withoutAll = prev.filter((c) => c !== 'All Categories');
      if (withoutAll.includes(cat)) {
        const next = withoutAll.filter((c) => c !== cat);
        return next.length === 0 ? ['All Categories'] : next;
      } else {
        return [...withoutAll, cat];
      }
    });
  };

  // Dynamic Financial Impact Calculation (Screen 32)
  const calcDiscountNum = parseFloat(formDiscountValue) || 0;
  const calcMinSpendNum = parseFloat(formMinOrderValue) || 20;
  const calcMaxDiscNum = parseFloat(formMaxDiscount) || (calcDiscountNum > 0 ? (calcMinSpendNum * calcDiscountNum) / 100 : 0);
  const calcUsageNum = parseInt(formUsageLimit) || 100;

  const estimatedAvgBasket = Math.max(calcMinSpendNum * 1.35, 25.0);
  const avgDiscountPerOrder =
    formDiscountType === 'PERCENTAGE'
      ? Math.min((estimatedAvgBasket * calcDiscountNum) / 100, calcMaxDiscNum || 999)
      : Math.min(calcDiscountNum, estimatedAvgBasket);

  const estimatedCampaignGrossSales = estimatedAvgBasket * calcUsageNum;
  const totalCampaignDiscountCost = avgDiscountPerOrder * calcUsageNum;
  const restaurantAbsorbedCost =
    formFundingSource === 'RESTAURANT_FUNDED' ? totalCampaignDiscountCost : 0.0;
  const platformAbsorbedCost =
    formFundingSource === 'PLATFORM_FUNDED' ? totalCampaignDiscountCost : 0.0;
  const estimatedNetProfitIncrease =
    (estimatedCampaignGrossSales - totalCampaignDiscountCost) * 0.45; // ~45% net food contribution

  // Save Promo (Screen 32)
  const handleSavePromo = () => {
    if (!formName.trim() || !formCode.trim()) {
      toast.error('Please enter promotion name and coupon code');
      return;
    }

    const newPromo: Promotion = {
      id: editingPromoId || `promo-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      description: formDescription.trim(),
      fundingSource: formFundingSource,
      discountType: formDiscountType,
      discountValue: parseFloat(formDiscountValue) || 0,
      minOrderValue: parseFloat(formMinOrderValue) || 0,
      maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : undefined,
      applicableCategories: formSelectedCategories,
      applicableItems: formApplicableItems
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      startDate: formStartDate,
      endDate: formEndDate,
      usageLimit: parseInt(formUsageLimit) || 100,
      currentUsage: editingPromoId
        ? promotions.find((p) => p.id === editingPromoId)?.currentUsage || 0
        : 0,
      userLimit: parseInt(formUserLimit) || 1,
      status: formIsActive ? 'ACTIVE' : 'PAUSED',
      estimatedGrossRevenue: estimatedCampaignGrossSales,
      estimatedDiscountCost: totalCampaignDiscountCost,
    };

    if (editingPromoId) {
      setPromotions((prev) => prev.map((p) => (p.id === editingPromoId ? newPromo : p)));
      toast.success(`Promotion "${newPromo.name}" updated successfully`);
    } else {
      setPromotions((prev) => [newPromo, ...prev]);
      toast.success(`Promotion "${newPromo.name}" created and launched`);
    }

    setIsModalOpen(false);
  };

  // Toggle Pause / Active
  const handleToggleStatus = (promoId: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const nextStatus: PromoStatus = p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          toast.info(`Promotion ${p.code} is now ${nextStatus}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Delete Promo
  const handleDeletePromo = (promoId: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promoId));
    toast.success('Promotion deleted');
  };

  // Copy code
  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied to clipboard`);
  };

  // Filtered List
  const filteredPromos = promotions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterFunding === 'RESTAURANT' && p.fundingSource !== 'RESTAURANT_FUNDED') return false;
    if (filterFunding === 'PLATFORM' && p.fundingSource !== 'PLATFORM_FUNDED') return false;

    if (filterStatus === 'ACTIVE' && p.status !== 'ACTIVE') return false;
    if (filterStatus === 'SCHEDULED' && p.status !== 'SCHEDULED') return false;
    if (filterStatus === 'EXPIRED' && p.status !== 'EXPIRED') return false;

    return true;
  });

  // Aggregated Summary
  const totalRestaurantFundedSpend = promotions
    .filter((p) => p.fundingSource === 'RESTAURANT_FUNDED')
    .reduce((acc, p) => acc + (p.estimatedDiscountCost * (p.currentUsage / (p.usageLimit || 1))), 0);

  const totalPlatformFundedGrant = promotions
    .filter((p) => p.fundingSource === 'PLATFORM_FUNDED')
    .reduce((acc, p) => acc + (p.estimatedDiscountCost * (p.currentUsage / (p.usageLimit || 1))), 0);

  const totalRevenueGenerated = promotions.reduce(
    (acc, p) => acc + (p.estimatedGrossRevenue * (p.currentUsage / (p.usageLimit || 1))),
    0
  );

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* ──────────────────────────────────────────────────────────────────────────
          HEADER & CREATE ACTION
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FCD223]/10 p-2 text-[#FCD223]">
              <Percent className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Promotions &amp; Discounts
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Create coupon codes, percentage discounts, and track revenue lift with clear separation of restaurant-funded and GOZOLT platform-funded campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10 cursor-pointer"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Promotion
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FINANCIAL PERFORMANCE SUMMARY CARDS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Revenue Lift
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            €{totalRevenueGenerated.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500">
            Gross customer cart spend driven by promo codes
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-[#121214] p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Restaurant-Funded
            </span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            €{totalRestaurantFundedSpend.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400">
            Total discounts funded from restaurant margin
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-[#121214] p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              GOZOLT Platform Co-Op
            </span>
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            €{totalPlatformFundedGrant.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400">
            100% subsidized by Gozolt marketing grants
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Campaigns
            </span>
            <div className="rounded-lg bg-[#FCD223]/10 p-1.5 text-[#FCD223]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FCD223] font-mono">
            {promotions.filter((p) => p.status === 'ACTIVE').length}{' '}
            <span className="text-sm font-normal text-zinc-400">/ {promotions.length}</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Live promotions currently redeemable by customers
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FUNDING SEPARATION NOTICE BANNER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[#FCD223] shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Campaign Funding Architecture</span>
              <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">
                Restaurant-Funded
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[10px]">
                Platform-Funded (GOZOLT)
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Promotions are strictly classified into restaurant-funded discounts and platform-subsidized growth campaigns. Platform-funded campaigns do not deduct from your food payout settlements.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 31: PROMOTIONS LISTING (FILTERS & TABLE)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#FCD223]" />
              Promotions Listing
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage live coupon codes, usage allowances, and menu targeting
            </p>
          </div>

          {/* Funding Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterFunding('ALL')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                filterFunding === 'ALL'
                  ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                  : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
              )}
            >
              All Types ({promotions.length})
            </button>
            <button
              onClick={() => setFilterFunding('RESTAURANT')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                filterFunding === 'RESTAURANT'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
              )}
            >
              Restaurant-Funded
            </button>
            <button
              onClick={() => setFilterFunding('PLATFORM')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                filterFunding === 'PLATFORM'
                  ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                  : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
              )}
            >
              Platform-Funded (Co-Op)
            </button>
          </div>
        </div>

        {/* Search & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              placeholder="Search promotion name, code, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs border-white/10 bg-[#18181B] text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Status:</span>
            {(['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all border cursor-pointer',
                  filterStatus === st
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* PROMOTIONS TABLE */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#18181B]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="py-3 px-4">Promotion Name</th>
                <th className="py-3 px-4">Promotion Type</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPromos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No promotions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPromos.map((promo) => {
                  const usagePercent = Math.min(
                    Math.round((promo.currentUsage / (promo.usageLimit || 1)) * 100),
                    100
                  );

                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Promotion Name */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{promo.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="rounded bg-[#FCD223]/10 px-1.5 py-0.5 text-[10px] font-black text-[#FCD223]">
                              {promo.code}
                            </span>
                            <button
                              onClick={() => copyPromoCode(promo.code)}
                              className="text-zinc-500 hover:text-white p-0.5"
                              title="Copy code"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-[10px] text-zinc-400 max-w-xs truncate">
                            {promo.description}
                          </p>
                        </div>
                      </td>

                      {/* Promotion Type & Funding */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge
                            className={cn(
                              'text-[10px] font-bold border',
                              promo.fundingSource === 'PLATFORM_FUNDED'
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                            )}
                          >
                            {promo.fundingSource === 'PLATFORM_FUNDED'
                              ? 'GOZOLT Co-Op'
                              : 'Restaurant-Funded'}
                          </Badge>
                          <p className="text-[10px] text-zinc-400">
                            {promo.discountType === 'PERCENTAGE'
                              ? 'Cart Percentage (%)'
                              : 'Fixed Cart Credit (€)'}
                          </p>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white text-xs">
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}% OFF`
                            : `€${promo.discountValue.toFixed(2)} OFF`}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Min. €{promo.minOrderValue.toFixed(2)}
                          {promo.maxDiscount && ` • Cap €${promo.maxDiscount.toFixed(2)}`}
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-3 px-4 font-mono text-zinc-300 text-[11px]">
                        {promo.startDate}
                      </td>

                      {/* End Date */}
                      <td className="py-3 px-4 font-mono text-zinc-300 text-[11px]">
                        {promo.endDate}
                      </td>

                      {/* Usage */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mb-1">
                          <span>
                            {promo.currentUsage} / {promo.usageLimit}
                          </span>
                          <span className="text-[10px] text-zinc-500">{usagePercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              usagePercent >= 90
                                ? 'bg-red-400'
                                : usagePercent >= 50
                                ? 'bg-[#FCD223]'
                                : 'bg-emerald-400'
                            )}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            'text-[10px] font-bold border font-mono',
                            promo.status === 'ACTIVE' &&
                              'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                            promo.status === 'SCHEDULED' &&
                              'border-blue-500/30 bg-blue-500/10 text-blue-400',
                            promo.status === 'PAUSED' &&
                              'border-amber-500/30 bg-amber-500/10 text-amber-400',
                            promo.status === 'EXPIRED' &&
                              'border-zinc-500/30 bg-zinc-500/10 text-zinc-400'
                          )}
                        >
                          {promo.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(promo.id)}
                            className={cn(
                              'rounded-lg p-1.5 transition-all text-xs font-bold border cursor-pointer',
                              promo.status === 'ACTIVE'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            )}
                            title={promo.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                          >
                            {promo.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>

                          <button
                            onClick={() => openEditModal(promo)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Edit Promotion"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                            title="Delete Promotion"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 32: CREATE / EDIT PROMOTION MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#0E0E10] p-6 sm:p-7 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#FCD223]" />
              {editingPromoId ? 'Edit Promotion Campaign' : 'Create Promotion'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure campaign discounts, funding allocation, scope rules, and simulate estimated financial lift.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Funding Source Selector (Required: Clearly separate restaurant & platform funded) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200">
                Campaign Funding Source *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFormFundingSource('RESTAURANT_FUNDED')}
                  className={cn(
                    'rounded-xl border p-3.5 cursor-pointer transition-all space-y-1',
                    formFundingSource === 'RESTAURANT_FUNDED'
                      ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'border-white/10 bg-[#18181B] hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-amber-400" />
                      Restaurant-Funded
                    </span>
                    {formFundingSource === 'RESTAURANT_FUNDED' && (
                      <Check className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Discounts are deducted directly from your restaurant's order margins to boost volume.
                  </p>
                </div>

                <div
                  onClick={() => setFormFundingSource('PLATFORM_FUNDED')}
                  className={cn(
                    'rounded-xl border p-3.5 cursor-pointer transition-all space-y-1',
                    formFundingSource === 'PLATFORM_FUNDED'
                      ? 'border-blue-400 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.15)]'
                      : 'border-white/10 bg-[#18181B] hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                      Platform-Funded (GOZOLT Co-Op)
                    </span>
                    {formFundingSource === 'PLATFORM_FUNDED' && (
                      <Check className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Subsidized by Gozolt marketing growth budget. Zero deduction from your payout settlement.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info: Name, Code & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-200">Promotion Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Midweek Pizza Feast"
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">Promo Code *</label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PIZZA20"
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-200">Description</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Briefly explain the terms or highlight of this promo..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCD223]/50"
              />
            </div>

            {/* Discount Mechanics: Type, Value, Min Spend, Max Cap */}
            <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#FCD223]" />
                Discount Structure &amp; Limits
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Discount Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Discount Type</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#0E0E10] px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (€)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Discount Value *</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      className="text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                      {formDiscountType === 'PERCENTAGE' ? '%' : '€'}
                    </span>
                  </div>
                </div>

                {/* Minimum Order Value */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Min. Order Value</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                      €
                    </span>
                    <Input
                      type="number"
                      step="1"
                      value={formMinOrderValue}
                      onChange={(e) => setFormMinOrderValue(e.target.value)}
                      className="pl-6 text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                    />
                  </div>
                </div>

                {/* Maximum Discount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">Max. Discount Cap</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                      €
                    </span>
                    <Input
                      type="number"
                      step="1"
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value)}
                      placeholder="Optional"
                      className="pl-6 text-xs border-white/10 bg-[#0E0E10] text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scope: Applicable Categories & Items */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-200">Applicable Categories</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isSelected = formSelectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer',
                          isSelected
                            ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                            : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">
                  Applicable Food Items (Comma-separated or &quot;All Items&quot;)
                </label>
                <Input
                  value={formApplicableItems}
                  onChange={(e) => setFormApplicableItems(e.target.value)}
                  placeholder="e.g. Diavola Pizza, Margherita, Truffle Pasta"
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white"
                />
              </div>
            </div>

            {/* Campaign Schedule & Limits */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-200">Start Date *</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">End Date *</label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">Total Usage Limit</label>
                <Input
                  type="number"
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(e.target.value)}
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">Per-Customer Limit</label>
                <Input
                  type="number"
                  value={formUserLimit}
                  onChange={(e) => setFormUserLimit(e.target.value)}
                  className="mt-1 text-xs border-white/10 bg-[#18181B] text-white font-mono"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#18181B]">
              <div>
                <span className="text-xs font-bold text-white">Active Status</span>
                <p className="text-[11px] text-zinc-400">
                  When active, customers can immediately apply this promo code at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormIsActive(!formIsActive)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer',
                  formIsActive ? 'bg-emerald-500' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-black transition-transform',
                    formIsActive ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* ──────────────────────────────────────────────────────────────────
                REQUIRED FEATURE: ESTIMATED FINANCIAL IMPACT SIMULATION
                ────────────────────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#FCD223]/30 bg-[#FCD223]/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#FCD223] flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4" />
                  Estimated Financial Impact &amp; ROI Simulator
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Based on {calcUsageNum} redemptions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-white/5 bg-[#121214] p-2.5">
                  <span className="text-[10px] text-zinc-400">Est. Gross Sales</span>
                  <p className="text-sm font-black text-white font-mono mt-0.5">
                    €{estimatedCampaignGrossSales.toFixed(0)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#121214] p-2.5">
                  <span className="text-[10px] text-zinc-400">Total Discounts</span>
                  <p className="text-sm font-black text-amber-300 font-mono mt-0.5">
                    €{totalCampaignDiscountCost.toFixed(0)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#121214] p-2.5">
                  <span className="text-[10px] text-zinc-400">
                    {formFundingSource === 'RESTAURANT_FUNDED' ? 'Restaurant Cost' : 'Gozolt Grant'}
                  </span>
                  <p
                    className={cn(
                      'text-sm font-black font-mono mt-0.5',
                      formFundingSource === 'RESTAURANT_FUNDED' ? 'text-amber-400' : 'text-blue-400'
                    )}
                  >
                    €{formFundingSource === 'RESTAURANT_FUNDED' ? restaurantAbsorbedCost.toFixed(0) : platformAbsorbedCost.toFixed(0)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#121214] p-2.5">
                  <span className="text-[10px] text-zinc-400">Est. Net Contribution</span>
                  <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                    +€{estimatedNetProfitIncrease.toFixed(0)}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Info className="h-3 w-3 text-[#FCD223] shrink-0" />
                <span>
                  {formFundingSource === 'PLATFORM_FUNDED'
                    ? '100% of the €' + totalCampaignDiscountCost.toFixed(0) + ' customer discount is subsidized by Gozolt. Your payout rate is untouched.'
                    : 'Estimated ROI of ~3.2x gross revenue generated per €1 of restaurant discount investment.'}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePromo}
              className="bg-[#FCD223] text-black font-bold text-xs hover:bg-[#FCD223]/90 shadow-md shadow-[#FCD223]/10 cursor-pointer"
            >
              {editingPromoId ? 'Update Promotion' : 'Launch Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
