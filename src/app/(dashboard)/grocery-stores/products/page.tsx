'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  Tag,
  Euro,
  Loader2,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  Grid,
  List,
  RefreshCw,
  Barcode,
  Package,
  Check,
  Flame,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import {
  foodGrocerySupplierService,
  type SupplierItem,
  type SupplierCategory,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export interface GroceryProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  categoryId: string;
  description: string;
  unitPrice: number;
  unitMeasure: string; // e.g. "1L Bottle", "500g Pack", "Per kg"
  stockCount: number;
  isAvailable: boolean;
  isPopular: boolean;
  isOrganic: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  imageUrl: string;
}

const DEFAULT_GROCERY_PRODUCTS: GroceryProduct[] = [
  {
    id: 'prod-1',
    name: 'Fresh Organic Whole Milk 1L',
    sku: 'GZ-DRY-1001',
    barcode: '800123456781',
    category: 'Dairy, Eggs & Fresh Cheeses',
    categoryId: 'aisle-2',
    description: 'Farm-fresh pasteurized whole milk from grass-fed cows. Chilled daily.',
    unitPrice: 1.85,
    unitMeasure: '1 Litre bottle',
    stockCount: 42,
    isAvailable: true,
    isPopular: true,
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  },
  {
    id: 'prod-2',
    name: 'Hass Avocados (Pack of 4)',
    sku: 'GZ-PRD-2004',
    barcode: '800123456782',
    category: 'Fresh Fruits & Vegetables',
    categoryId: 'aisle-1',
    description: 'Ready-to-eat creamy Mediterranean Hass avocados. High in good fats.',
    unitPrice: 3.90,
    unitMeasure: 'Pack of 4',
    stockCount: 18,
    isAvailable: true,
    isPopular: true,
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
  },
  {
    id: 'prod-3',
    name: 'Artisan Country Sourdough Loaf',
    sku: 'GZ-BKY-3001',
    barcode: '800123456783',
    category: 'Artisan Bakery & Morning Bread',
    categoryId: 'aisle-3',
    description: 'Slow-fermented 36-hour sourdough boule with a crisp blistered crust.',
    unitPrice: 2.75,
    unitMeasure: '500g Boule',
    stockCount: 14,
    isAvailable: true,
    isPopular: true,
    isOrganic: false,
    isVegan: true,
    isGlutenFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80',
  },
  {
    id: 'prod-4',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    sku: 'GZ-PNT-4001',
    barcode: '800123456784',
    category: 'Pantry, Pasta & Extra Virgin Olive Oils',
    categoryId: 'aisle-4',
    description: 'Single-estate first cold-pressed Sicilian olive oil with peppery herbal notes.',
    unitPrice: 9.80,
    unitMeasure: '750ml Dark Glass',
    stockCount: 26,
    isAvailable: true,
    isPopular: false,
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  },
  {
    id: 'prod-5',
    name: 'Free-Range Organic Eggs (10-Pack)',
    sku: 'GZ-DRY-1005',
    barcode: '800123456785',
    category: 'Dairy, Eggs & Fresh Cheeses',
    categoryId: 'aisle-2',
    description: 'Grade A fresh eggs from pasture-raised Maltese free-range hens.',
    unitPrice: 3.40,
    unitMeasure: 'Carton of 10',
    stockCount: 35,
    isAvailable: true,
    isPopular: true,
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  },
  {
    id: 'prod-6',
    name: 'Bronze-Die Penne Rigate 500g',
    sku: 'GZ-PNT-4008',
    barcode: '800123456786',
    category: 'Pantry, Pasta & Extra Virgin Olive Oils',
    categoryId: 'aisle-4',
    description: '100% Italian durum wheat semolina extruded through traditional bronze dies.',
    unitPrice: 1.65,
    unitMeasure: '500g Bag',
    stockCount: 60,
    isAvailable: true,
    isPopular: false,
    isOrganic: false,
    isVegan: true,
    isGlutenFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281744?w=400&q=80',
  },
  {
    id: 'prod-7',
    name: 'Natural Sparkling Mineral Water (6x1L)',
    sku: 'GZ-BEV-5002',
    barcode: '800123456787',
    category: 'Beverages, Spring Water & Juices',
    categoryId: 'aisle-5',
    description: 'Crisp mountain spring sparkling water bottled at the natural Alpine source.',
    unitPrice: 4.80,
    unitMeasure: '6x 1L Bottles',
    stockCount: 22,
    isAvailable: true,
    isPopular: false,
    isOrganic: false,
    isVegan: true,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&q=80',
  },
  {
    id: 'prod-8',
    name: 'Roasted Mediterranean Almonds 200g',
    sku: 'GZ-SNK-6003',
    barcode: '800123456788',
    category: 'Snacks, Roasted Nuts & Confectionery',
    categoryId: 'aisle-6',
    description: 'Dry roasted with Gozo sea salt and cold-pressed olive oil.',
    unitPrice: 3.25,
    unitMeasure: '200g Pouch',
    stockCount: 0,
    isAvailable: false,
    isPopular: false,
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80',
  },
];

function GroceryProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<GroceryProduct[]>(DEFAULT_GROCERY_PRODUCTS);
  const [categories, setCategories] = useState<string[]>([
    'All Aisles',
    'Fresh Fruits & Vegetables',
    'Dairy, Eggs & Fresh Cheeses',
    'Artisan Bakery & Morning Bread',
    'Pantry, Pasta & Extra Virgin Olive Oils',
    'Beverages, Spring Water & Juices',
    'Snacks, Roasted Nuts & Confectionery',
    'Household & Eco Cleaning Essentials',
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All Aisles');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<GroceryProduct | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Fresh Fruits & Vegetables');
  const [formDescription, setFormDescription] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState('2.50');
  const [formUnitMeasure, setFormUnitMeasure] = useState('1 Unit');
  const [formStockCount, setFormStockCount] = useState(25);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsOrganic, setFormIsOrganic] = useState(false);
  const [formIsVegan, setFormIsVegan] = useState(false);
  const [formIsGlutenFree, setFormIsGlutenFree] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Image upload refs & handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const capitalizeFirst = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format', {
        description: 'Please select an image file (PNG, JPG, WEBP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
        toast.success('Product image uploaded', { description: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  // Load from backend if available
  useEffect(() => {
    async function loadData() {
      try {
        const menu = await foodGrocerySupplierService.getMenu();
        if (menu?.items && menu.items.length > 0) {
          const mapped: GroceryProduct[] = menu.items.map((it) => ({
            id: it.id,
            name: it.name,
            sku: it.sku || `GZ-PRD-${it.id.slice(0, 4)}`,
            barcode: '80012345' + Math.floor(1000 + Math.random() * 9000),
            category: it.category || 'Pantry, Pasta & Extra Virgin Olive Oils',
            categoryId: it.categoryId || 'aisle-4',
            description: it.description || '',
            unitPrice: it.basePrice || 2.5,
            unitMeasure: '1 Unit',
            stockCount: it.isAvailable ? 30 : 0,
            isAvailable: it.isAvailable,
            isPopular: it.isPopular || false,
            isOrganic: false,
            isVegan: it.isVegan || false,
            isGlutenFree: it.isGlutenFree || false,
            imageUrl: it.imageUrl || it.images?.[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load menu products, using supermarket defaults:', err);
      }
    }
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.barcode.includes(searchQuery);

      const matchCat =
        selectedCategory === 'All Aisles' || prod.category === selectedCategory;

      const matchStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && prod.isAvailable) ||
        (stockFilter === 'OUT_OF_STOCK' && !prod.isAvailable);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormSku(`GZ-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormBarcode(`80012345${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory(categories[1] || 'Fresh Fruits & Vegetables');
    setFormDescription('');
    setFormUnitPrice('2.50');
    setFormUnitMeasure('1 Unit');
    setFormStockCount(25);
    setFormIsAvailable(true);
    setFormIsPopular(false);
    setFormIsOrganic(false);
    setFormIsVegan(false);
    setFormIsGlutenFree(false);
    setFormImageUrl('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: GroceryProduct) => {
    setSelectedProduct(prod);
    setFormName(prod.name);
    setFormSku(prod.sku);
    setFormBarcode(prod.barcode);
    setFormCategory(prod.category);
    setFormDescription(prod.description);
    setFormUnitPrice(prod.unitPrice.toFixed(2));
    setFormUnitMeasure(prod.unitMeasure);
    setFormStockCount(prod.stockCount);
    setFormIsAvailable(prod.isAvailable);
    setFormIsPopular(prod.isPopular);
    setFormIsOrganic(prod.isOrganic);
    setFormIsVegan(prod.isVegan);
    setFormIsGlutenFree(prod.isGlutenFree);
    setFormImageUrl(prod.imageUrl);
    setIsEditOpen(true);
  };

  const handleToggleStock = async (prod: GroceryProduct) => {
    const newStatus = !prod.isAvailable;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id ? { ...p, isAvailable: newStatus, stockCount: newStatus ? 20 : 0 } : p
      )
    );
    try {
      await foodGrocerySupplierService.toggleProductAvailability(prod.id, newStatus);
    } catch {
      // optimistic fallback
    }
    toast.success(
      newStatus ? `"${prod.name}" marked IN STOCK` : `"${prod.name}" marked OUT OF STOCK`,
      {
        description: newStatus
          ? 'Item is immediately available on the customer grocery app.'
          : 'Item disabled from checkout to prevent unfulfillable orders.',
      }
    );
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Product name is required');
      return;
    }
    const priceNum = parseFloat(formUnitPrice) || 2.5;

    const newProd: GroceryProduct = {
      id: `prod-${Date.now()}`,
      name: formName.trim(),
      sku: formSku.trim() || `GZ-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: formBarcode.trim() || `80012345${Math.floor(1000 + Math.random() * 9000)}`,
      category: formCategory,
      categoryId: 'aisle-gen',
      description: formDescription.trim(),
      unitPrice: priceNum,
      unitMeasure: formUnitMeasure.trim() || '1 Unit',
      stockCount: Number(formStockCount) || 0,
      isAvailable: formIsAvailable,
      isPopular: formIsPopular,
      isOrganic: formIsOrganic,
      isVegan: formIsVegan,
      isGlutenFree: formIsGlutenFree,
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsAddOpen(false);

    try {
      await foodGrocerySupplierService.createItem({
        name: newProd.name,
        sku: newProd.sku,
        categoryId: newProd.categoryId,
        category: newProd.category,
        description: newProd.description,
        basePrice: newProd.unitPrice,
        prepTime: '5-10 min',
        images: [newProd.imageUrl],
        isAvailable: newProd.isAvailable,
        isActive: true,
        isPopular: newProd.isPopular,
        isVegan: newProd.isVegan,
        isGlutenFree: newProd.isGlutenFree,
      });
    } catch {
      // optimistic
    }

    toast.success('Grocery Product Added', {
      description: `"${newProd.name}" is now listed at €${newProd.unitPrice.toFixed(2)}.`,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!formName.trim()) {
      toast.error('Product name is required');
      return;
    }

    const priceNum = parseFloat(formUnitPrice) || 2.5;
    const updated: GroceryProduct = {
      ...selectedProduct,
      name: formName.trim(),
      sku: formSku.trim() || selectedProduct.sku,
      barcode: formBarcode.trim() || selectedProduct.barcode,
      category: formCategory,
      description: formDescription.trim(),
      unitPrice: priceNum,
      unitMeasure: formUnitMeasure.trim() || selectedProduct.unitMeasure,
      stockCount: Number(formStockCount) || 0,
      isAvailable: formIsAvailable,
      isPopular: formIsPopular,
      isOrganic: formIsOrganic,
      isVegan: formIsVegan,
      isGlutenFree: formIsGlutenFree,
      imageUrl: formImageUrl.trim() || selectedProduct.imageUrl,
    };

    setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updated : p)));
    setIsEditOpen(false);

    try {
      await foodGrocerySupplierService.updateItem(selectedProduct.id, {
        name: updated.name,
        sku: updated.sku,
        category: updated.category,
        description: updated.description,
        basePrice: updated.unitPrice,
        isAvailable: updated.isAvailable,
        isPopular: updated.isPopular,
        isVegan: updated.isVegan,
        isGlutenFree: updated.isGlutenFree,
      });
    } catch {
      // optimistic
    }

    toast.success('Product Updated', {
      description: `Saved changes for "${updated.name}".`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    setIsDeleteOpen(false);
    try {
      await foodGrocerySupplierService.deleteItem(selectedProduct.id);
    } catch {
      // optimistic
    }
    toast.success('Product Removed', {
      description: `"${selectedProduct.name}" has been deleted from your store catalogue.`,
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
            <span className="text-[#FCD223]">Grocery Products</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Grocery Products Catalogue
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              {products.filter((p) => p.isAvailable).length} Available Products
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Manage supermarket barcodes, retail unit pricing, live shelf stock, and dietary tags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/grocery-stores/variants">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-[#121214] text-white hover:bg-white/5"
            >
              <Layers className="h-4 w-4 mr-1.5 text-[#FCD223]" />
              Pack Size Variants
            </Button>
          </Link>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Grocery Product
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER STRIP: SEARCH, AISLE DROPDOWN, STOCK FILTER, VIEW MODE
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or barcode..."
              maxLength={60}
              className="pl-10 bg-[#121214] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#121214] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter & View Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm">
            {(['ALL', 'IN_STOCK', 'OUT_OF_STOCK'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  stockFilter === filter
                    ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                {filter === 'ALL' ? 'All' : filter === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm">
            <button
              onClick={() => setViewMode('GRID')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'GRID' ? 'bg-white/10 text-white' : 'text-[#71717A] hover:text-white'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'TABLE' ? 'bg-white/10 text-white' : 'text-[#71717A] hover:text-white'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          PRODUCTS LIST: GRID OR TABLE
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-12 text-center text-[#71717A]">
          <Package className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No grocery products found</p>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, aisle filter, or add a new supermarket product.
          </p>
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="mt-4 rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Product
          </Button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group shadow-lg"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full bg-[#18181B] overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-black/20 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10 flex items-center gap-1">
                    <Barcode className="h-3 w-3 text-[#FCD223]" />
                    {prod.barcode}
                  </span>
                  {prod.isPopular && (
                    <span className="rounded-md bg-[#FCD223] px-2 py-0.5 text-[10px] font-black text-black flex items-center gap-1 shadow-md">
                      <Flame className="h-3 w-3" /> Top Seller
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <Badge
                    className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 shadow-md',
                      prod.isAvailable
                        ? 'bg-emerald-500 text-black font-extrabold'
                        : 'bg-red-500/80 text-white'
                    )}
                  >
                    {prod.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                  </Badge>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-black text-white drop-shadow-md">
                      €{prod.unitPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#A1A1AA] ml-1.5 font-medium">
                      /{prod.unitMeasure}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white/80 bg-black/60 px-1.5 py-0.5 rounded">
                    {prod.stockCount} left
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-[#FCD223] font-semibold uppercase tracking-wider line-clamp-1">
                    {prod.category}
                  </p>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5 group-hover:text-emerald-400 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Dietary badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {prod.isOrganic && (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      Organic
                    </span>
                  )}
                  {prod.isVegan && (
                    <span className="rounded bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
                      Vegan
                    </span>
                  )}
                  {prod.isGlutenFree && (
                    <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                      Gluten-Free
                    </span>
                  )}
                  <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[#A1A1AA]">
                    {prod.barcode}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#18181B] border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStock(prod)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    prod.isAvailable
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-red-400 hover:bg-red-500/10'
                  )}
                >
                  <Power className="h-3.5 w-3.5" />
                  {prod.isAvailable ? 'In Stock' : 'Out of Stock'}
                </button>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/grocery-stores/variants?productId=${prod.id}`}
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FCD223] hover:bg-white/5 transition-colors"
                    title="Manage Pack Variants"
                  >
                    <Layers className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[#A1A1AA] uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Product Name & Barcode</th>
                <th className="py-3.5">Aisle / Category</th>
                <th className="py-3.5">Retail Price</th>
                <th className="py-3.5">Unit Pack</th>
                <th className="py-3.5 text-center">Stock</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{prod.name}</p>
                        <p className="text-[11px] text-[#A1A1AA] font-mono flex items-center gap-1 mt-0.5">
                          <Barcode className="h-3 w-3 text-[#FCD223]" />
                          {prod.barcode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[#A1A1AA]">{prod.category}</td>
                  <td className="py-3 font-bold text-emerald-400 text-sm">€{prod.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-white font-medium">{prod.unitMeasure}</td>
                  <td className="py-3 text-center font-bold text-white">{prod.stockCount}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStock(prod)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all',
                        prod.isAvailable
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      )}
                    >
                      {prod.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </td>
                  <td className="py-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/grocery-stores/variants?productId=${prod.id}`}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FCD223] hover:bg-white/5 transition-colors"
                        title="Manage Pack Variants"
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
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
          MODAL: ADD GROCERY PRODUCT
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#FCD223]" />
              Add Grocery Product
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Define product identifiers, aisle placement, unit retail price, and stock levels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(capitalizeFirst(e.target.value))}
                  maxLength={70}
                  placeholder="Enter Product Name"
                  className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Barcode / EAN-13
                </label>
                <Input
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  maxLength={20}
                  placeholder="Enter Barcode / EAN-13"
                  className="bg-[#18181B] border-white/10 text-white font-mono text-xs rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Aisle / Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
                >
                  {categories.filter((c) => c !== 'All Aisles').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack / Unit Specification
                </label>
                <Input
                  value={formUnitMeasure}
                  onChange={(e) => setFormUnitMeasure(e.target.value)}
                  maxLength={30}
                  placeholder="Enter Unit / Pack Size"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
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
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(e.target.value)}
                    className="pl-8 bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Current Shelf Stock Units
                </label>
                <Input
                  type="number"
                  min="0"
                  max="9999"
                  placeholder="Enter Stock Units"
                  value={formStockCount}
                  onChange={(e) => setFormStockCount(parseInt(e.target.value) || 0)}
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between mb-1.5">
                  <span>Product Image</span>
                  <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
                </label>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleProductImageUpload}
                />

                {formImageUrl ? (
                  <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                    <div className="h-36 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                      <img src={formImageUrl} alt="Product preview" className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-medium border border-white/10">
                        Live Preview
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/10 text-xs text-white hover:bg-white/5 h-8 cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormImageUrl('')}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#18181B]/60 p-5 text-center hover:border-[#FCD223]/50 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                      Click to upload product image
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      PNG, JPG or WEBP (rec. 600×600px square, max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Description & Ingredients
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Enter Product Description, Ingredients & Provenance..."
                  className="w-full p-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs placeholder:text-xs focus:border-[#FCD223] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Checkbox dietary tags */}
            <div className="pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-2">
                Product Badges & Dietary Tags
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Available Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Top Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsOrganic}
                    onChange={(e) => setFormIsOrganic(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Organic Certified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsVegan}
                    onChange={(e) => setFormIsVegan(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Vegan Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsGlutenFree}
                    onChange={(e) => setFormIsGlutenFree(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Gluten-Free</span>
                </label>
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
                Add Product to Aisle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: EDIT GROCERY PRODUCT
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[#FCD223]" />
              Edit Grocery Product
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Update barcode, retail pricing, stock count, and dietary options.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(capitalizeFirst(e.target.value))}
                  maxLength={70}
                  placeholder="Enter Product Name"
                  className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Barcode / EAN-13
                </label>
                <Input
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  maxLength={20}
                  placeholder="Enter Barcode / EAN-13"
                  className="bg-[#18181B] border-white/10 text-white font-mono text-xs rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Aisle / Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs font-semibold focus:border-[#FCD223] focus:outline-none"
                >
                  {categories.filter((c) => c !== 'All Aisles').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Pack / Unit Specification
                </label>
                <Input
                  value={formUnitMeasure}
                  onChange={(e) => setFormUnitMeasure(e.target.value)}
                  maxLength={30}
                  placeholder="Enter Unit / Pack Size"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
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
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(e.target.value)}
                    className="pl-8 bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Current Shelf Stock Units
                </label>
                <Input
                  type="number"
                  min="0"
                  max="9999"
                  placeholder="Enter Stock Units"
                  value={formStockCount}
                  onChange={(e) => setFormStockCount(parseInt(e.target.value) || 0)}
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between mb-1.5">
                  <span>Product Image</span>
                  <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
                </label>

                {/* Hidden native file input */}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleProductImageUpload}
                />

                {formImageUrl ? (
                  <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                    <div className="h-36 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                      <img src={formImageUrl} alt="Product preview" className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-medium border border-white/10">
                        Live Preview
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editFileInputRef.current?.click()}
                        className="border-white/10 text-xs text-white hover:bg-white/5 h-8 cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormImageUrl('')}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#18181B]/60 p-5 text-center hover:border-[#FCD223]/50 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                      Click to upload product image
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      PNG, JPG or WEBP (rec. 600×600px square, max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Description & Ingredients
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Enter Product Description, Ingredients & Provenance..."
                  className="w-full p-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs placeholder:text-xs focus:border-[#FCD223] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Checkbox dietary tags */}
            <div className="pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-2">
                Product Badges & Dietary Tags
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Available Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Top Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsOrganic}
                    onChange={(e) => setFormIsOrganic(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Organic Certified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsVegan}
                    onChange={(e) => setFormIsVegan(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Vegan Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsGlutenFree}
                    onChange={(e) => setFormIsGlutenFree(e.target.checked)}
                    className="rounded accent-[#FCD223]"
                  />
                  <span>Gluten-Free</span>
                </label>
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
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Delete Grocery Product
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Are you sure you want to remove &quot;{selectedProduct?.name}&quot; from your store?
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
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GroceryProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FCD223]" />
        </div>
      }
    >
      <GroceryProductsContent />
    </Suspense>
  );
}
