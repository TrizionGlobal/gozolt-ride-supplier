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
  Utensils,
  Image as ImageIcon,
  Grid,
  List,
  Sparkles,
  AlertTriangle,
  Upload,
  ArrowRight,
  ChevronRight,
  Check,
  Building2,
  ExternalLink,
  RefreshCw,
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

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  itemCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function RestaurantCategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([
    {
      id: 'cat-1',
      name: 'Pizza',
      slug: 'pizza',
      description: 'Artisan hand-stretched woodfired pizzas with sourdough crust and San Marzano sauce.',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
      displayOrder: 1,
      itemCount: 16,
      status: 'ACTIVE',
    },
    {
      id: 'cat-2',
      name: 'Pasta',
      slug: 'pasta',
      description: 'Handcrafted bronze-die fresh durum pasta, stuffed ravioli, and slow-simmered sauces.',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80',
      displayOrder: 2,
      itemCount: 12,
      status: 'ACTIVE',
    },
    {
      id: 'cat-3',
      name: 'Burgers',
      slug: 'burgers',
      description: 'Gourmet smashed prime Angus beef patties, potato brioche buns, and house truffle sauces.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      displayOrder: 3,
      itemCount: 9,
      status: 'ACTIVE',
    },
    {
      id: 'cat-4',
      name: 'Starters',
      slug: 'starters',
      description: 'Authentic antipasti, crispy calamari fritti, and creamy Puglia burrata bruschetta.',
      imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&q=80',
      displayOrder: 4,
      itemCount: 14,
      status: 'ACTIVE',
    },
    {
      id: 'cat-5',
      name: 'Main Course',
      slug: 'main-course',
      description: 'Premium grilled aged cuts, wild Mediterranean sea bass, and creamy Carnaroli risotto.',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
      displayOrder: 5,
      itemCount: 11,
      status: 'ACTIVE',
    },
    {
      id: 'cat-6',
      name: 'Desserts',
      slug: 'desserts',
      description: 'Signature espresso tiramisu, crispy Sicilian pistachio cannoli, and vanilla panna cotta.',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
      displayOrder: 6,
      itemCount: 8,
      status: 'ACTIVE',
    },
    {
      id: 'cat-7',
      name: 'Beverages',
      slug: 'beverages',
      description: 'Italian artisanal sodas, mineral waters, European craft beers, and DOC wines.',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
      displayOrder: 7,
      itemCount: 22,
      status: 'ACTIVE',
    },
    {
      id: 'cat-8',
      name: 'Salads',
      slug: 'salads',
      description: 'Organic greens, heirloom tomatoes, burrata bowls, and cold-pressed olive oil dressings.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      displayOrder: 8,
      itemCount: 7,
      status: 'ACTIVE',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoading(true);
        const res = await foodGrocerySupplierService.getMenu();
        if (res && res.categories && res.categories.length > 0) {
          setCategories(
            res.categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description || `Selection of ${c.name} items.`,
              imageUrl: c.imageUrl || '',
              displayOrder: c.displayOrder || 1,
              itemCount: c.itemCount ?? 0,
              status: c.isActive ? 'ACTIVE' : 'INACTIVE',
            }))
          );
        }
      } catch (err) {
        console.warn('Backend categories sync fallback (using initialized cache):', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'order' | 'items' | 'name'>('order');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);

  // View Details Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<MenuCategory | null>(null);

  // Form inputs state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // File upload ref & handler
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.success('Category image uploaded', { description: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchSearch =
          !searchTerm ||
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || cat.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'order') return a.displayOrder - b.displayOrder;
        if (sortBy === 'items') return b.itemCount - a.itemCount;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [categories, searchTerm, statusFilter, sortBy]);

  // Open Details Modal
  const handleOpenDetails = (category: MenuCategory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewingCategory(category);
    setIsDetailsOpen(true);
  };

  // Open Add Category Modal
  const handleOpenAdd = () => {
    setFormMode('ADD');
    setEditingCategoryId(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('');
    setFormDisplayOrder(categories.length + 1);
    setFormStatus('ACTIVE');
    setIsFormOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEdit = (category: MenuCategory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFormMode('EDIT');
    setEditingCategoryId(category.id);
    setFormName(category.name);
    setFormDescription(category.description);
    setFormImageUrl(category.imageUrl);
    setFormDisplayOrder(category.displayOrder);
    setFormStatus(category.status);
    setIsFormOpen(true);
  };

  // Save Category (Add or Edit)
  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      toast.error('Validation Error', { description: 'Please enter a category name.' });
      return;
    }

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (formMode === 'ADD') {
      const newCategory: MenuCategory = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug,
        description: formDescription.trim() || 'Delicious kitchen category items.',
        imageUrl: formImageUrl || '',
        displayOrder: Number(formDisplayOrder) || categories.length + 1,
        itemCount: 0,
        status: formStatus,
      };

      setCategories((prev) => [...prev, newCategory]);
      try {
        const created = await foodGrocerySupplierService.createCategory({
          name: newCategory.name,
          description: newCategory.description,
          imageUrl: newCategory.imageUrl,
          displayOrder: newCategory.displayOrder,
        });
        if (created?.id) {
          setCategories((prev) =>
            prev.map((c) => (c.id === newCategory.id ? { ...c, id: created.id } : c))
          );
        }
      } catch (err: any) {
        console.warn('Backend category sync fallback (local state preserved):', err);
      }

      toast.success('Category Created', {
        description: `"${newCategory.name}" added to menu catalog.`,
      });
    } else if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? {
                ...c,
                name: formName.trim(),
                slug,
                description: formDescription.trim(),
                imageUrl: formImageUrl || c.imageUrl,
                displayOrder: Number(formDisplayOrder) || c.displayOrder,
                status: formStatus,
              }
            : c
        )
      );

      try {
        await foodGrocerySupplierService.updateCategory(editingCategoryId, {
          name: formName.trim(),
          displayOrder: Number(formDisplayOrder),
          isActive: formStatus === 'ACTIVE',
        });
      } catch (err) {
        console.warn('Backend category update sync fallback:', err);
      }

      toast.success('Category Updated', {
        description: `Category "${formName}" changes saved.`,
      });
    }

    setIsFormOpen(false);
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentCat = categories.find((c) => c.id === id);
    if (!currentCat) return;
    const nextStatus = currentCat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      await foodGrocerySupplierService.toggleCategoryStatus(id, nextStatus === 'ACTIVE');
    } catch (err) {
      console.warn('Backend status toggle sync fallback:', err);
    }

    toast.info(`Category ${nextStatus === 'ACTIVE' ? 'Activated' : 'Hidden'}`, {
      description: `"${currentCat.name}" is now ${nextStatus === 'ACTIVE' ? 'Active on customer app' : 'Hidden'}.`,
    });
  };

  // Open Delete Dialog
  const handleOpenDelete = (category: MenuCategory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    if (deletingCategory.itemCount > 0) {
      toast.error('Safe Deletion Check Blocked', {
        description: `Cannot delete "${deletingCategory.name}" because it contains ${deletingCategory.itemCount} dish(es). Deactivate it or reassign dishes first.`,
      });
      return;
    }

    const catToDelete = deletingCategory;
    setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id));
    setIsDeleteOpen(false);
    setDeletingCategory(null);

    try {
      await foodGrocerySupplierService.deleteCategory(catToDelete.id);
    } catch (err: any) {
      console.warn('Backend category deletion fallback:', err);
    }

    toast.success('Category Deleted', {
      description: `"${catToDelete.name}" has been removed from menu.`,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP BAR & NAVIGATION
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/restaurants/menu"
              className="text-xs text-zinc-400 hover:text-[#FCD223] transition-colors flex items-center gap-1"
            >
              <Utensils className="h-3.5 w-3.5" />
              Menu Management
            </Link>
            <span className="text-zinc-600 text-xs">/</span>
            <span className="text-xs text-[#FCD223] font-semibold">Categories</span>
          </div>

          <h1 className="mt-1 text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <FolderPlus className="h-7 w-7 text-[#FCD223]" />
            Menu Categories
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Organize kitchen dishes, sequence customer display order, and control menu visibility
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Card / Table View Toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-lg p-1.5 transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#FCD223] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              )}
              title="Grid Card View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-[#FCD223] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Category Button */}
          <Button
            onClick={handleOpenAdd}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTERS & SEARCH BAR
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search category name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({categories.length})</option>
              <option value="ACTIVE">Active in Customer App</option>
              <option value="INACTIVE">Hidden / Inactive</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="order">Sort: Display Order (#1 to #{categories.length})</option>
              <option value="items">Sort: Most Dishes (Highest to Lowest)</option>
              <option value="name">Sort: Alphabetical (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          CATEGORIES LISTING (CARDS VIEW)
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleOpenDetails(cat)}
              className={cn(
                'rounded-2xl border bg-[#121214] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/20 group cursor-pointer',
                cat.status === 'ACTIVE'
                  ? 'border-white/10'
                  : 'border-zinc-800/80 opacity-60 bg-zinc-950/30'
              )}
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                    <FolderPlus className="h-10 w-10 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/40" />

                {/* Display Order Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-[#FCD223]">
                    #{cat.displayOrder}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-bold border',
                      cat.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800/90 text-zinc-400 border-zinc-700'
                    )}
                  >
                    {cat.status === 'ACTIVE' ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white group-hover:text-[#FCD223] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-500">/{cat.slug}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Dish Count */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                    <Utensils className="h-3.5 w-3.5 text-[#FCD223]" />
                    <strong className="text-white">{cat.itemCount}</strong> dishes in catalog
                  </span>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleToggleStatus(cat.id, e)}
                    className={cn(
                      'text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer',
                      cat.status === 'ACTIVE'
                        ? 'text-zinc-400 hover:text-red-400'
                        : 'text-emerald-400 hover:underline'
                    )}
                  >
                    <Power className="h-3 w-3" />
                    {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleOpenDetails(cat, e)}
                      title="View Details"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(cat, e)}
                      title="Edit Category"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(cat, e)}
                      title="Delete Category"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          CATEGORIES LISTING (TABLE VIEW)
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-white/10 bg-[#18181B] text-[10px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Image</th>
                  <th className="py-3 px-3 font-semibold">Category Name</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-3 font-semibold text-center">Display Order</th>
                  <th className="py-3 px-3 font-semibold text-center">Items</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    onClick={() => handleOpenDetails(cat)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    {/* Category Image */}
                    <td className="py-3 px-4">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 shrink-0 flex items-center justify-center">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <FolderPlus className="h-5 w-5 text-zinc-600" />
                        )}
                      </div>
                    </td>

                    {/* Category Name */}
                    <td className="py-3 px-3 font-bold text-white group-hover:text-[#FCD223] transition-colors">
                      {cat.name}
                      <span className="block text-[10px] font-mono font-normal text-zinc-500">
                        /{cat.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="truncate text-zinc-300">{cat.description}</p>
                    </td>

                    {/* Display Order */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-[#FCD223] bg-[#FCD223]/10 px-2 py-0.5 rounded">
                        #{cat.displayOrder}
                      </span>
                    </td>

                    {/* Number of Items */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-white">{cat.itemCount}</span>
                      <span className="text-[10px] text-zinc-500 block">dishes</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                          cat.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            cat.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-zinc-500'
                          )}
                        />
                        {cat.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleToggleStatus(cat.id, e)}
                          title="Toggle Active/Inactive"
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer',
                            cat.status === 'ACTIVE'
                              ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'
                          )}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleOpenDetails(cat, e)}
                          title="View Category Details"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleOpenEdit(cat, e)}
                          title="Edit Category"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleOpenDelete(cat, e)}
                          title="Delete Category"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW CATEGORY DETAILS MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#121214] text-white p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-[#FCD223]" />
                {viewingCategory?.name}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-bold border',
                  viewingCategory?.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                )}
              >
                {viewingCategory?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Detailed menu category configuration and dish counts.
            </DialogDescription>
          </DialogHeader>

          {viewingCategory && (
            <div className="space-y-4 py-2">
              <div className="h-44 w-full rounded-xl overflow-hidden border border-white/10 relative bg-zinc-900 flex items-center justify-center">
                {viewingCategory.imageUrl ? (
                  <img
                    src={viewingCategory.imageUrl}
                    alt={viewingCategory.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FolderPlus className="h-12 w-12 text-zinc-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#FCD223] bg-black/60 px-2 py-0.5 rounded">
                      Display Position #{viewingCategory.displayOrder}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">{viewingCategory.name}</h4>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs space-y-2">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Slug URL</span>
                  <span className="font-mono text-zinc-300">/{viewingCategory.slug}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Description</span>
                  <p className="text-zinc-300 leading-relaxed">{viewingCategory.description}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Associated Items</span>
                    <span className="font-bold text-white text-sm">{viewingCategory.itemCount} food items</span>
                  </div>
                  <Link
                    href={`/restaurants/menu?category=${viewingCategory.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-[#FCD223] font-bold hover:underline"
                  >
                    View in Menu <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingCategory) {
                  setIsDetailsOpen(false);
                  handleOpenEdit(viewingCategory);
                }
              }}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD / EDIT CATEGORY MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#121214] text-white p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-[#FCD223]" />
              {formMode === 'ADD' ? 'Add New Category' : `Edit Category: ${formName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure category presentation, sequencing, and customer app visibility.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Category Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-300">Category Name *</label>
              <Input
                placeholder="e.g. Pizza, Pasta, Burgers, Starters..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
              />
            </div>

            {/* Category Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-300">Category Description</label>
              <textarea
                rows={2}
                placeholder="Provide a delicious customer-facing description..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#18181B] p-2 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
              />
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Category Image</span>
                <span className="text-[10px] text-zinc-500">JPG, PNG, WEBP (Max 5MB)</span>
              </label>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {formImageUrl ? (
                <div className="mt-1.5 rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                  <div className="h-32 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                    <img src={formImageUrl} alt="Category preview" className="h-full w-full object-cover" />
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
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#18181B]/60 p-5 text-center hover:border-[#FCD223]/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                    Click to upload category image
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    PNG, JPG or WEBP (rec. 800×450px, max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Display Order & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Display Order</label>
                <Input
                  type="number"
                  min={1}
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                  className="mt-1 border-white/10 bg-[#18181B] text-xs font-mono text-[#FCD223]"
                />
                <span className="text-[10px] text-zinc-500">Position in menu tabs</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Active (Visible)</option>
                  <option value="INACTIVE">Inactive (Hidden)</option>
                </select>
                <span className="text-[10px] text-zinc-500">Customer app visibility</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            {formMode === 'EDIT' && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setIsFormOpen(false);
                  const target = categories.find((c) => c.id === editingCategoryId);
                  if (target) handleOpenDelete(target);
                }}
                className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 mr-auto"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
            >
              {formMode === 'ADD' ? 'Save Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION DIALOG (SAFE DELETION CHECK)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-red-500/30 bg-[#121214] text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Category Confirmation
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to delete{' '}
              <strong className="text-white">"{deletingCategory?.name}"</strong>?
            </DialogDescription>
          </DialogHeader>

          {deletingCategory && deletingCategory.itemCount > 0 ? (
            <div className="py-2 text-xs text-amber-200 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Category Contains {deletingCategory.itemCount} Active Dish(es)
              </div>
              <p>
                To protect menu integrity and customer orders, categories containing dishes cannot be deleted. Please reassign or delete these dishes first, or set this category status to <strong>Inactive</strong> to hide it.
              </p>
            </div>
          ) : (
            <div className="py-2 text-xs text-zinc-300 bg-red-950/20 border border-red-500/20 rounded-xl p-3">
              <p>
                This category contains 0 dishes and is safe to delete. It will be removed from your menu structure and customer navigation.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(deletingCategory && deletingCategory.itemCount > 0)}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
