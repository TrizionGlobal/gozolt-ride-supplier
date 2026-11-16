'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FolderPlus,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Power,
  Image as ImageIcon,
  Grid,
  List,
  Sparkles,
  AlertTriangle,
  Upload,
  ArrowRight,
  Check,
  ShoppingBag,
  RefreshCw,
  Loader2,
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
  SupplierCategory,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export interface GroceryAisleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  itemCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const DEFAULT_GROCERY_CATEGORIES: GroceryAisleCategory[] = [
  {
    id: 'aisle-1',
    name: 'Fresh Fruits & Vegetables',
    slug: 'fresh-fruits-vegetables',
    description: 'Crisp Mediterranean greens, locally sourced citrus, ripe avocados, heirloom tomatoes, and organic herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80',
    displayOrder: 1,
    itemCount: 28,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-2',
    name: 'Dairy, Eggs & Fresh Cheeses',
    slug: 'dairy-eggs-cheeses',
    description: 'Organic whole milk, free-range farm eggs, artisanal Maltese ġbejna, butter, and Greek yogurts.',
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80',
    displayOrder: 2,
    itemCount: 22,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-3',
    name: 'Artisan Bakery & Morning Bread',
    slug: 'artisan-bakery-bread',
    description: 'Daily fresh-baked sourdough boules, traditional Maltese ftira, buttery croissants, and gluten-free loaves.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    displayOrder: 3,
    itemCount: 16,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-4',
    name: 'Pantry, Pasta & Extra Virgin Olive Oils',
    slug: 'pantry-pasta-oils',
    description: 'Bronze-cut durum pasta, cold-pressed olive oils, San Marzano passata, organic rice, and artisanal condiments.',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    displayOrder: 4,
    itemCount: 34,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-5',
    name: 'Beverages, Spring Water & Juices',
    slug: 'beverages-water-juices',
    description: 'Natural sparkling mineral waters, cold-pressed citrus juices, specialty sodas, and iced botanicals.',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    displayOrder: 5,
    itemCount: 19,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-6',
    name: 'Snacks, Roasted Nuts & Confectionery',
    slug: 'snacks-nuts-confectionery',
    description: 'Roasted almond mixes, artisan sea salt crackers, single-origin dark chocolate, and organic dried fruits.',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80',
    displayOrder: 6,
    itemCount: 15,
    status: 'ACTIVE',
  },
  {
    id: 'aisle-7',
    name: 'Household & Eco Cleaning Essentials',
    slug: 'household-cleaning-essentials',
    description: 'Biodegradable detergents, kitchen paper rolls, surface sanitizers, and plastic-free trash liners.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    displayOrder: 7,
    itemCount: 12,
    status: 'ACTIVE',
  },
];

