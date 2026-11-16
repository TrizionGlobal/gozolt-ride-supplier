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
  Utensils,
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
  Percent,
  RefreshCw,
  ChevronRight,
  ExternalLink,
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

type VariantSizePreset =
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Regular'
  | 'Family Size'
  | 'Custom';

interface FoodVariant {
  id: string;
  productId: string;
  name: string;
  variantSize: VariantSizePreset;
  sku: string;
  baseItemName: string;
  category: string;
  priceType: 'FIXED_PRICE' | 'PRICE_ADJUSTMENT';
  price: number; // e.g. 8.00, 10.00, 13.00
  portionSpec?: string; // e.g. "10-inch (6 slices)", "320g portion"
  displayOrder: number;
  isAvailable: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

interface VariantRow {
  id?: string;
  name: string;
  variantSize?: VariantSizePreset;
  price: string;
  portionSpec?: string;
  isAvailable: boolean;
}

const SIZE_PRESETS: { name: VariantSizePreset; label: string }[] = [
  { name: 'Small', label: 'Small' },
  { name: 'Medium', label: 'Medium' },
  { name: 'Large', label: 'Large' },
  { name: 'Regular', label: 'Regular' },
  { name: 'Family Size', label: 'Family Size' },
  { name: 'Custom', label: 'Custom' },
];

// Fallback initial categories
const INITIAL_CATEGORIES: SupplierCategory[] = [
  {
    id: 'cat-biryani',
    name: 'Biryani & Rice',
    slug: 'biryani-rice',
    description: 'Slow-cooked royal dum biryanis and fragrant basmati rice dishes',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
    displayOrder: 1,
    isActive: true,
    status: 'ACTIVE',
    itemCount: 4,
  },
  {
    id: 'cat-1',
    name: 'Pizza',
    slug: 'pizza',
    description: 'Woodfired artisan sourdough pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    displayOrder: 1,
    isActive: true,
    status: 'ACTIVE',
    itemCount: 16,
  },
  {
    id: 'cat-2',
    name: 'Pasta',
    slug: 'pasta',
    description: 'Fresh bronze-die handmade pasta',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80',
    displayOrder: 2,
    isActive: true,
    status: 'ACTIVE',
    itemCount: 12,
  },
  {
    id: 'cat-3',
    name: 'Burgers',
    slug: 'burgers',
    description: 'Prime Angus smashed patties & brioche buns',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    displayOrder: 3,
    isActive: true,
    status: 'ACTIVE',
    itemCount: 9,
  },
  {
    id: 'cat-5',
    name: 'Main Course',
    slug: 'main-course',
    description: 'Signature seafood, steaks and roasts',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    displayOrder: 4,
    isActive: true,
    status: 'ACTIVE',
    itemCount: 11,
  },
];

// Fallback initial food items
const INITIAL_ITEMS: SupplierItem[] = [
  {
    id: 'item-biryani-1',
    name: 'Royal Hyderabadi Chicken Dum Biryani',
    sku: 'SKU-BRY-001',
    description: 'Fragrant long-grain aged basmati rice slow-cooked on dum with saffron, marinated chicken, caramelised onions, mint and royal spices.',
    categoryId: 'cat-biryani',
    category: 'Biryani & Rice',
    categorySlug: 'biryani-rice',
    basePrice: 8.5,
    pricingMode: 'VARIANT_BASED',
    prepTime: '20-25 min',
    images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80'],
    isAvailable: true,
    isActive: true,
    status: 'ACTIVE',
    isPopular: true,
    isCustomizable: true,
    hasVariants: true,
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    variants: [],
  },
  {
    id: 'item-1',
    name: 'Woodfired Pizza Collection',
    sku: 'SKU-PIZ-001',
    description: 'Signature Italian sourdough pizza with artisan toppings',
    categoryId: 'cat-1',
    category: 'Pizza',
    categorySlug: 'pizza',
    basePrice: 10.0,
    pricingMode: 'VARIANT_BASED',
    prepTime: '15-20 min',
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'],
    isAvailable: true,
    isActive: true,
    status: 'ACTIVE',
    isPopular: true,
    isCustomizable: true,
    hasVariants: true,
    isVegetarian: true,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    variants: [],
  },
  {
    id: 'item-2',
    name: 'Truffle Mushroom Tagliolini',
    sku: 'SKU-PST-001',
    description: 'Handmade tagliolini tossed with black summer truffle and butter',
    categoryId: 'cat-2',
    category: 'Pasta',
    categorySlug: 'pasta',
    basePrice: 15.68,
    pricingMode: 'VARIANT_BASED',
    prepTime: '12-15 min',
    images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80'],
    isAvailable: true,
    isActive: true,
    status: 'ACTIVE',
    isPopular: true,
    isCustomizable: false,
    hasVariants: true,
    isVegetarian: true,
    isVegan: false,
    isHalal: false,
    isGlutenFree: false,
    variants: [],
  },
  {
    id: 'item-3',
    name: 'The Gozolt Prime Angus Smashed Burger',
    sku: 'SKU-BGR-001',
    description: 'Double 150g Angus beef patties with melted cheddar and truffle mayo',
    categoryId: 'cat-3',
    category: 'Burgers',
    categorySlug: 'burgers',
    basePrice: 13.98,
    pricingMode: 'VARIANT_BASED',
    prepTime: '10-15 min',
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'],
    isAvailable: true,
    isActive: true,
    status: 'ACTIVE',
    isPopular: true,
    isCustomizable: true,
    hasVariants: true,
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    variants: [],
  },
  {
    id: 'item-4',
    name: 'Pollo alla Parmigiana Classic',
    sku: 'SKU-MNC-001',
    description: 'Crispy breaded chicken cutlet with melted mozzarella & marinara sauce',
    categoryId: 'cat-5',
    category: 'Main Course',
    categorySlug: 'main-course',
    basePrice: 18.5,
    pricingMode: 'FIXED',
    prepTime: '20-25 min',
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80'],
    isAvailable: true,
    isActive: true,
    status: 'ACTIVE',
    isPopular: false,
    isCustomizable: false,
    hasVariants: false,
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    variants: [],
  },
];

// Fallback initial variants
const INITIAL_VARIANTS: FoodVariant[] = [
  {
    id: 'var-bry-1',
    productId: 'item-biryani-1',
    name: 'Single / Regular Pack',
    variantSize: 'Small',
    sku: 'SKU-BRY-VAR-REG',
    baseItemName: 'Royal Hyderabadi Chicken Dum Biryani',
    category: 'Biryani & Rice',
    priceType: 'FIXED_PRICE',
    price: 8.5,
    portionSpec: 'Serves 1 person • 450g • 1 Succulent Chicken Piece + 1 Boiled Egg',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-bry-2',
    productId: 'item-biryani-1',
    name: 'Medium / Couple Pack',
    variantSize: 'Medium',
    sku: 'SKU-BRY-VAR-MED',
    baseItemName: 'Royal Hyderabadi Chicken Dum Biryani',
    category: 'Biryani & Rice',
    priceType: 'FIXED_PRICE',
    price: 14.5,
    portionSpec: 'Serves 2 persons • 850g • 2 Chicken Pieces + 2 Boiled Eggs + Extra Salan',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-bry-3',
    productId: 'item-biryani-1',
    name: 'Large / Family Pack',
    variantSize: 'Large',
    sku: 'SKU-BRY-VAR-LRG',
    baseItemName: 'Royal Hyderabadi Chicken Dum Biryani',
    category: 'Biryani & Rice',
    priceType: 'FIXED_PRICE',
    price: 22.0,
    portionSpec: 'Serves 3-4 persons • 1.5kg • 4 Chicken Pieces + 3 Boiled Eggs + Double Raita & Salan',
    displayOrder: 3,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-bry-4',
    productId: 'item-biryani-1',
    name: 'Jumbo / Handi Feast',
    variantSize: 'Family Size',
    sku: 'SKU-BRY-VAR-JMB',
    baseItemName: 'Royal Hyderabadi Chicken Dum Biryani',
    category: 'Biryani & Rice',
    priceType: 'FIXED_PRICE',
    price: 34.0,
    portionSpec: 'Serves 6-8 persons • 2.6kg • 7 Chicken Pieces + 5 Boiled Eggs + Clay Handi Pot',
    displayOrder: 4,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-1',
    productId: 'item-1',
    name: 'Small Pizza',
    variantSize: 'Small',
    sku: 'SKU-PIZ-VAR-SM',
    baseItemName: 'Woodfired Pizza Collection',
    category: 'Pizza',
    priceType: 'FIXED_PRICE',
    price: 8.0,
    portionSpec: '10-inch diameter (6 slices, personal)',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-2',
    productId: 'item-1',
    name: 'Medium Pizza',
    variantSize: 'Medium',
    sku: 'SKU-PIZ-VAR-MD',
    baseItemName: 'Woodfired Pizza Collection',
    category: 'Pizza',
    priceType: 'FIXED_PRICE',
    price: 10.0,
    portionSpec: '12-inch diameter (8 slices, classic)',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-3',
    productId: 'item-1',
    name: 'Large Pizza',
    variantSize: 'Large',
    sku: 'SKU-PIZ-VAR-LG',
    baseItemName: 'Woodfired Pizza Collection',
    category: 'Pizza',
    priceType: 'FIXED_PRICE',
    price: 13.0,
    portionSpec: '16-inch diameter (12 slices, sharing)',
    displayOrder: 3,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-4',
    productId: 'item-2',
    name: 'Regular Portion',
    variantSize: 'Regular',
    sku: 'SKU-PST-VAR-REG',
    baseItemName: 'Truffle Mushroom Tagliolini',
    category: 'Pasta',
    priceType: 'FIXED_PRICE',
    price: 15.68,
    portionSpec: 'Standard individual bowl (320g net)',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-5',
    productId: 'item-2',
    name: 'Family Size',
    variantSize: 'Family Size',
    sku: 'SKU-PST-VAR-FAM',
    baseItemName: 'Truffle Mushroom Tagliolini',
    category: 'Pasta',
    priceType: 'FIXED_PRICE',
    price: 36.0,
    portionSpec: 'Communal table platter (3-4 persons, 950g net)',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-6',
    productId: 'item-3',
    name: 'Single Smashed Patty',
    variantSize: 'Small',
    sku: 'SKU-BGR-VAR-SM',
    baseItemName: 'The Gozolt Prime Angus Smashed Burger',
    category: 'Burgers',
    priceType: 'FIXED_PRICE',
    price: 13.98,
    portionSpec: '150g Angus beef patty with toasted brioche',
    displayOrder: 1,
    isAvailable: true,
    status: 'ACTIVE',
  },
  {
    id: 'var-7',
    productId: 'item-3',
    name: 'Double Smashed Monster',
    variantSize: 'Large',
    sku: 'SKU-BGR-VAR-LG',
    baseItemName: 'The Gozolt Prime Angus Smashed Burger',
    category: 'Burgers',
    priceType: 'FIXED_PRICE',
    price: 17.98,
    portionSpec: '2x 150g (300g total beef) with double cheddar',
    displayOrder: 2,
    isAvailable: true,
    status: 'ACTIVE',
  },
];

function RestaurantVariantsContent() {
  const searchParams = useSearchParams();
  const queryItemId = searchParams.get('item');
  const queryCategory = searchParams.get('category');

  // Backend Data State
  const [categories, setCategories] = useState<SupplierCategory[]>(INITIAL_CATEGORIES);
  const [items, setItems] = useState<SupplierItem[]>(INITIAL_ITEMS);
  const [variants, setVariants] = useState<FoodVariant[]>(INITIAL_VARIANTS);
  const [isLoading, setIsLoading] = useState(true);

  // ──────────────────────────────────────────────────────────────────────────
  // DEPENDENT DROPDOWNS STATE (Category → Food Item)
  // ──────────────────────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string>('ALL');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Add/Edit Multi-Variant Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formProductId, setFormProductId] = useState('');

  // Multi-row variants state (starts with 1 row by default)
  const [variantRows, setVariantRows] = useState<VariantRow[]>([
    { name: '', price: '', portionSpec: '', isAvailable: true },
  ]);

  const handleAddVariantRow = () => {
    setVariantRows((prev) => [
      ...prev,
      { name: '', price: '', portionSpec: '', isAvailable: true },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variantRows.length <= 1) {
      setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
      return;
    }
    setVariantRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariantRow = (
    index: number,
    field: keyof VariantRow,
    value: any
  ) => {
    setVariantRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // Inspection/View Modal State (per Food Item)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingDish, setViewingDish] = useState<{
    id: string;
    name: string;
    category: string;
    basePrice: number;
    variants: FoodVariant[];
    count: number;
  } | null>(null);

  const handleOpenView = (dishGroup: {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    variants: FoodVariant[];
    count: number;
  }) => {
    setViewingDish(dishGroup);
    setIsDetailsOpen(true);
  };

  // Delete Confirmation (per Food Item)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDish, setDeletingDish] = useState<{ id: string; name: string; count: number } | null>(null);

  const handleOpenDeleteDish = (dishId: string, dishName: string, count: number) => {
    setDeletingDish({ id: dishId, name: dishName, count });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingDish) return;
    setVariants((prev) => prev.filter((v) => v.productId !== deletingDish.id));
    toast.success('Variants Removed', {
      description: `All ${deletingDish.count} variant(s) removed for ${deletingDish.name}.`,
    });
    setIsDeleteOpen(false);
    setDeletingDish(null);
  };

  // ── Load Menu Data from Backend ──────────────────────────────────────────
  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const data = await foodGrocerySupplierService.getMenu();
      if (data) {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          // Extract existing variants from products
          const backendVariants: FoodVariant[] = [];
          data.items.forEach((item) => {
            if (item.variants && item.variants.length > 0) {
              item.variants.forEach((v: any) => {
                backendVariants.push({
                  id: v.id,
                  productId: item.id,
                  name: v.name,
                  variantSize: (v.variantSize as VariantSizePreset) || 'Medium',
                  sku: v.sku || `SKU-${item.sku}-${v.id.slice(-4)}`,
                  baseItemName: item.name,
                  category: item.category,
                  priceType: v.priceType || 'FIXED_PRICE',
                  price: typeof v.price === 'number' ? v.price : parseFloat(v.price) || 0,
                  portionSpec: v.portionSpec || '',
                  displayOrder: v.displayOrder || 1,
                  isAvailable: v.isAvailable ?? true,
                  status: v.isActive ? 'ACTIVE' : 'INACTIVE',
                });
              });
            }
          });
          if (backendVariants.length > 0) {
            setVariants(backendVariants);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load backend menu variants, keeping local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Handle URL Query Params for deep-linking from Menu Items screen
  useEffect(() => {
    if (queryCategory) {
      const matchCat = categories.find(
        (c) => c.slug === queryCategory || c.name.toLowerCase() === queryCategory.toLowerCase()
      );
      if (matchCat) {
        setSelectedCategoryId(matchCat.id);
      }
    }
    if (queryItemId) {
      setSelectedItemId(queryItemId);
      const matchItem = items.find((i) => i.id === queryItemId);
      if (matchItem && matchItem.categoryId) {
        setSelectedCategoryId(matchItem.categoryId);
      }
    }
  }, [queryItemId, queryCategory, categories, items]);

  // ──────────────────────────────────────────────────────────────────────────
  // DEPENDENT FILTER LOGIC:
  // Menu Category → Food Dishes
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Categories
  const applicableCategories = useMemo(() => {
    return categories;
  }, [categories]);

  // 2. Food Items applicable to selected category
  const applicableItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        selectedCategoryId === 'ALL' ||
        item.categoryId === selectedCategoryId ||
        item.categorySlug === selectedCategoryId ||
        item.category.toLowerCase() === selectedCategoryId.toLowerCase();

      return matchCategory;
    });
  }, [items, selectedCategoryId]);

