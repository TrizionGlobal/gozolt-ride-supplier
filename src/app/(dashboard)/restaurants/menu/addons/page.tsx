'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Utensils,
  AlertCircle,
  Tag,
  Euro,
  Check,
  Loader2,
  Eye,
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

export interface FoodAddon {
  id: string;
  name: string;
  foodItemId: string;
  foodItemName: string;
  foodItemCategory: string;
  price: number;
  isAvailable: boolean;
}

const AVAILABLE_FOOD_ITEMS = [
  { id: 'dish-biryani', name: 'Royal Hyderabadi Chicken Dum Biryani', category: 'Biryani & Rice' },
  { id: 'dish-1', name: 'Truffle Mushroom Tagliolini', category: 'Pasta' },
  { id: 'dish-2', name: 'Woodfired Pizza Diavola', category: 'Pizza' },
  { id: 'dish-3', name: 'Pizza Margherita D.O.P.', category: 'Pizza' },
  { id: 'dish-4', name: 'The Gozolt Prime Angus Smashed Burger', category: 'Burgers' },
  { id: 'dish-5', name: 'Burrata Pugliese & Prosciutto San Daniele', category: 'Starters' },
  { id: 'dish-6', name: 'Homemade Tiramisu al Mascarpone', category: 'Desserts' },
  { id: 'dish-7', name: 'Artisan Sicilian Cannoli', category: 'Desserts' },
  { id: 'dish-8', name: 'San Pellegrino Sparkling Blood Orange', category: 'Beverages' },
  { id: 'dish-9', name: 'Italian Aperol Spritz 0.0%', category: 'Beverages' },
  { id: 'dish-10', name: 'Caesar Salad with Crispy Pancetta', category: 'Salads' },
  { id: 'dish-11', name: 'Pollo alla Parmigiana Classic', category: 'Main Course' },
  { id: 'dish-12', name: 'Truffle Fries with Pecorino & Garlic Aioli', category: 'Starters' },
];

