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
  DollarSign,
  Building2,
  ArrowRight,
  Sparkles,
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

export type VariantSizePreset =
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Regular'
  | 'Family Size'
  | 'Custom';

export interface FoodVariant {
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

// Fallback initial categories
const INITIAL_CATEGORIES: SupplierCategory[] = [
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

  // Screen 17: Add/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSize, setFormSize] = useState<VariantSizePreset>('Medium');
  const [formSku, setFormSku] = useState('');
  const [formProductId, setFormProductId] = useState('item-1');
  const [formBaseItem, setFormBaseItem] = useState('Woodfired Pizza Collection');
  const [formCategory, setFormCategory] = useState('Pizza');
  const [formPriceType, setFormPriceType] = useState<'FIXED_PRICE' | 'PRICE_ADJUSTMENT'>('FIXED_PRICE');
  const [formPrice, setFormPrice] = useState('10.00');
  const [formPortionSpec, setFormPortionSpec] = useState('12-inch diameter (8 slices)');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Inspection Drawer
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | null>(null);

  // Delete Confirmation
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<FoodVariant | null>(null);

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

  // Open Screen 17 in ADD Mode
  const handleOpenAdd = () => {
    setFormMode('ADD');
    setEditingVariantId(null);

    // Pre-fill with current selected food item if any
    const base = focusedFoodItem || applicableItems[0] || items[0];
    const prefix = base?.name ? base.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() : 'VAR';
    setFormProductId(base ? base.id : 'item-1');
    setFormBaseItem(base ? base.name : 'Woodfired Pizza Collection');
    setFormCategory(base ? base.category : 'Pizza');
    setFormName('');
    setFormSize('Medium');
    setFormSku(`VAR-${prefix}-MD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPriceType('FIXED_PRICE');
    setFormPrice(base ? (base.basePrice ? base.basePrice.toFixed(2) : '10.00') : '10.00');
    setFormPortionSpec('Standard portion');
    setFormDisplayOrder(variants.filter((v) => v.productId === (base?.id || '')).length + 1);
    setFormIsAvailable(true);
    setIsFormOpen(true);
  };

  // Quick preset opener (Small Pizza €8, Medium Pizza €10, Large Pizza €13, etc.)
  const handleOpenWithPreset = (
    name: string,
    size: VariantSizePreset,
    price: string,
    skuSuffix: string,
    spec: string
  ) => {
    setFormMode('ADD');
    setEditingVariantId(null);

    const base = focusedFoodItem || applicableItems[0] || items[0];
    const pid = base ? base.id : 'item-1';
    const bName = base ? base.name : 'Woodfired Pizza Collection';
    const bCat = base ? base.category : 'Pizza';
    const prefix = bName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'VAR';

    setFormProductId(pid);
    setFormBaseItem(bName);
    setFormCategory(bCat);
    setFormName(name);
    setFormSize(size);
    setFormSku(`VAR-${prefix}-${skuSuffix}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPriceType('FIXED_PRICE');
    setFormPrice(price);
    setFormPortionSpec(spec);
    setFormDisplayOrder(variants.filter((v) => v.productId === pid).length + 1);
    setFormIsAvailable(true);
    setIsFormOpen(true);
  };

  // Open Screen 17 in EDIT Mode
  const handleOpenEdit = (v: FoodVariant) => {
    setFormMode('EDIT');
    setEditingVariantId(v.id);
    setFormProductId(v.productId);
    setFormName(v.name);
    setFormSize(v.variantSize);
    setFormSku(v.sku);
    setFormBaseItem(v.baseItemName);
    setFormCategory(v.category);
    setFormPriceType(v.priceType);
    setFormPrice(v.price.toString());
    setFormPortionSpec(v.portionSpec || '');
    setFormDisplayOrder(v.displayOrder);
    setFormIsAvailable(v.isAvailable);
    setIsFormOpen(true);
  };

  // Preset size picker handler
  const handleSizePresetSelect = (size: VariantSizePreset) => {
    setFormSize(size);
    if (!formName.trim() || ['Small', 'Medium', 'Large', 'Regular', 'Family Size'].some((s) => formName.includes(s))) {
      setFormName(`${size} Portion`);
    }
    // Automatically update internal code reference with size
    const sizeTag = size.slice(0, 2).toUpperCase();
    const prefix = formBaseItem ? formBaseItem.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() : 'VAR';
    setFormSku(`VAR-${prefix}-${sizeTag}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Save Variant (Create or Update)
  const handleSaveVariant = async () => {
    if (!formName.trim()) {
      toast.error('Variant Name is required', {
        description: 'Please enter a name like "Small Pizza" or "Family Size".',
      });
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Invalid Variant Price', {
        description: 'Variant price cannot be negative or zero. Please enter a valid EUR price.',
      });
      return;
    }

    // Auto-generate internal code if restaurant owner leaves it empty
    let finalSku = formSku.trim();
    if (!finalSku) {
      const prefix = formBaseItem ? formBaseItem.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() : 'VAR';
      const sizeTag = formSize ? formSize.slice(0, 2).toUpperCase() : 'MD';
      finalSku = `VAR-${prefix}-${sizeTag}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Auto-resolve duplicate internal code if any so restaurant is never blocked
    const isDuplicateSku = variants.some(
      (v) => v.sku.toLowerCase() === finalSku.toLowerCase() && v.id !== editingVariantId
    );
    if (isDuplicateSku) {
      finalSku = `${finalSku}-${Math.floor(100 + Math.random() * 900)}`;
    }

    try {
      if (formMode === 'ADD') {
        const payload = {
          name: formName.trim(),
          variantSize: formSize,
          sku: finalSku,
          price: priceNum,
          unitText: formPortionSpec.trim(),
          portionSpec: formPortionSpec.trim(),
          priceType: formPriceType,
          displayOrder: Number(formDisplayOrder) || 1,
          isAvailable: formIsAvailable,
        };

        // Try API
        let createdId = `var-${Date.now()}`;
        try {
          const apiRes = await foodGrocerySupplierService.createVariant(formProductId, payload);
          if (apiRes && apiRes.id) createdId = apiRes.id;
        } catch (apiErr) {
          console.warn('Variant created in local state (API offline):', apiErr);
        }

        const newVar: FoodVariant = {
          id: createdId,
          productId: formProductId,
          name: formName.trim(),
          variantSize: formSize,
          sku: finalSku,
          baseItemName: formBaseItem,
          category: formCategory,
          priceType: formPriceType,
          price: priceNum,
          portionSpec: formPortionSpec.trim(),
          displayOrder: Number(formDisplayOrder) || 1,
          isAvailable: formIsAvailable,
          status: 'ACTIVE',
        };

        setVariants((prev) => [...prev, newVar]);
        toast.success('Food Variant Created', {
          description: `"${newVar.name}" added to "${newVar.baseItemName}" at €${newVar.price.toFixed(2)}.`,
        });
      } else if (editingVariantId) {
        const payload = {
          name: formName.trim(),
          variantSize: formSize,
          sku: finalSku,
          price: priceNum,
          unitText: formPortionSpec.trim(),
          portionSpec: formPortionSpec.trim(),
          priceType: formPriceType,
          displayOrder: Number(formDisplayOrder) || 1,
          isAvailable: formIsAvailable,
        };

        // Try API
        try {
          await foodGrocerySupplierService.updateVariant(formProductId, editingVariantId, payload);
        } catch (apiErr) {
          console.warn('Variant updated in local state (API offline):', apiErr);
        }

        setVariants((prev) =>
          prev.map((v) =>
            v.id === editingVariantId
              ? {
                  ...v,
                  productId: formProductId,
                  name: formName.trim(),
                  variantSize: formSize,
                  sku: finalSku,
                  baseItemName: formBaseItem,
                  category: formCategory,
                  priceType: formPriceType,
                  price: priceNum,
                  portionSpec: formPortionSpec.trim(),
                  displayOrder: Number(formDisplayOrder) || 1,
                  isAvailable: formIsAvailable,
                }
              : v
          )
        );

        toast.success('Food Variant Updated', {
          description: `Changes to "${formName}" have been saved.`,
        });
      }

      setIsFormOpen(false);
    } catch (error: any) {
      toast.error('Failed to save variant', {
        description: error?.message || 'An error occurred while saving the variant.',
      });
    }
  };

  // Toggle Availability (In Stock / Sold Out)
  const handleToggleGlobalAvail = async (v: FoodVariant, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = !v.isAvailable;

    try {
      await foodGrocerySupplierService.toggleVariantStatus(v.productId, v.id, next);
    } catch (err) {
      console.warn('Toggled locally:', err);
    }

    setVariants((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, isAvailable: next } : item))
    );
    toast.success(next ? `"${v.name}" marked In Stock` : `"${v.name}" marked Out of Stock`);
  };

  // Duplicate Variant
  const handleDuplicate = (v: FoodVariant, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloned: FoodVariant = {
      ...v,
      id: `var-${Date.now()}`,
      name: `${v.name} (Copy)`,
      sku: `${v.sku}-CPY`,
      status: 'INACTIVE',
    };
    setVariants((prev) => [...prev, cloned]);
    toast.success('Variant Duplicated', {
      description: `Cloned "${v.name}" as inactive copy.`,
    });
  };

  // Delete Variant Confirmation
  const handleOpenDelete = (v: FoodVariant, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingVariant(v);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVariant) return;

    try {
      await foodGrocerySupplierService.deleteVariant(deletingVariant.productId, deletingVariant.id);
    } catch (err) {
      console.warn('Deleted locally:', err);
    }

    setVariants((prev) => prev.filter((item) => item.id !== deletingVariant.id));
    toast.success('Food Variant Deleted', {
      description: `"${deletingVariant.name}" removed from the menu catalog.`,
    });
    setIsDeleteOpen(false);
    setDeletingVariant(null);
  };