  // When category changes: reload applicable items; if selected item is no longer in category, reset to ALL or first item
  const handleCategoryChange = (newCatId: string) => {
    setSelectedCategoryId(newCatId);
    setSelectedItemId('ALL');
  };

  // Currently focused food item object
  const focusedFoodItem = useMemo(() => {
    if (selectedItemId === 'ALL') return null;
    return items.find((i) => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  // Filtered Variants for Screen 17
  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      // 1. Dependent Food Item filter
      if (selectedItemId !== 'ALL' && v.productId !== selectedItemId) {
        return false;
      }

      // 2. Dependent Category filter (if item is ALL)
      if (selectedCategoryId !== 'ALL') {
        const catObj = categories.find((c) => c.id === selectedCategoryId);
        const catName = catObj ? catObj.name.toLowerCase() : selectedCategoryId.toLowerCase();
        if (v.category.toLowerCase() !== catName) {
          return false;
        }
      }

      // 3. Search filter
      const matchSearch =
        !searchTerm ||
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.baseItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.portionSpec && v.portionSpec.toLowerCase().includes(searchTerm.toLowerCase()));

      // 4. Size & Availability filter
      const matchSize = sizeFilter === 'ALL' || v.variantSize === sizeFilter;
      const matchAvail =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'IN_STOCK' && v.isAvailable) ||
        (availabilityFilter === 'OUT_OF_STOCK' && !v.isAvailable);

      return matchSearch && matchSize && matchAvail;
    });
  }, [variants, selectedItemId, selectedCategoryId, categories, searchTerm, sizeFilter, availabilityFilter]);

  // Grouped by Food Dish for Table Display (Most recently added/updated dishes appear at the very first place)
  const dishesWithVariants = useMemo(() => {
    const seenItemIds = new Set<string>();
    const orderedItemIds: string[] = [];

    // Prioritize dish order by their appearance in variants (newest/most recent first)
    variants.forEach((v) => {
      if (!seenItemIds.has(v.productId)) {
        seenItemIds.add(v.productId);
        orderedItemIds.push(v.productId);
      }
    });

    // Append any remaining available items
    applicableItems.forEach((item) => {
      if (!seenItemIds.has(item.id)) {
        seenItemIds.add(item.id);
        orderedItemIds.push(item.id);
      }
    });

    return orderedItemIds
      .map((itemId) => {
        const dish = items.find((d) => d.id === itemId);
        if (!dish) return null;
        const dishVariants = variants.filter((v) => v.productId === dish.id);
        return {
          ...dish,
          variants: dishVariants,
          count: dishVariants.length,
        };
      })
      .filter((group): group is NonNullable<typeof group> => {
        if (!group) return false;
        // If user selected a specific dish in dropdown:
        if (selectedItemId !== 'ALL' && group.id !== selectedItemId) {
          return false;
        }

        // If user selected a specific category:
        if (selectedCategoryId !== 'ALL') {
          const catObj = categories.find((c) => c.id === selectedCategoryId);
          const catName = catObj ? catObj.name.toLowerCase() : selectedCategoryId.toLowerCase();
          if (group.category.toLowerCase() !== catName) {
            return false;
          }
        }

        // If user typed search:
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDish =
            group.name.toLowerCase().includes(term) ||
            group.category.toLowerCase().includes(term);
          const matchVariant = group.variants.some((v) =>
            v.name.toLowerCase().includes(term) ||
            v.variantSize.toLowerCase().includes(term) ||
            (v.portionSpec && v.portionSpec.toLowerCase().includes(term))
          );
          return matchDish || matchVariant;
        }

        // If size filter is applied:
        if (sizeFilter !== 'ALL') {
          return group.variants.some((v) => v.variantSize === sizeFilter);
        }

        // If availability filter is applied:
        if (availabilityFilter !== 'ALL') {
          return group.variants.some((v) =>
            availabilityFilter === 'IN_STOCK' ? v.isAvailable : !v.isAvailable
          );
        }

        // If "ALL" is selected and no search, show dishes that have variants configured!
        return group.count > 0;
      });
  }, [variants, applicableItems, items, selectedItemId, selectedCategoryId, categories, searchTerm, sizeFilter, availabilityFilter]);

  // Target dish selected in modal
  const targetDish = useMemo(() => {
    return items.find((i) => i.id === formProductId) || null;
  }, [items, formProductId]);

  // When user changes target food dish in modal dropdown:
  const handleTargetProductChange = (productId: string) => {
    setFormProductId(productId);
    if (!productId) {
      setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
      return;
    }
    const existing = variants.filter((v) => v.productId === productId);
    if (existing.length > 0) {
      setVariantRows(
        existing.map((v) => ({
          id: v.id,
          name: v.name,
          variantSize: v.variantSize,
          price: v.price.toFixed(2),
          portionSpec: v.portionSpec || '',
          isAvailable: v.isAvailable !== false,
        }))
      );
    } else {
      setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
    }
  };

  // Open Modal to Add
  const handleOpenAdd = (targetProductId?: string) => {
    setFormMode('ADD');
    const chosenId = targetProductId || (selectedItemId !== 'ALL' ? selectedItemId : '');
    setFormProductId(chosenId);
    if (chosenId) {
      const existing = variants.filter((v) => v.productId === chosenId);
      if (existing.length > 0) {
        setVariantRows(
          existing.map((v) => ({
            id: v.id,
            name: v.name,
            variantSize: v.variantSize,
            price: v.price.toFixed(2),
            portionSpec: v.portionSpec || '',
            isAvailable: v.isAvailable !== false,
          }))
        );
      } else {
        setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
      }
    } else {
      setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
    }
    setIsFormOpen(true);
  };

  // Open Modal to Edit for a Food Dish
  const handleOpenEditDish = (dishId: string) => {
    setFormMode('EDIT');
    setFormProductId(dishId);
    const existing = variants.filter((v) => v.productId === dishId);
    if (existing.length > 0) {
      setVariantRows(
        existing.map((v) => ({
          id: v.id,
          name: v.name,
          variantSize: v.variantSize,
          price: v.price.toFixed(2),
          portionSpec: v.portionSpec || '',
          isAvailable: v.isAvailable !== false,
        }))
      );
    } else {
      setVariantRows([{ name: '', price: '', portionSpec: '', isAvailable: true }]);
    }
    setIsFormOpen(true);
  };

  // Save Variants for the selected Food Dish
  const handleSaveVariants = async () => {
    if (!formProductId) {
      toast.error('Validation Error', { description: 'Please select a food item.' });
      return;
    }

    const matchedDish = items.find((i) => i.id === formProductId);
    if (!matchedDish) {
      toast.error('Validation Error', { description: 'Please select a valid food item.' });
      return;
    }

    const validRows = variantRows.filter((r) => r.name.trim() !== '');
    if (validRows.length === 0) {
      toast.error('Validation Error', { description: 'Please enter at least one variant name.' });
      return;
    }

    for (const row of validRows) {
      const priceNum = parseFloat(row.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error('Validation Error', {
          description: `Please enter a valid price for "${row.name}".`,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prioritize newly added rows so they appear first inside the dish's variant chips
      const newRows = validRows.filter((r) => !r.id);
      const existingRows = validRows.filter((r) => !!r.id);
      const sortedValidRows = [...newRows, ...existingRows];

      const updatedDishVariants: FoodVariant[] = sortedValidRows.map((row, idx) => ({
        id: row.id || `var-${Date.now()}-${idx}`,
        productId: matchedDish.id,
        name: row.name.trim(),
        variantSize: row.variantSize || 'Regular',
        sku: `VAR-${matchedDish.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-${(row.variantSize || 'Regular').slice(0, 2).toUpperCase()}-${idx + 100}`,
        baseItemName: matchedDish.name,
        category: matchedDish.category,
        priceType: 'FIXED_PRICE',
        price: parseFloat(row.price) || 0,
        portionSpec: row.portionSpec?.trim() || '',
        displayOrder: idx + 1,
        isAvailable: row.isAvailable !== false,
        status: 'ACTIVE',
      }));

      // Prepend updated dish variants so this dish appears at the FIRST place on the table
      setVariants((prev) => {
        const remaining = prev.filter((v) => v.productId !== matchedDish.id);
        return [...updatedDishVariants, ...remaining];
      });

      toast.success('Food Variants Saved', {
        description: `${updatedDishVariants.length} variant(s) configured for ${matchedDish.name}.`,
      });

      setIsFormOpen(false);
    } catch (err: any) {
      toast.error('Failed to save variants', {
        description: err?.message || 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle In Stock / Out of Stock for a single Variant
  const handleToggleVariantAvailability = (variantId: string) => {
    const target = variants.find((v) => v.id === variantId);
    if (!target) return;
    const nextStatus = !target.isAvailable;
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, isAvailable: nextStatus } : v))
    );
    toast.success(
      nextStatus ? 'Marked In Stock' : 'Marked Out of Stock',
      {
        description: `"${target.name}" is now ${nextStatus ? 'active (In Stock)' : 'inactive (Out of Stock)'}.`,
      }
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: FOOD VARIANTS HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <Link href="/restaurants/menu" className="hover:text-white transition-colors">Menu Catalog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#FCD223] font-semibold">Food Variants</span>
          </div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Layers className="h-7 w-7 text-[#FCD223]" />
            Food Variants Management
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Configure portion sizes, dish variations, and pricing across your dishes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchMenuData}
            className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>

          <Button
            onClick={() => handleOpenAdd()}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Food Variant
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: KPI SUMMARY CARDS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400">Total Variants</span>
            <Layers className="h-4 w-4 text-[#FCD223]" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{filteredVariants.length}</p>
          <span className="text-[10px] text-zinc-500">
            {selectedItemId !== 'ALL' ? 'Under selected dish' : `Across ${items.length} total dishes`}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400">Active in Kitchen</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            {filteredVariants.filter((v) => v.isAvailable).length}
          </p>
          <span className="text-[10px] text-zinc-500">Available for customer checkout</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400">Price Span</span>
            <Euro className="h-4 w-4 text-[#FCD223]" />
          </div>
          <p className="mt-2 text-2xl font-black text-white font-mono">
            {filteredVariants.length > 0
              ? `€${Math.min(...filteredVariants.map((v) => v.price)).toFixed(2)} – €${Math.max(...filteredVariants.map((v) => v.price)).toFixed(2)}`
              : '€0.00'}
          </p>
          <span className="text-[10px] text-zinc-500">Min to max variant pricing</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: FILTERS STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search variant name or food item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock Availability</option>
              <option value="IN_STOCK">In Stock (Kitchen Ready)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: FOOD VARIANTS TABLE (GROUPED BY FOOD ITEM)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Food Item</th>
                <th className="py-3 px-4">Configured Variants</th>
                <th className="py-3 px-4 text-center">Total Variants</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {dishesWithVariants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#FCD223]" />
                    <p className="font-semibold text-white">No food variants found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {selectedItemId !== 'ALL'
                        ? 'This food dish does not have any variants yet.'
                        : 'Adjust your dependent filters or click "Add Food Variant" to define new portion sizes.'}
                    </p>
                    <Button
                      onClick={() => handleOpenAdd()}
                      className="mt-4 bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Variant Now
                    </Button>
                  </td>
                </tr>
              ) : (
                dishesWithVariants.map((dishGroup) => (
                  <tr
                    key={dishGroup.id}
                    className="hover:bg-white/[0.02] transition-colors border-b border-white/5"
                  >
                    {/* 1. Food Item */}
                    <td className="py-4 px-4 align-top w-72">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">
                          {dishGroup.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                            {dishGroup.category}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Base: €{Number(dishGroup.basePrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Configured Variants */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        {dishGroup.variants.length === 0 ? (
                          <span className="text-xs text-zinc-500 italic">No variants configured</span>
                        ) : (
                          dishGroup.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors',
                                variant.isAvailable
                                  ? 'border-white/10 bg-white/[0.03] text-zinc-200'
                                  : 'border-white/5 bg-white/[0.01] text-zinc-500 line-through opacity-70'
                              )}
                            >
                              <div className="flex items-center gap-1.5 font-medium">
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full',
                                    variant.isAvailable ? 'bg-emerald-400' : 'bg-zinc-600'
                                  )}
                                />
                                <span>{variant.name}</span>
                              </div>

                              <span className="font-mono font-bold text-[#FCD223] text-xs">
                                €{Number(variant.price).toFixed(2)}
                              </span>

                              {/* Stock Toggle pill button */}
                              <button
                                type="button"
                                onClick={() => handleToggleVariantAvailability(variant.id)}
                                title={variant.isAvailable ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ml-1 cursor-pointer',
                                  variant.isAvailable
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                )}
                              >
                                {variant.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>

                    {/* 3. Total Variants */}
                    <td className="py-4 px-4 align-top text-center w-36">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FCD223]/10 text-[#FCD223] border border-[#FCD223]/20">
                        {dishGroup.count} {dishGroup.count === 1 ? 'Variant' : 'Variants'}
                      </span>
                    </td>

                    {/* 4. Actions: View, Edit, Delete */}
                    <td className="py-4 px-4 align-top text-right w-32">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            handleOpenView({
                              id: dishGroup.id,
                              name: dishGroup.name,
                              category: dishGroup.category,
                              basePrice: Number(dishGroup.basePrice) || 0,
                              variants: dishGroup.variants,
                              count: dishGroup.count,
                            })
                          }
                          className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDish(dishGroup.id)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-[#FCD223] transition-colors cursor-pointer"
                          title="Edit Variants"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleOpenDeleteDish(dishGroup.id, dishGroup.name, dishGroup.count)
                          }
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete All Variants"
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
          SCREEN 17: ADD / EDIT MULTI-VARIANT MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#0E0E10] p-6 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-[#FCD223]" />
              {formMode === 'ADD' ? 'Add Food Variants' : `Manage Variants: ${targetDish?.name || 'Food Item'}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure variant options, prices, and kitchen availability (In Stock / Out of Stock).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Target Food Item Selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Target Food Item *
              </label>
              <select
                value={formProductId}
                onChange={(e) => handleTargetProductChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2.5 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
              >
                <option value="">Select Food Item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Variants List Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Variants List
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-[#FCD223] font-bold border border-[#FCD223]/20">
                  {variantRows.filter((r) => r.name.trim()).length} of {variantRows.length} filled
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">
                Manage variant options, extra prices & availability
              </span>
            </div>

            {/* Dynamic Variant Rows */}
            <div className="space-y-3">
              {variantRows.map((row, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-white/10 bg-[#141416] space-y-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Variant Name */}
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1 uppercase">
                        Variant Name *
                      </label>
                      <Input
                        value={row.name}
                        onChange={(e) => handleUpdateVariantRow(index, 'name', e.target.value)}
                        placeholder="Enter Variant Name"
                        className="capitalize text-xs border-white/10 bg-[#18181B] text-white placeholder:text-[10px] sm:placeholder:text-[11px] placeholder:text-zinc-500"
                      />
                    </div>

                    {/* Price (€) */}
                    <div className="w-36 sm:w-44">
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1 uppercase">
                        Price (€) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono">
                          €
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.price}
                          onChange={(e) => handleUpdateVariantRow(index, 'price', e.target.value)}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                          }}
                          placeholder="Enter Price"
                          className="pl-7 text-xs border-white/10 bg-[#18181B] text-white font-mono placeholder:text-[10px] sm:placeholder:text-[11px] placeholder:text-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Delete Row button */}
                    {variantRows.length > 1 && (
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(index)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Remove variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Full-width Availability Toggle */}
                  <div className="pt-1 border-t border-white/5">
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5 uppercase">
                      Availability
                    </label>
                    <div className="flex items-center justify-between w-full rounded-xl border border-white/5 bg-[#18181B] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            row.isAvailable ? 'bg-emerald-400' : 'bg-zinc-600'
                          )}
                        />
                        <span className="text-xs font-semibold text-zinc-300">
                          {row.isAvailable ? 'In Stock (Active)' : 'Out of Stock (Inactive)'}
                        </span>
                      </div>
                      <Switch
                        checked={row.isAvailable}
                        onCheckedChange={(checked) =>
                          handleUpdateVariantRow(index, 'isAvailable', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Variant Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVariantRow}
              className="w-full border-dashed border-white/20 bg-transparent text-xs text-[#FCD223] hover:bg-white/5 hover:border-[#FCD223]/50 py-2.5 cursor-pointer"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Another Variant
            </Button>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveVariants}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : formMode === 'ADD' ? (
                'Save Food Variants'
              ) : (
                'Update Variants'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: DETAILS / INSPECTION MODAL (PER FOOD ITEM)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#0E0E10] p-6 text-white max-h-[85vh] overflow-y-auto">
          {viewingDish && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className="border-[#FCD223]/30 bg-[#FCD223]/10 text-[#FCD223] text-[10px] font-bold">
                    {viewingDish.category}
                  </Badge>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Base Price: €{Number(viewingDish.basePrice).toFixed(2)}
                  </span>
                </div>
                <DialogTitle className="text-xl font-black text-white mt-1">
                  {viewingDish.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Total {viewingDish.variants.length} configured portion size {viewingDish.variants.length === 1 ? 'variant' : 'variants'}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-[#121214] overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400 uppercase">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Variant Name</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {viewingDish.variants.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-zinc-500 italic">
                            No variants configured yet.
                          </td>
                        </tr>
                      ) : (
                        viewingDish.variants.map((v, i) => (
                          <tr key={v.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                              {i + 1}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">
                              {v.name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#FCD223]">
                              €{Number(v.price).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                  v.isAvailable
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                                )}
                              >
                                {v.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter className="border-t border-white/10 pt-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    const dId = viewingDish.id;
                    setIsDetailsOpen(false);
                    setViewingDish(null);
                    handleOpenEditDish(dId);
                  }}
                  className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Variants
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setViewingDish(null);
                  }}
                  className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL (PER FOOD ITEM)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Delete Food Dish Variants
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-2">
              Are you sure you want to delete all variants configured for{' '}
              <strong className="text-white">"{deletingDish?.name}"</strong>?
              This will remove {deletingDish?.count || 0} variant option(s) from this food dish.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingDish(null);
              }}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RestaurantVariantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-zinc-400">
          <RefreshCw className="h-5 w-5 animate-spin text-[#FCD223] mr-2" />
          Loading Food Variants Hierarchy...
        </div>
      }
    >
      <RestaurantVariantsContent />
    </Suspense>
  );
}