const INITIAL_ADDONS: FoodAddon[] = [
  // Royal Hyderabadi Chicken Dum Biryani Addons
  { id: 'add-biryani-1', name: 'Extra Mirchi Ka Salan Gravy', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 1.5, isAvailable: true },
  { id: 'add-biryani-2', name: 'Spiced Mint Raita (Curd Dip)', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 1.2, isAvailable: true },
  { id: 'add-biryani-3', name: 'Extra Boiled Eggs (2 pcs)', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 1.8, isAvailable: true },
  { id: 'add-biryani-4', name: 'Extra Succulent Chicken Dum Piece', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 3.5, isAvailable: true },
  { id: 'add-biryani-5', name: 'Roasted Cashews & Crispy Birista Topping', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 2.0, isAvailable: true },
  { id: 'add-biryani-6', name: 'Gulab Jamun Dessert (2 pcs)', foodItemId: 'dish-biryani', foodItemName: 'Royal Hyderabadi Chicken Dum Biryani', foodItemCategory: 'Biryani & Rice', price: 2.5, isAvailable: true },

  // Woodfired Pizza Diavola Addons
  { id: 'add-1', name: 'Extra Mozzarella Cheese', foodItemId: 'dish-2', foodItemName: 'Woodfired Pizza Diavola', foodItemCategory: 'Pizza', price: 2.0, isAvailable: true },
  { id: 'add-2', name: 'Spicy Calabrian Salami', foodItemId: 'dish-2', foodItemName: 'Woodfired Pizza Diavola', foodItemCategory: 'Pizza', price: 2.5, isAvailable: true },
  { id: 'add-3', name: 'Kalamata Black Olives', foodItemId: 'dish-2', foodItemName: 'Woodfired Pizza Diavola', foodItemCategory: 'Pizza', price: 1.2, isAvailable: true },
  { id: 'add-4', name: 'Garlic Butter Crust Dip', foodItemId: 'dish-2', foodItemName: 'Woodfired Pizza Diavola', foodItemCategory: 'Pizza', price: 1.0, isAvailable: true },

  // Pizza Margherita Addons
  { id: 'add-5', name: 'Fresh Buffalo Mozzarella', foodItemId: 'dish-3', foodItemName: 'Pizza Margherita D.O.P.', foodItemCategory: 'Pizza', price: 3.0, isAvailable: true },
  { id: 'add-6', name: 'Wild Porcini Mushrooms', foodItemId: 'dish-3', foodItemName: 'Pizza Margherita D.O.P.', foodItemCategory: 'Pizza', price: 2.8, isAvailable: true },
  { id: 'add-7', name: 'Extra Fresh Basil & Olive Oil', foodItemId: 'dish-3', foodItemName: 'Pizza Margherita D.O.P.', foodItemCategory: 'Pizza', price: 0.8, isAvailable: true },

  // Smashed Burger Addons
  { id: 'add-8', name: 'Extra Smashed Angus Patty (150g)', foodItemId: 'dish-4', foodItemName: 'The Gozolt Prime Angus Smashed Burger', foodItemCategory: 'Burgers', price: 4.5, isAvailable: true },
  { id: 'add-9', name: 'Crispy Smoked Pancetta Bacon', foodItemId: 'dish-4', foodItemName: 'The Gozolt Prime Angus Smashed Burger', foodItemCategory: 'Burgers', price: 2.0, isAvailable: true },
  { id: 'add-10', name: 'Melted Cheddar Cheese', foodItemId: 'dish-4', foodItemName: 'The Gozolt Prime Angus Smashed Burger', foodItemCategory: 'Burgers', price: 1.5, isAvailable: true },
  { id: 'add-11', name: 'Caramelized Balsamic Onions', foodItemId: 'dish-4', foodItemName: 'The Gozolt Prime Angus Smashed Burger', foodItemCategory: 'Burgers', price: 1.2, isAvailable: true },
  { id: 'add-12', name: 'Black Truffle Garlic Aioli', foodItemId: 'dish-4', foodItemName: 'The Gozolt Prime Angus Smashed Burger', foodItemCategory: 'Burgers', price: 0.9, isAvailable: true },

  // Truffle Mushroom Tagliolini Addons
  { id: 'add-13', name: 'Extra Shaved Black Truffle', foodItemId: 'dish-1', foodItemName: 'Truffle Mushroom Tagliolini', foodItemCategory: 'Pasta', price: 4.0, isAvailable: true },
  { id: 'add-14', name: 'Aged Parmigiano Reggiano', foodItemId: 'dish-1', foodItemName: 'Truffle Mushroom Tagliolini', foodItemCategory: 'Pasta', price: 1.8, isAvailable: true },
  { id: 'add-15', name: 'Creamy Truffle Butter', foodItemId: 'dish-1', foodItemName: 'Truffle Mushroom Tagliolini', foodItemCategory: 'Pasta', price: 1.5, isAvailable: true },

  // Truffle Fries Addons
  { id: 'add-16', name: 'Extra Truffle Mayo Dip', foodItemId: 'dish-12', foodItemName: 'Truffle Fries with Pecorino & Garlic Aioli', foodItemCategory: 'Starters', price: 1.0, isAvailable: true },
  { id: 'add-17', name: 'Warm Cheddar Sauce', foodItemId: 'dish-12', foodItemName: 'Truffle Fries with Pecorino & Garlic Aioli', foodItemCategory: 'Starters', price: 1.5, isAvailable: true },

  // Pollo alla Parmigiana Addons
  { id: 'add-18', name: 'Extra Melted Mozzarella', foodItemId: 'dish-11', foodItemName: 'Pollo alla Parmigiana Classic', foodItemCategory: 'Main Course', price: 2.0, isAvailable: true },
  { id: 'add-19', name: 'Spicy Marinara Dip', foodItemId: 'dish-11', foodItemName: 'Pollo alla Parmigiana Classic', foodItemCategory: 'Main Course', price: 1.2, isAvailable: true },
];