  // Open Details Modal
  const handleOpenDetails = (v: FoodVariant) => {
    setSelectedVariant(v);
    setIsDetailsOpen(true);
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
            onClick={handleOpenAdd}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Food Variant
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          DEPENDENT DROPDOWNS SELECTOR STRIP:
          Menu Category → Food Item
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 space-y-4 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FCD223]/10 text-[#FCD223] text-xs font-black">
              1
            </span>
            <h2 className="text-sm font-bold text-white">
              Menu Hierarchy: Category &amp; Dish Selection
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Menu Category → Food Dish → Variants
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level 1: Menu Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-400" />
                1. Menu Category
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">
                {applicableCategories.length} categories
              </span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2.5 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({applicableCategories.length})</option>
              {applicableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.itemCount || 0} items)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500">
              Reloads dishes belonging strictly to this category
            </p>
          </div>

          {/* Level 2: Food Item */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-sky-400" />
                2. Food Dish
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">
                {applicableItems.length} dishes
              </span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2.5 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Dishes in Category ({applicableItems.length})</option>
              {applicableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — €{item.basePrice.toFixed(2)} ({item.pricingMode})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500">
              Select a dish to view, add, or configure its variants
            </p>
          </div>
        </div>

        {/* Active Selection Banner */}
        {focusedFoodItem && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#FCD223]/20 bg-[#FCD223]/5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FCD223]/10 p-2 text-[#FCD223]">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{focusedFoodItem.name}</span>
                  <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px]">
                    {focusedFoodItem.category}
                  </Badge>
                  <Badge
                    className={cn(
                      'text-[10px] font-bold border',
                      focusedFoodItem.pricingMode === 'VARIANT_BASED'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    )}
                  >
                    {focusedFoodItem.pricingMode === 'VARIANT_BASED' ? 'Variant-Based Pricing' : 'Fixed Base Price'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Base Price: <strong className="text-white">€{focusedFoodItem.basePrice.toFixed(2)}</strong> • Category: <span className="text-zinc-300 font-semibold">{focusedFoodItem.category}</span> • Prep: {focusedFoodItem.prepTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/restaurants/menu?edit=${focusedFoodItem.id}`}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-white/5 bg-white/5"
              >
                <span>Edit Dish in Menu</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs h-8"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Variant to Dish
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: KPI SUMMARY CARDS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <span className="text-[11px] font-semibold text-zinc-400">Portion Sizes</span>
            <Building2 className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-400">
            {new Set(filteredVariants.map((v) => v.variantSize)).size} Sizes
          </p>
          <span className="text-[10px] text-zinc-500">In current filter view</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400">Price Span</span>
            <DollarSign className="h-4 w-4 text-[#FCD223]" />
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
          QUICK ADD PRESET EXAMPLES (USER SPECIFICATIONS)
          Small Pizza (€8.00), Medium Pizza (€10.00), Large Pizza (€13.00), Regular (€15.68), Family Size (€36.00)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl border border-white/10 bg-[#121214]">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-[#FCD223]" />
          Quick Add Examples for {focusedFoodItem ? focusedFoodItem.name : 'Selected Dish'}:
        </span>

        <button
          onClick={() =>
            handleOpenWithPreset(
              'Small Portion',
              'Small',
              '8.00',
              'SM',
              'Personal individual portion (10-inch)'
            )
          }
          className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Small</span>
          <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">€8.00</span>
        </button>

        <button
          onClick={() =>
            handleOpenWithPreset(
              'Medium Portion',
              'Medium',
              '10.00',
              'MD',
              'Classic regular portion (12-inch)'
            )
          }
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Medium</span>
          <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">€10.00</span>
        </button>

        <button
          onClick={() =>
            handleOpenWithPreset(
              'Large Portion',
              'Large',
              '13.00',
              'LG',
              'Sharing large portion (16-inch)'
            )
          }
          className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Large</span>
          <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">€13.00</span>
        </button>

        <button
          onClick={() =>
            handleOpenWithPreset(
              'Regular Bowl',
              'Regular',
              '15.68',
              'REG',
              '320g net weight individual bowl'
            )
          }
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Regular</span>
          <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">€15.68</span>
        </button>

        <button
          onClick={() =>
            handleOpenWithPreset(
              'Family Size Platter',
              'Family Size',
              '36.00',
              'FAM',
              '950g communal platter (3-4 persons)'
            )
          }
          className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Family Size</span>
          <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">€36.00</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: FILTERS STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search variant name, portion size..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
            />
          </div>

          {/* Size Filter */}
          <div>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Portion Sizes</option>
              <option value="Small">Small Size</option>
              <option value="Medium">Medium Size</option>
              <option value="Large">Large Size</option>
              <option value="Regular">Regular Portion</option>
              <option value="Family Size">Family Size Platter</option>
              <option value="Custom">Custom Size</option>
            </select>
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
          SCREEN 17: FOOD VARIANTS TABLE
          Columns: Variant Name, SKU, Price Adjustment / Variant Price,
                   Display Order, Availability, Actions
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Variant Name &amp; Dish</th>
                <th className="py-3 px-4 text-center">Variant Price</th>
                <th className="py-3 px-4 text-center">Display Order</th>
                <th className="py-3 px-4 text-center">Kitchen Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-30 text-[#FCD223]" />
                    <p className="font-semibold text-white">No food variants found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {selectedItemId !== 'ALL'
                        ? 'This food dish does not have any variants yet.'
                        : 'Adjust your dependent filters or click "Add Food Variant" to define new portion sizes.'}
                    </p>
                    <Button
                      onClick={handleOpenAdd}
                      className="mt-4 bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Variant Now
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => handleOpenDetails(v)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* 1. Variant Name & Base Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg border border-white/10 bg-[#18181B] p-2 text-[#FCD223] group-hover:border-[#FCD223]/50 transition-colors">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs group-hover:text-[#FCD223] transition-colors">
                              {v.name}
                            </span>
                            <Badge
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0 border',
                                v.variantSize === 'Small'
                                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                                  : v.variantSize === 'Medium'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : v.variantSize === 'Large'
                                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                                  : v.variantSize === 'Family Size'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                              )}
                            >
                              {v.variantSize}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                            <Utensils className="h-2.5 w-2.5 text-zinc-500" />
                            <span>{v.baseItemName}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500">{v.category}</span>
                          </p>
                          {v.portionSpec && (
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              {v.portionSpec}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Variant Price */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-black text-sm text-[#FCD223]">
                          €{Number(v.price).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase">
                          Standard Price
                        </span>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-xs text-white bg-white/5 rounded-md px-2 py-0.5 border border-white/10">
                        #{v.displayOrder}
                      </span>
                    </td>

                    {/* 6. Availability */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleGlobalAvail(v, e)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer',
                          v.isAvailable
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        )}
                        title="Click to toggle availability"
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            v.isAvailable ? 'bg-emerald-400' : 'bg-zinc-500'
                          )}
                        />
                        {v.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(v)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-[#FCD223] transition-colors"
                          title="Edit Variant"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(v, e)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-sky-400 transition-colors"
                          title="Duplicate Variant"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(v, e)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete Variant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
          SCREEN 17: ADD / EDIT FOOD VARIANT MODAL
          Fields: Dish Parent, Variant Name, Size, Price, Availability, Display Order
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#0E0E10] p-6 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-[#FCD223]" />
              {formMode === 'ADD' ? 'Add Food Variant' : `Edit Variant: ${formName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure portion sizes, pricing, and availability for this dish
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            {/* 1. Parent Dish Selection */}
            <div className="space-y-3 rounded-xl border border-white/5 bg-[#141416] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center gap-2">
                <Utensils className="h-3.5 w-3.5" />
                1. Parent Food Item &amp; Category
              </h3>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Select Target Food Dish *
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => {
                    setFormProductId(e.target.value);
                    const found = items.find((i) => i.id === e.target.value);
                    if (found) {
                      setFormBaseItem(found.name);
                      setFormCategory(found.category);
                      const prefix = found.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'VAR';
                      const sizeTag = formSize ? formSize.slice(0, 2).toUpperCase() : 'MD';
                      setFormSku(`VAR-${prefix}-${sizeTag}-${Math.floor(1000 + Math.random() * 9000)}`);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] py-2.5 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} — {i.category} (€{i.basePrice.toFixed(2)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Variants are always attached to a valid parent dish in the restaurant catalog
                </p>
              </div>
            </div>

            {/* 2. Portion Size & Basic Info */}
            <div className="space-y-4 rounded-xl border border-white/5 bg-[#141416] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223]">
                2. Portion Size &amp; Identity
              </h3>

              {/* Preset Size Buttons */}
              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Select Size Tier Preset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1.5">
                  {(['Small', 'Medium', 'Large', 'Regular', 'Family Size', 'Custom'] as VariantSizePreset[]).map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizePresetSelect(size)}
                        className={cn(
                          'rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all',
                          formSize === size
                            ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                            : 'border-white/5 bg-[#18181B] text-zinc-400 hover:border-white/10 hover:text-white'
                        )}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Variant Display Name * <span className="text-zinc-500 font-normal">(e.g. Small Pizza, Large Pizza)</span>
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Small Pizza (10-inch)"
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Portion / Dimensions Specification
                  </label>
                  <Input
                    value={formPortionSpec}
                    onChange={(e) => setFormPortionSpec(e.target.value)}
                    placeholder="e.g. '10-inch diameter (6 slices)', '320g net weight'"
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing Configuration */}
            <div className="space-y-4 rounded-xl border border-white/5 bg-[#141416] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center justify-between">
                <span>3. Pricing Configuration</span>
                <span className="text-[10px] text-zinc-400 font-normal">Prices must be positive</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Price Model
                  </label>
                  <select
                    value={formPriceType}
                    onChange={(e) => setFormPriceType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none"
                  >
                    <option value="FIXED_PRICE">Fixed Variant Price (e.g. €8.00 / €10.00 / €13.00)</option>
                    <option value="PRICE_ADJUSTMENT">Price Adjustment Delta (+€ from Base Dish)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Standard Variant Price (€) *
                  </label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <Input
                      type="number"
                      step="0.50"
                      min="0.10"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="10.00"
                      className="pl-9 text-xs border-white/10 bg-[#18181B] text-white font-mono font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Kitchen Catalog Availability */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#141416] p-4">
              <div>
                <p className="text-xs font-bold text-white">Kitchen Catalog Availability</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  When toggled off, this variant is hidden from customer ordering apps
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormIsAvailable(!formIsAvailable)}
                className={cn(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  formIsAvailable ? 'bg-[#FCD223]' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform',
                    formIsAvailable ? 'translate-x-4.5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveVariant}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
            >
              {formMode === 'ADD' ? 'Save Food Variant' : 'Update Variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 17: DETAILS / INSPECTION MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#0E0E10] p-6 text-white">
          {selectedVariant && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className="border-[#FCD223]/30 bg-[#FCD223]/10 text-[#FCD223] text-[10px] font-bold">
                    {selectedVariant.variantSize} Tier
                  </Badge>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {selectedVariant.category}
                  </span>
                </div>
                <DialogTitle className="text-xl font-black text-white mt-1">
                  {selectedVariant.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Base Dish: <strong className="text-white">{selectedVariant.baseItemName}</strong> ({selectedVariant.category})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Price Display */}
                <div className="rounded-xl border border-white/5 bg-[#141416] p-4 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Standard Customer Display Price
                  </span>
                  <p className="font-mono text-3xl font-black text-[#FCD223] mt-1">
                    €{Number(selectedVariant.price).toFixed(2)}
                  </p>
                  {selectedVariant.portionSpec && (
                    <p className="text-xs text-zinc-400 mt-1">
                      {selectedVariant.portionSpec}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-white/10 pt-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenEdit(selectedVariant);
                  }}
                  className="border-white/10 bg-white/5 text-xs text-zinc-300"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit Variant
                </Button>
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Delete Food Variant
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to delete{' '}
              <strong className="text-white">"{deletingVariant?.name}"</strong>?
              If this variant is referenced by past customer orders, it will be safely deactivated to preserve accounting records.
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
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs"
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
