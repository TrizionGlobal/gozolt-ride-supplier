'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShoppingBag,
  Euro,
  Loader2,
  ArrowRight,
  Tag,
  Copy,
  AlertCircle,
  Eye,
  Sliders,
  Check,
  Scale,
  RefreshCw,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  foodGrocerySupplierService,
  SupplierCategory,
  SupplierItem,
  SupplierVariant,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

type GroceryPackPreset =
  | 'Single'
  | '250g'
  | '500g'
  | '1kg'
  | '2kg'
  | '4-Pack'
  | '6-Pack'
  | '12-Pack Case'
  | 'Custom';

interface GroceryVariant {
  id: string;
  productId: string;
  name: string;
  packSize: GroceryPackPreset;
  sku: string;
  baseItemName: string;
  category: string;
  priceType: 'FIXED_PRICE' | 'PRICE_ADJUSTMENT';
  price: number;
  packSpec?: string; // e.g. "4x 250ml Bottles", "Vacuum Sealed 500g"
  displayOrder: number;
  isAvailable: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const PACK_PRESETS: { name: GroceryPackPreset; label: string }[] = [
  { name: 'Single', label: 'Single Unit' },
  { name: '250g', label: '250g Pack' },
  { name: '500g', label: '500g Pack' },
  { name: '1kg', label: '1kg Family Size' },
  { name: '2kg', label: '2kg Bulk Pack' },
  { name: '4-Pack', label: '4-Pack Bundle' },
  { name: '6-Pack', label: '6-Pack Multipack' },
  { name: '12-Pack Case', label: '12-Pack Case' },
  { name: 'Custom', label: 'Custom Pack Size' },
];

const DEFAULT_GROCERY_VARIANTS: GroceryVariant[] = [
  {
    id: 'var-1',
    productId: 'prod-1',
    name: '1 Litre Standard Bottle',
    packSize: 'Single',
    sku: 'GZ-DRY-1001-1L',
    baseItemName: 'Fresh Organic Whole Milk 1L',
    category: 'Dairy, Eggs & Fresh Cheeses',
    priceType: 'FIXED_PRICE',
    price: 1.85,
    packSpec: '1L Glass / Tetra Bottle',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-2',
    productId: 'prod-1',
    name: '2 Litre Family Jug',
    packSize: 'Custom',
    sku: 'GZ-DRY-1001-2L',
    baseItemName: 'Fresh Organic Whole Milk 1L',
    category: 'Dairy, Eggs & Fresh Cheeses',
    priceType: 'FIXED_PRICE',
    price: 3.40,
    packSpec: '2L Handle Jug (Save €0.30)',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-3',
    productId: 'prod-2',
    name: 'Single Ripe Avocado',
    packSize: 'Single',
    sku: 'GZ-PRD-2004-1PK',
    baseItemName: 'Hass Avocados (Pack of 4)',
    category: 'Fresh Fruits & Vegetables',
    priceType: 'FIXED_PRICE',
    price: 1.15,
    packSpec: '1x Ripe Ready-to-Eat',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-4',
    productId: 'prod-2',
    name: 'Pack of 4 Value Saver',
    packSize: '4-Pack',
    sku: 'GZ-PRD-2004-4PK',
    baseItemName: 'Hass Avocados (Pack of 4)',
    category: 'Fresh Fruits & Vegetables',
    priceType: 'FIXED_PRICE',
    price: 3.90,
    packSpec: '4-Pack Mesh Net',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-5',
    productId: 'prod-6',
    name: 'Standard 500g Bag',
    packSize: '500g',
    sku: 'GZ-PNT-4008-500G',
    baseItemName: 'Bronze-Die Penne Rigate 500g',
    category: 'Pantry, Pasta & Extra Virgin Olive Oils',
    priceType: 'FIXED_PRICE',
    price: 1.65,
    packSpec: '500g Paper Bag',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-6',
    productId: 'prod-6',
    name: 'Pantry 1kg Bag',
    packSize: '1kg',
    sku: 'GZ-PNT-4008-1KG',
    baseItemName: 'Bronze-Die Penne Rigate 500g',
    category: 'Pantry, Pasta & Extra Virgin Olive Oils',
    priceType: 'FIXED_PRICE',
    price: 2.95,
    packSpec: '1kg Bulk Bag (Save €0.35)',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-7',
    productId: 'prod-7',
    name: 'Single 1L Glass Bottle',
    packSize: 'Single',
    sku: 'GZ-BEV-5002-1BTL',
    baseItemName: 'Natural Sparkling Mineral Water (6x1L)',
    category: 'Beverages, Spring Water & Juices',
    priceType: 'FIXED_PRICE',
    price: 0.95,
    packSpec: '1L Glass Bottle',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-8',
    productId: 'prod-7',
    name: '6-Pack Case Shrinkwrap',
    packSize: '6-Pack',
    sku: 'GZ-BEV-5002-6PK',
    baseItemName: 'Natural Sparkling Mineral Water (6x1L)',
    category: 'Beverages, Spring Water & Juices',
    priceType: 'FIXED_PRICE',
    price: 4.80,
    packSpec: '6x 1L Bottles (Save €0.90)',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
];

function GroceryVariantsContent() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId') || 'all';

  const [variants, setVariants] = useState<GroceryVariant[]>(DEFAULT_GROCERY_VARIANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>(initialProductId);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    const pId = searchParams.get('productId');
    if (pId) {
      setSelectedProductFilter(pId);
    }
  }, [searchParams]);

