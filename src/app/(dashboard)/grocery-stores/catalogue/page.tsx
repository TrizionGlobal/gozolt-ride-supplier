'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Package,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  foodGrocerySupplierService,
  type SupplierMenuResponse,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export default function GroceryCataloguePage() {
  const [catalogue, setCatalogue] = useState<SupplierMenuResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCatalogue = async () => {
    try {
      const data = await foodGrocerySupplierService.getMenu();
      setCatalogue(data);
    } catch (err: any) {
      console.error('Failed to load catalogue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogue();
  }, []);

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    setTogglingId(itemId);
    try {
      await foodGrocerySupplierService.toggleProductAvailability(itemId, !currentStatus);
      toast.success(!currentStatus ? 'Item is now in stock' : 'Item marked out of stock');
      setCatalogue((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === itemId ? { ...it, isAvailable: !currentStatus } : it
          ),
        };
      });
    } catch (err: any) {
      toast.error('Failed to update stock status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredItems = (catalogue?.items || []).filter((item) => {
    const matchCat =
      selectedCategory === 'all' ||
      item.categorySlug === selectedCategory ||
      item.categoryId === selectedCategory;
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Package className="h-7 w-7 text-emerald-400" />
            Grocery Catalogue & Inventory
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Manage available grocery products, inventory stock levels, and prices
          </p>
        </div>

        <button
          onClick={loadCatalogue}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groceries, brands, or barcodes..."
            className="w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#71717A] focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-3.5 py-2 font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-black'
                : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
            }`}
          >
            All Products ({catalogue?.items?.length ?? 0})
          </button>
          {(catalogue?.categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={`rounded-lg px-3.5 py-2 font-bold transition-all whitespace-nowrap ${
                selectedCategory === (cat.slug || cat.id)
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center text-[#71717A] rounded-2xl border border-white/10 bg-[#111111]/40">
          <Package className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filter or search query.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                item.isAvailable
                  ? 'border-white/10 bg-[#111111]/80 hover:border-white/20'
                  : 'border-red-500/20 bg-red-950/10 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#A1A1AA] line-clamp-2">
                      {item.description || 'Standard packaged grocery item.'}
                    </p>
                  </div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-14 w-14 rounded-xl object-cover shrink-0 border border-white/10 bg-black/40"
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-black text-white">
                    €{item.basePrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                <span
                  className={`text-xs font-bold ${
                    item.isAvailable ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>

                <button
                  onClick={() => handleToggle(item.id, item.isAvailable)}
                  disabled={togglingId === item.id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    item.isAvailable
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {togglingId === item.id
                    ? 'Updating...'
                    : item.isAvailable
                    ? 'Mark Out of Stock'
                    : 'Set In Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