export default function RestaurantAddonsPage() {
  const [addons, setAddons] = useState<FoodAddon[]>(INITIAL_ADDONS);
  const [selectedFoodItemId, setSelectedFoodItemId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');

  // Selected Food Item for the modal
  const [formFoodItemId, setFormFoodItemId] = useState('');

  // Multi-row add-ons state (starts with 1 row by default, initially In Stock)
  const [addonRows, setAddonRows] = useState<
    { id?: string; name: string; price: string; isAvailable: boolean }[]
  >([{ name: '', price: '', isAvailable: true }]);

  const handleAddRow = () => {
    setAddonRows((prev) => [
      ...prev,
      { name: '', price: '', isAvailable: true },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (addonRows.length <= 1) {
      setAddonRows([{ name: '', price: '', isAvailable: true }]);
      return;
    }
    setAddonRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (
    index: number,
    field: 'name' | 'price' | 'isAvailable',
    value: string | boolean
  ) => {
    setAddonRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDish, setDeletingDish] = useState<{ id: string; name: string; count: number } | null>(null);

  // View Details Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDish, setViewingDish] = useState<{
    id: string;
    name: string;
    category: string;
    addons: FoodAddon[];
    count: number;
  } | null>(null);

  const handleOpenView = (dishGroup: {
    id: string;
    name: string;
    category: string;
    addons: FoodAddon[];
    count: number;
  }) => {
    setViewingDish(dishGroup);
    setIsViewOpen(true);
  };

  // Active dish when a specific dish is chosen in quick filter
  const focusedFoodItem = useMemo(() => {
    return AVAILABLE_FOOD_ITEMS.find((d) => d.id === selectedFoodItemId) || null;
  }, [selectedFoodItemId]);

  // Grouped by Food Dish for Table Display (Most recently added/updated dishes appear at the very first place)
  const dishesWithAddons = useMemo(() => {
    const seenDishIds = new Set<string>();
    const orderedDishIds: string[] = [];

    // Prioritize dish order by their appearance in addons (newest/most recent first)
    addons.forEach((addon) => {
      if (!seenDishIds.has(addon.foodItemId)) {
        seenDishIds.add(addon.foodItemId);
        orderedDishIds.push(addon.foodItemId);
      }
    });

    // Append any remaining available dishes
    AVAILABLE_FOOD_ITEMS.forEach((dish) => {
      if (!seenDishIds.has(dish.id)) {
        seenDishIds.add(dish.id);
        orderedDishIds.push(dish.id);
      }
    });

    return orderedDishIds
      .map((dishId) => {
        const dish = AVAILABLE_FOOD_ITEMS.find((d) => d.id === dishId);
        if (!dish) return null;
        const dishAddons = addons.filter((a) => a.foodItemId === dish.id);
        return {
          ...dish,
          addons: dishAddons,
          count: dishAddons.length,
        };
      })
      .filter((group): group is NonNullable<typeof group> => {
        if (!group) return false;
        // If user selected a specific dish chip/filter:
        if (selectedFoodItemId !== 'ALL' && group.id !== selectedFoodItemId) {
          return false;
        }

        // If user typed search:
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDish =
            group.name.toLowerCase().includes(term) ||
            group.category.toLowerCase().includes(term);
          const matchAddon = group.addons.some((a) =>
            a.name.toLowerCase().includes(term)
          );
          return matchDish || matchAddon;
        }

        // If "ALL" is selected and no search, show dishes that have add-ons configured!
        return group.count > 0;
      });
  }, [addons, selectedFoodItemId, searchTerm]);

  // Dishes ordered by recently added/configured add-ons for Quick Filter Chips
  const orderedDishesForFilter = useMemo(() => {
    const seen = new Set<string>();
    const list: typeof AVAILABLE_FOOD_ITEMS = [];

    // Prioritize dishes configured in addons
    addons.forEach((a) => {
      if (!seen.has(a.foodItemId)) {
        seen.add(a.foodItemId);
        const d = AVAILABLE_FOOD_ITEMS.find((item) => item.id === a.foodItemId);
        if (d) list.push(d);
      }
    });

    // Append any remaining dishes
    AVAILABLE_FOOD_ITEMS.forEach((d) => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        list.push(d);
      }
    });

    return list;
  }, [addons]);

  // Target dish selected in modal
  const targetDish = useMemo(() => {
    return AVAILABLE_FOOD_ITEMS.find((d) => d.id === formFoodItemId) || null;
  }, [formFoodItemId]);

  // When user changes target food dish in modal dropdown:
  const handleTargetDishChange = (dishId: string) => {
    setFormFoodItemId(dishId);
    if (!dishId) {
      setAddonRows([{ name: '', price: '', isAvailable: true }]);
      return;
    }
    const existing = addons.filter((a) => a.foodItemId === dishId);
    if (existing.length > 0) {
      setAddonRows(
        existing.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price.toFixed(2),
          isAvailable: a.isAvailable !== false,
        }))
      );
    } else {
      setAddonRows([{ name: '', price: '', isAvailable: true }]);
    }
  };

  // Open Modal to Add
  const handleOpenAdd = (targetDishId?: string) => {
    setFormMode('ADD');
    const chosenDishId =
      targetDishId || (selectedFoodItemId !== 'ALL' ? selectedFoodItemId : '');
    setFormFoodItemId(chosenDishId);

    if (chosenDishId) {
      const existing = addons.filter((a) => a.foodItemId === chosenDishId);
      if (existing.length > 0) {
        setAddonRows(
          existing.map((a) => ({
            id: a.id,
            name: a.name,
            price: a.price.toFixed(2),
            isAvailable: a.isAvailable !== false,
          }))
        );
      } else {
        setAddonRows([{ name: '', price: '', isAvailable: true }]);
      }
    } else {
      setAddonRows([{ name: '', price: '', isAvailable: true }]);
    }
    setIsFormOpen(true);
  };

  // Open Modal to Edit for a Food Dish
  const handleOpenEditDish = (dishId: string) => {
    setFormMode('EDIT');
    setFormFoodItemId(dishId);
    const existing = addons.filter((a) => a.foodItemId === dishId);
    if (existing.length > 0) {
      setAddonRows(
        existing.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price.toFixed(2),
          isAvailable: a.isAvailable !== false,
        }))
      );
    } else {
      setAddonRows([{ name: '', price: '', isAvailable: true }]);
    }
    setIsFormOpen(true);
  };

  // Save Add-ons for the selected Food Dish
  const handleSaveAddon = () => {
    if (!formFoodItemId) {
      toast.error('Validation Error', { description: 'Please select a food item.' });
      return;
    }

    const matchedDish = AVAILABLE_FOOD_ITEMS.find((d) => d.id === formFoodItemId);
    if (!matchedDish) {
      toast.error('Validation Error', { description: 'Please select a valid food item.' });
      return;
    }

    const validRows = addonRows.filter((r) => r.name.trim() !== '');

    if (validRows.length === 0) {
      toast.error('Validation Error', {
        description: 'Please enter at least one add-on name.',
      });
      return;
    }

    for (const row of validRows) {
      const priceNum = parseFloat(row.price);
      if (isNaN(priceNum) || priceNum < 0) {
        toast.error('Validation Error', {
          description: `Please enter a valid price for "${row.name}".`,
        });
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Prioritize newly added add-on rows so they display at the first place
      const newRows = validRows.filter((r) => !r.id);
      const existingRows = validRows.filter((r) => !!r.id);
      const sortedValidRows = [...newRows, ...existingRows];

      const updatedDishAddons: FoodAddon[] = sortedValidRows.map((row, idx) => ({
        id: row.id || `add-${Date.now()}-${idx}`,
        name: row.name.trim(),
        foodItemId: matchedDish.id,
        foodItemName: matchedDish.name,
        foodItemCategory: matchedDish.category,
        price: parseFloat(row.price) || 0,
        isAvailable: row.isAvailable !== false,
      }));

      // Prepend updated dish addons so this dish appears at the first place on the table
      setAddons((prev) => {
        const remaining = prev.filter((a) => a.foodItemId !== matchedDish.id);
        return [...updatedDishAddons, ...remaining];
      });

      toast.success('Add-ons Saved', {
        description: `${updatedDishAddons.length} add-on(s) configured for ${matchedDish.name}.`,
      });

      setIsSubmitting(false);
      setIsFormOpen(false);
    }, 400);
  };

  // Toggle In Stock / Out of Stock for a single Add-on
  const handleToggleAvailability = (addonId: string) => {
    const target = addons.find((a) => a.id === addonId);
    if (!target) return;
    const nextStatus = !target.isAvailable;
    setAddons((prev) =>
      prev.map((a) => (a.id === addonId ? { ...a, isAvailable: nextStatus } : a))
    );
    toast.success(
      nextStatus ? 'Marked In Stock' : 'Marked Out of Stock',
      {
        description: `"${target.name}" is now ${nextStatus ? 'active (In Stock)' : 'inactive (Out of Stock)'}.`,
      }
    );
  };

  // Open Delete Confirmation for a Dish's Add-ons
  const handleOpenDeleteDish = (dishId: string, dishName: string, count: number) => {
    setDeletingDish({ id: dishId, name: dishName, count });
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingDish) return;
    setAddons((prev) => prev.filter((a) => a.foodItemId !== deletingDish.id));
    toast.success('Add-ons Removed', {
      description: `All ${deletingDish.count} add-ons removed for ${deletingDish.name}.`,
    });
    setIsDeleteOpen(false);
    setDeletingDish(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/restaurants/dashboard" className="hover:text-white transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-[#FCD223] font-semibold">Add-ons</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Tag className="h-7 w-7 text-[#FCD223]" />
            Food Add-ons
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Select a food item, add extra items under it, and set the price for each add-on
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => handleOpenAdd()}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Add-ons
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. FOOD ITEM SELECTOR & QUICK CHIPS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-[#FCD223]" />
              Select Food Dish to View or Add Add-ons
            </label>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Click a food item to manage its specific add-on options
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedFoodItemId}
              onChange={(e) => setSelectedFoodItemId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Food Items ({AVAILABLE_FOOD_ITEMS.length} dishes)</option>
              {AVAILABLE_FOOD_ITEMS.map((dish) => (
                <option key={dish.id} value={dish.id}>
                  {dish.name} — {dish.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Food Dish Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedFoodItemId('ALL')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              selectedFoodItemId === 'ALL'
                ? 'bg-[#FCD223] text-black font-bold'
                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
            )}
          >
            All Food Items ({addons.length} Add-ons)
          </button>
          {orderedDishesForFilter.map((dish) => {
            const count = addons.filter((a) => a.foodItemId === dish.id).length;
            return (
              <button
                key={dish.id}
                onClick={() => setSelectedFoodItemId(dish.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
                  selectedFoodItemId === dish.id
                    ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223] font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                )}
              >
                <span>{dish.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Active Dish Banner */}
        {focusedFoodItem && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#FCD223]/20 bg-[#FCD223]/5 mt-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FCD223]/10 p-2 text-[#FCD223]">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{focusedFoodItem.name}</span>
                  <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px]">
                    {focusedFoodItem.category}
                  </Badge>
                  <span className="text-[11px] text-zinc-400">
                    • {addons.filter((a) => a.foodItemId === focusedFoodItem.id).length} Add-on(s) configured
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Showing add-ons created specifically for {focusedFoodItem.name}.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleOpenAdd(focusedFoodItem.id)}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs h-8 shrink-0"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Add-ons for {focusedFoodItem.name}
            </Button>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SEARCH INPUT
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search add-on name or food item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#121214] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FOOD ITEMS & SAVED ADD-ONS TABLE
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-72">Food Item</th>
                <th className="py-3 px-4">Saved Add-ons</th>
                <th className="py-3 px-4 text-center w-36">Total Add-ons</th>
                <th className="py-3 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {dishesWithAddons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#FCD223]" />
                    <p className="font-semibold text-white">No food items with add-ons found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Click "Add Add-ons" to configure add-on options for your dishes.
                    </p>
                  </td>
                </tr>
              ) : (
                dishesWithAddons.map((dishGroup) => (
                  <tr
                    key={dishGroup.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Food Item */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white text-sm">
                          {dishGroup.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] px-1.5 py-0">
                            {dishGroup.category}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    {/* Saved Add-ons List */}
                    <td className="py-4 px-4 align-top">
                      {dishGroup.addons.length === 0 ? (
                        <span className="text-zinc-500 italic text-xs">No add-ons configured</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dishGroup.addons.map((addon) => (
                            <div
                              key={addon.id}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all shadow-xs',
                                addon.isAvailable
                                  ? 'border-white/10 bg-[#18181B]'
                                  : 'border-red-500/20 bg-red-500/5 opacity-75'
                              )}
                            >
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full shrink-0',
                                  addon.isAvailable ? 'bg-emerald-400' : 'bg-red-400'
                                )}
                              />
                              <span
                                className={cn(
                                  'font-medium capitalize',
                                  addon.isAvailable ? 'text-white' : 'text-zinc-400 line-through'
                                )}
                              >
                                {addon.name}
                              </span>
                              <span
                                className={cn(
                                  'font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border',
                                  addon.isAvailable
                                    ? 'text-[#FCD223] bg-[#FCD223]/10 border-[#FCD223]/20'
                                    : 'text-zinc-500 bg-zinc-800 border-zinc-700'
                                )}
                              >
                                +€{addon.price.toFixed(2)}
                              </span>

                              {/* Toggle In Stock / Out of Stock on Table */}
                              <button
                                type="button"
                                onClick={() => handleToggleAvailability(addon.id)}
                                title={
                                  addon.isAvailable
                                    ? 'In Stock - Click to mark Out of Stock'
                                    : 'Out of Stock - Click to mark In Stock'
                                }
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ml-0.5',
                                  addon.isAvailable
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                )}
                              >
                                {addon.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Total Count */}
                    <td className="py-4 px-4 text-center align-top">
                      <Badge className="border-[#FCD223]/30 bg-[#FCD223]/10 text-[#FCD223] text-xs font-bold px-2.5 py-1">
                        {dishGroup.count} {dishGroup.count === 1 ? 'Add-on' : 'Add-ons'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(dishGroup)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                          title="View Add-on Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDish(dishGroup.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-[#FCD223]/10 hover:text-[#FCD223] border border-white/5 hover:border-[#FCD223]/30 transition-colors cursor-pointer"
                          title="Edit & Add Add-ons for this food item"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDish(dishGroup.id, dishGroup.name, dishGroup.count)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-colors cursor-pointer"
                          title="Delete All Add-ons for this food item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD / EDIT FOOD ADD-ONS MODAL
          - Allows selecting food item
          - Shows existed add-ons (if any) or 1 row by default
          - Allows editing existed add-ons, individual stock status toggles, removing rows, or adding more rows
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#121214] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#FCD223]" />
              {targetDish ? `Manage Add-ons: ${targetDish.name}` : 'Add Food Add-ons'}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure add-on options, prices, and kitchen availability (In Stock / Out of Stock).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* 1. Target Food Item */}
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Target Food Item *
              </label>
              <select
                value={formFoodItemId}
                onChange={(e) => handleTargetDishChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] py-2.5 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
              >
                <option value="">Select Food Item</option>
                {AVAILABLE_FOOD_ITEMS.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name} ({dish.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Add-ons List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>Add-ons List</span>
                  <Badge className="border-[#FCD223]/30 bg-[#FCD223]/10 text-[#FCD223] text-[10px]">
                    {addonRows.filter((r) => r.name.trim()).length} of {addonRows.length} filled
                  </Badge>
                </label>
                <span className="text-[10px] text-zinc-400">Manage names, extra prices &amp; availability</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {addonRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5 transition-all hover:border-white/15"
                  >
                    {/* Top Row: Option Name & Price & Delete */}
                    <div className="flex items-start gap-2.5">
                      {/* Name Input */}
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Add-on Option Name *
                        </label>
                        <Input
                          placeholder="Enter Add-on Name"
                          value={row.name}
                          onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                          className="border-white/10 bg-[#18181B] text-xs placeholder:text-[10px] sm:placeholder:text-[11px] placeholder:text-zinc-500 text-white capitalize h-9"
                        />
                      </div>

                      {/* Price Input */}
                      <div className="w-36 space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Price (€) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                            €
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter Price"
                            value={row.price}
                            onChange={(e) => handleUpdateRow(idx, 'price', e.target.value)}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                            }}
                            className="border-white/10 bg-[#18181B] pl-6 text-xs placeholder:text-[10px] sm:placeholder:text-[11px] placeholder:text-zinc-500 font-mono text-white font-bold h-9"
                          />
                        </div>
                      </div>

                      {/* Delete Row Button */}
                      {addonRows.length > 1 && (
                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Availability Toggle in Full Width */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Availability Status
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(idx, 'isAvailable', !row.isAvailable)}
                        className={cn(
                          'w-full h-9 flex items-center justify-between px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                          row.isAvailable
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-zinc-700/60 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                        )}
                        title={row.isAvailable ? 'In Stock - Click to mark Out of Stock' : 'Out of Stock - Click to mark In Stock'}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              row.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                            )}
                          />
                          <span className="font-bold text-xs">
                            {row.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <span className="text-[11px] text-zinc-400 hidden sm:inline">
                            {row.isAvailable ? '— Available to customers' : '— Currently unavailable'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {row.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                          <Switch
                            checked={row.isAvailable}
                            onCheckedChange={(checked) => handleUpdateRow(idx, 'isAvailable', checked)}
                            className="pointer-events-none data-[state=checked]:bg-emerald-500"
                            size="sm"
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="w-full border-dashed border-white/20 bg-white/[0.02] text-xs text-[#FCD223] hover:border-[#FCD223]/50 hover:bg-[#FCD223]/10 h-8 cursor-pointer font-semibold"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Another Add-on
              </Button>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAddon}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                `Save ${addonRows.filter((r) => r.name.trim()).length > 1
                  ? `${addonRows.filter((r) => r.name.trim()).length} Add-ons`
                  : 'Add-ons'
                }`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW DETAILS MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto border-white/10 bg-[#121214] p-6 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#FCD223]" />
                <DialogTitle className="text-xl font-black text-white">
                  Add-on Details
                </DialogTitle>
              </div>
              {viewingDish && (
                <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs">
                  {viewingDish.category}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-zinc-400">
              Overview of configured add-on options, pricing, and availability for{' '}
              <strong className="text-white">{viewingDish?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {viewingDish && (
            <div className="space-y-4 py-3">
              {/* Dish Info Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#FCD223]/10 p-2 text-[#FCD223]">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{viewingDish.name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Category: <span className="text-zinc-300">{viewingDish.category}</span>
                    </p>
                  </div>
                </div>

                <Badge className="border-[#FCD223]/30 bg-[#FCD223]/10 text-[#FCD223] font-bold text-xs px-2.5 py-1">
                  {viewingDish.addons.length}{' '}
                  {viewingDish.addons.length === 1 ? 'Add-on' : 'Add-ons'}
                </Badge>
              </div>

              {/* Add-ons List Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden bg-[#18181B]/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Add-on Name</th>
                      <th className="py-2.5 px-3 text-center">Extra Price</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {viewingDish.addons.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-zinc-500 italic">
                          No add-ons configured for this item.
                        </td>
                      </tr>
                    ) : (
                      viewingDish.addons.map((addon, i) => (
                        <tr key={addon.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white capitalize">
                            {addon.name}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-mono font-bold text-[#FCD223] text-xs bg-[#FCD223]/10 px-2 py-0.5 rounded border border-[#FCD223]/20">
                              +€{addon.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                addon.isAvailable
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                              )}
                            >
                              <span
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  addon.isAvailable ? 'bg-emerald-400' : 'bg-zinc-500'
                                )}
                              />
                              {addon.isAvailable ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
            >
              Close
            </Button>

            {viewingDish && (
              <Button
                type="button"
                onClick={() => {
                  const dishId = viewingDish.id;
                  setIsViewOpen(false);
                  handleOpenEditDish(dishId);
                }}
                className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
              >
                <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                Edit Add-ons
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#121214] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Remove Add-ons
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to remove all{' '}
              <strong className="text-white">{deletingDish?.count}</strong> add-on(s) configured for{' '}
              <strong className="text-white">{deletingDish?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Remove Add-ons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