  // Available Base Products
  const baseProducts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; category: string }>();
    variants.forEach((v) => {
      if (!map.has(v.productId)) {
        map.set(v.productId, { id: v.productId, name: v.baseItemName, category: v.category });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<GroceryVariant | null>(null);

  // Form Fields
  const [formProductId, setFormProductId] = useState(baseProducts[0]?.id || 'prod-1');
  const [formName, setFormName] = useState('');
  const [formPackSize, setFormPackSize] = useState<GroceryPackPreset>('500g');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('2.50');
  const [formPackSpec, setFormPackSpec] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  const capitalizeFirst = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Filtered variants
  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.baseItemName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProduct =
        selectedProductFilter === 'all' || v.productId === selectedProductFilter;

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && v.isAvailable) ||
        (statusFilter === 'INACTIVE' && !v.isAvailable);

      return matchSearch && matchProduct && matchStatus;
    });
  }, [variants, searchQuery, selectedProductFilter, statusFilter]);

  const handleOpenAdd = () => {
    const defaultProd = baseProducts[0];
    setFormProductId(defaultProd?.id || 'prod-1');
    setFormName('');
    setFormPackSize('500g');
    setFormSku(`GZ-VAR-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPrice('2.50');
    setFormPackSpec('');
    setFormDisplayOrder(variants.length + 1);
    setFormIsAvailable(true);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (v: GroceryVariant) => {
    setSelectedVariant(v);
    setFormProductId(v.productId);
    setFormName(v.name);
    setFormPackSize(v.packSize);
    setFormSku(v.sku);
    setFormPrice(v.price.toFixed(2));
    setFormPackSpec(v.packSpec || '');
    setFormDisplayOrder(v.displayOrder);
    setFormIsAvailable(v.isAvailable);
    setIsEditOpen(true);
  };

  const handleToggleAvailability = async (v: GroceryVariant) => {
    const newStatus = !v.isAvailable;
    setVariants((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, isAvailable: newStatus } : item))
    );
    try {
      await foodGrocerySupplierService.toggleVariantStatus(v.productId, v.id, newStatus);
    } catch {
      // optimistic
    }
    toast.success(
      newStatus ? `Variant "${v.name}" is now Available` : `Variant "${v.name}" marked Unavailable`,
      {
        description: newStatus
          ? 'Shoppers can select this pack size on the mobile app.'
          : 'Pack option disabled from cart selection.',
      }
    );
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Variant / pack name is required');
      return;
    }
    const targetBase = baseProducts.find((b) => b.id === formProductId);
    const priceNum = parseFloat(formPrice) || 2.5;

    const newVar: GroceryVariant = {
      id: `var-${Date.now()}`,
      productId: formProductId,
      name: formName.trim(),
      packSize: formPackSize,
      sku: formSku.trim() || `GZ-VAR-${Math.floor(1000 + Math.random() * 9000)}`,
      baseItemName: targetBase?.name || 'Selected Grocery Item',
      category: targetBase?.category || 'General Grocery',
      priceType: 'FIXED_PRICE',
      price: priceNum,
      packSpec: formPackSpec.trim() || undefined,
      displayOrder: Number(formDisplayOrder) || 1,
      isAvailable: formIsAvailable,
      status: 'ACTIVE',
    };

    setVariants((prev) => [...prev, newVar]);
    setIsAddOpen(false);

    try {
      await foodGrocerySupplierService.createVariant(formProductId, {
        name: newVar.name,
        sku: newVar.sku,
        variantSize: newVar.packSize,
        price: newVar.price,
        portionSpec: newVar.packSpec,
        displayOrder: newVar.displayOrder,
        isAvailable: newVar.isAvailable,
      });
    } catch {
      // optimistic
    }

    toast.success('Pack Variant Added', {
      description: `"${newVar.name}" created at €${newVar.price.toFixed(2)}.`,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    if (!formName.trim()) {
      toast.error('Variant / pack name is required');
      return;
    }
    const targetBase = baseProducts.find((b) => b.id === formProductId);
    const priceNum = parseFloat(formPrice) || 2.5;

    const updated: GroceryVariant = {
      ...selectedVariant,
      productId: formProductId,
      name: formName.trim(),
      packSize: formPackSize,
      sku: formSku.trim() || selectedVariant.sku,
      baseItemName: targetBase?.name || selectedVariant.baseItemName,
      category: targetBase?.category || selectedVariant.category,
      price: priceNum,
      packSpec: formPackSpec.trim() || undefined,
      displayOrder: Number(formDisplayOrder) || 1,
      isAvailable: formIsAvailable,
    };

    setVariants((prev) => prev.map((v) => (v.id === selectedVariant.id ? updated : v)));
    setIsEditOpen(false);

    try {
      await foodGrocerySupplierService.updateVariant(formProductId, selectedVariant.id, {
        name: updated.name,
        sku: updated.sku,
        variantSize: updated.packSize,
        price: updated.price,
        portionSpec: updated.packSpec,
        displayOrder: updated.displayOrder,
        isAvailable: updated.isAvailable,
      });
    } catch {
      // optimistic
    }

    toast.success('Pack Variant Updated', {
      description: `Saved changes for "${updated.name}".`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedVariant) return;
    setVariants((prev) => prev.filter((v) => v.id !== selectedVariant.id));
    setIsDeleteOpen(false);

    try {
      await foodGrocerySupplierService.deleteVariant(selectedVariant.productId, selectedVariant.id);
    } catch {
      // optimistic
    }

    toast.success('Pack Variant Removed', {
      description: `"${selectedVariant.name}" has been deleted.`,
    });
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
            <span className="text-[#FCD223]">Product Variants & Pack Sizes</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Pack Sizes & Weight Variants
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              {variants.filter((v) => v.isAvailable).length} Active Pack Options
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Configure multi-packs, weight tiers (250g, 500g, 1kg), volume bottles, and case pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/grocery-stores/products">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5"
            >
              <ShoppingBag className="h-4 w-4 mr-1.5 text-[#FCD223]" />
              View Products Catalogue
            </Button>
          </Link>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Pack Size Variant
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by variant name or parent product..."
              maxLength={60}
              className="pl-10 bg-[#121214] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
            />
          </div>

          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#121214] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
          >
            <option value="all">All Parent Products</option>
            {baseProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm self-start sm:self-center">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                statusFilter === status
                  ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                  : 'text-[#A1A1AA] hover:text-white'
              )}
            >
              {status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          VARIANTS TABLE
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredVariants.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-12 text-center text-[#71717A]">
          <Layers className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No pack variants found</p>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
            Create pack sizes (e.g. 500g, 1kg, 6-Pack) for products that offer multiple quantity choices.
          </p>
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="mt-4 rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[#A1A1AA] uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Pack Size & Name</th>
                <th className="py-3.5">Parent Grocery Item</th>
                <th className="py-3.5">Pack Specification</th>
                <th className="py-3.5">Retail Price</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVariants.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#FCD223]/10 border border-[#FCD223]/30 px-2 py-0.5 text-xs font-bold text-[#FCD223]">
                        {v.packSize}
                      </span>
                      <span className="font-bold text-white text-sm">{v.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-white/90">
                    <p className="font-semibold text-white">{v.baseItemName}</p>
                    <p className="text-[11px] text-[#A1A1AA]">{v.category}</p>
                  </td>
                  <td className="py-3 text-white/80">{v.packSpec || '—'}</td>
                  <td className="py-3 font-black text-emerald-400 text-sm">€{v.price.toFixed(2)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleAvailability(v)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all',
                        v.isAvailable
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      )}
                    >
                      {v.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </td>
                  <td className="py-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: ADD VARIANT
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#FCD223]" />
              Add Pack Size Variant
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Define pack size tier, retail price, and packaging details for a product.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Parent Grocery Product <span className="text-red-400">*</span>
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
              >
                {baseProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack Size Preset <span className="text-red-400">*</span>
                </label>
                <select
                  value={formPackSize}
                  onChange={(e) => setFormPackSize(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
                >
                  {PACK_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Retail Price (€) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#A1A1AA] font-bold">€</span>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.10"
                    max="500"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="pl-8 bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Variant Display Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(capitalizeFirst(e.target.value))}
                maxLength={60}
                placeholder="Enter Variant Display Name"
                className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Display Order
                </label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Enter Display Order"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack Specification Notes
                </label>
                <Input
                  value={formPackSpec}
                  onChange={(e) => setFormPackSpec(e.target.value)}
                  maxLength={60}
                  placeholder="Enter Pack Specification Notes"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
              >
                Add Variant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: EDIT VARIANT
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[#FCD223]" />
              Edit Pack Size Variant
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Update pricing and pack specifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Parent Grocery Product <span className="text-red-400">*</span>
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
              >
                {baseProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack Size Preset <span className="text-red-400">*</span>
                </label>
                <select
                  value={formPackSize}
                  onChange={(e) => setFormPackSize(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
                >
                  {PACK_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Retail Price (€) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#A1A1AA] font-bold">€</span>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.10"
                    max="500"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="pl-8 bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Variant Display Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(capitalizeFirst(e.target.value))}
                maxLength={60}
                placeholder="Enter Variant Display Name"
                className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Display Order
                </label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Enter Display Order"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack Specification Notes
                </label>
                <Input
                  value={formPackSpec}
                  onChange={(e) => setFormPackSpec(e.target.value)}
                  maxLength={60}
                  placeholder="Enter Pack Specification Notes"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: CONFIRM DELETE
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Delete Pack Variant
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Are you sure you want to remove &quot;{selectedVariant?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-500 font-bold text-white hover:bg-red-600"
            >
              Delete Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GroceryVariantsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-[#A1A1AA]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#FCD223]" />
          <p className="mt-2 text-xs">Loading pack variants...</p>
        </div>
      }
    >
      <GroceryVariantsContent />
    </Suspense>
  );
}