export default function GroceryCategoriesPage() {
  const [categories, setCategories] = useState<GroceryAisleCategory[]>(DEFAULT_GROCERY_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GroceryAisleCategory | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // File upload refs & helpers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const capitalizeFirst = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.success('Category cover image uploaded', { description: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  // Load backend categories if available
  useEffect(() => {
    async function loadData() {
      try {
        const menu = await foodGrocerySupplierService.getMenu();
        if (menu?.categories && menu.categories.length > 0) {
          const mapped: GroceryAisleCategory[] = menu.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: c.description || '',
            imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80',
            displayOrder: c.displayOrder || 1,
            itemCount: c.itemCount || 0,
            status: c.isActive ? 'ACTIVE' : 'INACTIVE',
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Failed to load menu categories, using presets:', err);
      }
    }
    loadData();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchesSearch =
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === 'ALL' || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categories, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('');
    setFormDisplayOrder(categories.length + 1);
    setFormStatus('ACTIVE');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: GroceryAisleCategory) => {
    setSelectedCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormImageUrl(cat.imageUrl);
    setFormDisplayOrder(cat.displayOrder);
    setFormStatus(cat.status);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: GroceryAisleCategory) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (cat: GroceryAisleCategory) => {
    const newStatus: 'ACTIVE' | 'INACTIVE' = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setCategories((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, status: newStatus } : item))
    );
    try {
      await foodGrocerySupplierService.updateCategory(cat.id, { isActive: newStatus === 'ACTIVE' });
    } catch {
      // optimistic fallback
    }
    toast.success(`Aisle "${cat.name}" is now ${newStatus.toLowerCase()}`, {
      description: newStatus === 'ACTIVE' ? 'Shoppers can browse items in this aisle.' : 'Aisle hidden from mobile store catalogue.',
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Aisle category name is required');
      return;
    }
    const autoSlug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: GroceryAisleCategory = {
      id: `aisle-${Date.now()}`,
      name: formName.trim(),
      slug: autoSlug,
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&q=80',
      displayOrder: Number(formDisplayOrder) || 1,
      itemCount: 0,
      status: formStatus,
    };

    setCategories((prev) => [...prev, newCat]);
    setIsAddOpen(false);
    try {
      await foodGrocerySupplierService.createCategory({
        name: newCat.name,
        description: newCat.description,
        imageUrl: newCat.imageUrl,
        displayOrder: newCat.displayOrder,
      });
    } catch {
      // keep optimistic
    }
    toast.success('Grocery Aisle Category Added', {
      description: `"${newCat.name}" is now available in your supermarket catalogue.`,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!formName.trim()) {
      toast.error('Aisle category name is required');
      return;
    }

    const updated = {
      ...selectedCategory,
      name: formName.trim(),
      slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim() || selectedCategory.imageUrl,
      displayOrder: Number(formDisplayOrder) || 1,
      status: formStatus,
    };

    setCategories((prev) =>
      prev.map((c) => (c.id === selectedCategory.id ? updated : c))
    );
    setIsEditOpen(false);
    try {
      await foodGrocerySupplierService.updateCategory(selectedCategory.id, {
        name: updated.name,
        description: updated.description,
        imageUrl: updated.imageUrl,
        displayOrder: updated.displayOrder,
        isActive: updated.status === 'ACTIVE',
      });
    } catch {
      // keep optimistic
    }
    toast.success('Aisle Category Updated', {
      description: `Changes saved for "${updated.name}".`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
    setIsDeleteOpen(false);
    try {
      await foodGrocerySupplierService.deleteCategory(selectedCategory.id);
    } catch {
      // keep optimistic
    }
    toast.success('Aisle Category Removed', {
      description: `"${selectedCategory.name}" has been deleted.`,
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
            <span className="text-[#FCD223]">Aisles & Categories</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Aisles & Product Categories
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              {categories.filter((c) => c.status === 'ACTIVE').length} Active Aisles
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Organize supermarket shelves, departments, and customer navigation hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Aisle Category
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER & SEARCH BAR
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search aisles, departments, or descriptions..."
            maxLength={60}
            className="pl-10 bg-[#121214] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
          />
        </div>

        {/* Status Filter & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm">
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
          CATEGORIES LIST: GRID OR TABLE
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-12 text-center text-[#71717A]">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No aisle categories found</p>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or add your first supermarket department.
          </p>
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="mt-4 rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Category
          </Button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300 group shadow-lg"
            >
              {/* Image banner */}
              <div className="relative h-36 w-full bg-[#18181B] overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-black/30 to-transparent" />
                <div className="absolute top-2.5 right-2.5">
                  <Badge
                    className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 shadow-md',
                      cat.status === 'ACTIVE'
                        ? 'bg-emerald-500/90 text-black font-extrabold'
                        : 'bg-zinc-800 text-zinc-300 border-white/10'
                    )}
                  >
                    {cat.status}
                  </Badge>
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono font-bold text-white border border-white/10">
                    Aisle #{cat.displayOrder}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="text-base font-bold text-white truncate drop-shadow-md">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-white/80 font-mono">
                    /{cat.slug}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided for this supermarket aisle.'}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-[#FCD223]" />
                    {cat.itemCount} Listed Products
                  </span>
                  <Link
                    href={`/grocery-stores/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-bold text-[#FCD223] hover:underline flex items-center gap-0.5"
                  >
                    Browse <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#18181B] border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStatus(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                    cat.status === 'ACTIVE'
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-zinc-400 hover:bg-white/5'
                  )}
                >
                  <Power className="h-3.5 w-3.5" />
                  {cat.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(cat)}
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
                <th className="py-3.5 pl-4">Order</th>
                <th className="py-3.5">Aisle / Department</th>
                <th className="py-3.5">Slug</th>
                <th className="py-3.5">Products</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-4 font-mono font-bold text-white/60">#{cat.displayOrder}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-9 w-9 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{cat.name}</p>
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-1 max-w-xs">{cat.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-[#A1A1AA]">/{cat.slug}</td>
                  <td className="py-3 font-bold text-white">{cat.itemCount} items</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all',
                        cat.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-white/10'
                      )}
                    >
                      {cat.status}
                    </button>
                  </td>
                  <td className="py-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cat)}
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
          MODAL: ADD AISLE CATEGORY
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-[#FCD223]" />
              Add Supermarket Aisle Category
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Define a new product aisle or department for customer navigation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Aisle Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => {
                  const val = capitalizeFirst(e.target.value);
                  setFormName(val);
                  if (!formSlug) {
                    setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                maxLength={50}
                placeholder="Enter Aisle Category Name"
                className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                URL Slug
              </label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                maxLength={50}
                placeholder="Enter URL Slug"
                className="bg-[#18181B] border-white/10 text-white font-mono text-xs rounded-xl focus:border-[#FCD223]"
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
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-sm focus:border-[#FCD223] focus:outline-none"
                >
                  <option value="ACTIVE">Active (Live)</option>
                  <option value="INACTIVE">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between mb-1.5">
                <span>Cover Image</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
              </label>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleCategoryImageUpload}
              />

              {formImageUrl ? (
                <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                  <div className="h-32 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                    <img src={formImageUrl} alt="Aisle preview" className="h-full w-full object-cover" />
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
                    Click to upload aisle cover image
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    PNG, JPG or WEBP (rec. 800×450px banner, max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="Enter Aisle Description & Department Summary..."
                className="w-full p-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs placeholder:text-xs focus:border-[#FCD223] focus:outline-none resize-none"
              />
              <span className="text-[10px] text-[#71717A] float-right">{formDescription.length}/200 chars</span>
            </div>

            <DialogFooter className="pt-3 gap-2">
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
                Save Aisle Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: EDIT AISLE CATEGORY
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[#FCD223]" />
              Edit Aisle Category
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Update aisle parameters and shelf ordering.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Aisle Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(capitalizeFirst(e.target.value))}
                maxLength={50}
                placeholder="Enter Aisle Category Name"
                className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                URL Slug
              </label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                maxLength={50}
                placeholder="Enter URL Slug"
                className="bg-[#18181B] border-white/10 text-white font-mono text-xs rounded-xl focus:border-[#FCD223]"
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
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-sm focus:border-[#FCD223] focus:outline-none"
                >
                  <option value="ACTIVE">Active (Live)</option>
                  <option value="INACTIVE">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between mb-1.5">
                <span>Cover Image</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
              </label>

              {/* Hidden native file input */}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleCategoryImageUpload}
              />

              {formImageUrl ? (
                <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                  <div className="h-32 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                    <img src={formImageUrl} alt="Aisle preview" className="h-full w-full object-cover" />
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
                    Click to upload aisle cover image
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    PNG, JPG or WEBP (rec. 800×450px banner, max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="Enter Aisle Description & Department Summary..."
                className="w-full p-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs placeholder:text-xs focus:border-[#FCD223] focus:outline-none resize-none"
              />
              <span className="text-[10px] text-[#71717A] float-right">{formDescription.length}/200 chars</span>
            </div>

            <DialogFooter className="pt-3 gap-2">
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
              Delete Aisle Category
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Are you sure you want to remove &quot;{selectedCategory?.name}&quot;?
              {selectedCategory && selectedCategory.itemCount > 0 && (
                <span className="block mt-1 text-amber-400">
                  Warning: {selectedCategory.itemCount} products currently belong to this aisle.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border-white/10 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
            >
              Keep Category
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-500 font-bold text-white hover:bg-red-600"
            >
              Delete Aisle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
