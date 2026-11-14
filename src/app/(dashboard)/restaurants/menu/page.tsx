'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Power,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Clock,
  Layers,
  Sliders,
  Flame,
  Grid,
  List,
  Sparkles,
  Building2,
  ChevronDown,
  Upload,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  Check,
  Percent,
  Globe,
  Radio,
  SlidersHorizontal,
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

export interface FoodVariantItem {
  id?: string;
  name: string;
  variantSize?: string;
  sku?: string;
  price: number;
  originalPrice?: number | null;
  portionSpec?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface FoodItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  categorySlug: string;
  description: string;
  images: string[];
  prepTime: string;
  // Pricing
  pricingMode: 'FIXED' | 'VARIANT_BASED';
  basePrice: number;
  vatRate: number; // percentage, e.g. 18
  discountPrice?: number | null;
  // Food info
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isSpicy: boolean;
  spicyLevel?: 'Mild' | 'Medium' | 'Hot';
  calories?: string;
  servingSize?: string;
  // Customization & Variants
  hasVariants: boolean;
  hasAddons: boolean;
  isCustomizable: boolean;
  addonGroups: string[];
  variants: FoodVariantItem[];
  hasMandatoryOptions: boolean;
  hasOptionalOptions: boolean;
  // Availability
  isAvailable: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  scheduledAvailability: string;
}

export default function RestaurantFoodItemsPage() {
  const [categories, setCategories] = useState<SupplierCategory[]>([
    { id: 'cat-1', name: 'Pizza', slug: 'pizza', description: 'Woodfired artisan pizzas', imageUrl: '', displayOrder: 1, isActive: true, status: 'ACTIVE', itemCount: 3 },
    { id: 'cat-2', name: 'Pasta', slug: 'pasta', description: 'Fresh durum pasta', imageUrl: '', displayOrder: 2, isActive: true, status: 'ACTIVE', itemCount: 2 },
    { id: 'cat-3', name: 'Burgers', slug: 'burgers', description: 'Smashed prime Angus', imageUrl: '', displayOrder: 3, isActive: true, status: 'ACTIVE', itemCount: 1 },
    { id: 'cat-4', name: 'Starters', slug: 'starters', description: 'Authentic antipasti', imageUrl: '', displayOrder: 4, isActive: true, status: 'ACTIVE', itemCount: 1 },
    { id: 'cat-5', name: 'Main Course', slug: 'main-course', description: 'Signature cuts & fish', imageUrl: '', displayOrder: 5, isActive: true, status: 'ACTIVE', itemCount: 1 },
    { id: 'cat-6', name: 'Desserts', slug: 'desserts', description: 'Traditional Italian sweets', imageUrl: '', displayOrder: 6, isActive: true, status: 'ACTIVE', itemCount: 1 },
    { id: 'cat-7', name: 'Beverages', slug: 'beverages', description: 'Craft drinks & DOC wines', imageUrl: '', displayOrder: 7, isActive: true, status: 'ACTIVE', itemCount: 0 },
    { id: 'cat-8', name: 'Salads', slug: 'salads', description: 'Fresh organic greens', imageUrl: '', displayOrder: 8, isActive: true, status: 'ACTIVE', itemCount: 1 },
  ]);

  const [isMenuPublished, setIsMenuPublished] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishChecking, setPublishChecking] = useState(false);

  // Pre-populated Food Items Catalog with complete relationships
  const [items, setItems] = useState<FoodItem[]>([
    {
      id: 'dish-1',
      name: 'Truffle Mushroom Tagliolini',
      sku: 'SKU-PST-001',
      category: 'Pasta',
      categoryId: 'cat-2',
      categorySlug: 'pasta',
      description: 'Handcrafted fresh durum egg tagliolini tossed with sautéed Porcini mushrooms, black summer truffle carpaccio, and cold-extracted aged truffle emulsion.',
      images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80'],
      prepTime: '14 min',
      pricingMode: 'FIXED',
      basePrice: 15.68,
      vatRate: 18,
      discountPrice: null,
      isVegetarian: true,
      isVegan: false,
      isHalal: false,
      isSpicy: false,
      calories: '680 kcal',
      servingSize: '320g portion',
      hasVariants: true,
      hasAddons: true,
      isCustomizable: true,
      addonGroups: ['Truffle Butter & Shavings', 'Pasta Modifiers'],
      variants: [
        { id: 'v-1', name: 'Regular Portion', variantSize: 'Regular', sku: 'SKU-PST-001-REG', price: 15.68, portionSpec: '320g pasta portion', isAvailable: true, isActive: true },
        { id: 'v-2', name: 'Large Portion (1.5x)', variantSize: 'Large', sku: 'SKU-PST-001-LG', price: 19.50, portionSpec: '480g hearty portion', isAvailable: true, isActive: true },
      ],
      hasMandatoryOptions: false,
      hasOptionalOptions: true,
      isAvailable: true,
      status: 'ACTIVE',
      scheduledAvailability: 'All Day (10:00 - 23:00)',
    },
    {
      id: 'dish-2',
      name: 'Woodfired Pizza Diavola',
      sku: 'SKU-PIZ-002',
      category: 'Pizza',
      categoryId: 'cat-1',
      categorySlug: 'pizza',
      description: '48-hour fermented sourdough crust, San Marzano D.O.P. tomato sauce, Fior di Latte mozzarella, spicy Calabrian spianata salami, and hot honey drizzle.',
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'],
      prepTime: '11 min',
      pricingMode: 'VARIANT_BASED',
      basePrice: 0,
      vatRate: 18,
      discountPrice: null,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      isSpicy: true,
      spicyLevel: 'Hot',
      calories: '890 kcal',
      servingSize: '12-inch pizza',
      hasVariants: true,
      hasAddons: true,
      isCustomizable: true,
      addonGroups: ['Pizza Crust Styles', 'Extra Toppings'],
      variants: [
        { id: 'v-piz-sm', name: 'Small Pizza (10-inch)', variantSize: 'Small', sku: 'SKU-PIZ-002-SM', price: 10.00, portionSpec: '10-inch (6 slices)', isAvailable: true, isActive: true },
        { id: 'v-piz-md', name: 'Medium Pizza (12-inch)', variantSize: 'Medium', sku: 'SKU-PIZ-002-MD', price: 13.50, portionSpec: '12-inch (8 slices)', isAvailable: true, isActive: true },
        { id: 'v-piz-lg', name: 'Large Pizza (16-inch)', variantSize: 'Large', sku: 'SKU-PIZ-002-LG', price: 16.50, portionSpec: '16-inch (12 slices)', isAvailable: true, isActive: true },
      ],
      hasMandatoryOptions: true,
      hasOptionalOptions: true,
      isAvailable: true,
      status: 'ACTIVE',
      scheduledAvailability: 'All Day (10:00 - 23:00)',
    },
    {
      id: 'dish-3',
      name: 'Pizza Margherita D.O.P.',
      sku: 'SKU-PIZ-003',
      category: 'Pizza',
      categoryId: 'cat-1',
      categorySlug: 'pizza',
      description: 'The authentic Neapolitan classic: certified San Marzano D.O.P. tomatoes, fresh Buffalo Mozzarella di Campana, extra virgin olive oil, and fresh basil.',
      images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'],
      prepTime: '10 min',
      pricingMode: 'FIXED',
      basePrice: 9.32,
      vatRate: 18,
      discountPrice: null,
      isVegetarian: true,
      isVegan: false,
      isHalal: false,
      isSpicy: false,
      calories: '760 kcal',
      servingSize: '12-inch pizza (380g)',
      hasVariants: true,
      hasAddons: true,
      isCustomizable: true,
      addonGroups: ['Pizza Crust Styles', 'Extra Cheese Options'],
      variants: [
        { id: 'v-mar-1', name: 'Personal (10-inch)', variantSize: 'Small', sku: 'SKU-PIZ-003-SM', price: 8.50, portionSpec: '10-inch', isAvailable: true, isActive: true },
        { id: 'v-mar-2', name: 'Classic (12-inch)', variantSize: 'Medium', sku: 'SKU-PIZ-003-MD', price: 11.00, portionSpec: '12-inch', isAvailable: true, isActive: true },
      ],
      hasMandatoryOptions: false,
      hasOptionalOptions: true,
      isAvailable: true,
      status: 'ACTIVE',
      scheduledAvailability: 'All Day (10:00 - 23:00)',
    },
    {
      id: 'dish-4',
      name: 'The Gozolt Prime Angus Smashed Burger',
      sku: 'SKU-BGR-004',
      category: 'Burgers',
      categoryId: 'cat-3',
      categorySlug: 'burgers',
      description: 'Double 150g smashed prime Irish Angus patties, double American melted cheese, house dill pickles, caramelized shallots, and secret smoky sauce in a brioche bun.',
      images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'],
      prepTime: '12 min',
      pricingMode: 'FIXED',
      basePrice: 13.98,
      vatRate: 18,
      discountPrice: null,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      isSpicy: false,
      calories: '920 kcal',
      servingSize: 'Double patty (420g)',
      hasVariants: true,
      hasAddons: true,
      isCustomizable: true,
      addonGroups: ['Burger Temperature', 'Additional Patties & Bacon'],
      variants: [
        { id: 'v-bgr-1', name: 'Single Patty (150g)', variantSize: 'Small', sku: 'SKU-BGR-004-SM', price: 13.98, portionSpec: 'Single 150g patty', isAvailable: true, isActive: true },
        { id: 'v-bgr-2', name: 'Double Monster (300g)', variantSize: 'Large', sku: 'SKU-BGR-004-LG', price: 17.50, portionSpec: 'Double 300g patty', isAvailable: true, isActive: true },
      ],
      hasMandatoryOptions: true,
      hasOptionalOptions: true,
      isAvailable: true,
      status: 'ACTIVE',
      scheduledAvailability: 'All Day (10:00 - 23:00)',
    },
    {
      id: 'dish-5',
      name: 'Burrata Pugliese & Prosciutto San Daniele',
      sku: 'SKU-STR-005',
      category: 'Starters',
      categoryId: 'cat-4',
      categorySlug: 'starters',
      description: '250g whole cream-filled Pugliese burrata ball served with 24-month aged San Daniele prosciutto crudo, Ligurian fig compote, and grilled pane carasau.',
      images: ['https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80'],
      prepTime: '6 min',
      pricingMode: 'FIXED',
      basePrice: 10.59,
      vatRate: 18,
      discountPrice: null,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      isSpicy: false,
      calories: '450 kcal',
      servingSize: '250g Antipasto',
      hasVariants: false,
      hasAddons: true,
      isCustomizable: false,
      addonGroups: ['Gourmet Luxury Finishes'],
      variants: [],
      hasMandatoryOptions: false,
      hasOptionalOptions: true,
      isAvailable: true,
      status: 'ACTIVE',
      scheduledAvailability: 'All Day (10:00 - 23:00)',
    },
  ]);

  // Load from backend on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await foodGrocerySupplierService.getMenu();
        if (res) {
          if (res.categories && res.categories.length > 0) {
            setCategories(res.categories);
          }
          if (res.items && res.items.length > 0) {
            setItems((prev) => {
              const remote = res.items.map((it) => ({
                id: it.id,
                name: it.name,
                sku: it.sku || `SKU-${it.id.substring(0, 6)}`,
                category: it.category || 'General',
                categoryId: it.categoryId,
                categorySlug: it.categorySlug || 'general',
                description: it.description || '',
                images: it.images && it.images.length > 0 ? it.images : [it.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'],
                prepTime: it.prepTime || '15 min',
                pricingMode: it.pricingMode || (it.basePrice === 0 ? 'VARIANT_BASED' : 'FIXED'),
                basePrice: it.basePrice || 0,
                vatRate: 18,
                discountPrice: it.offerPrice,
                isVegetarian: Boolean(it.isVegetarian),
                isVegan: Boolean(it.isVegan),
                isHalal: Boolean(it.isHalal),
                isGlutenFree: Boolean(it.isGlutenFree),
                isSpicy: false,
                hasVariants: it.hasVariants || (it.variants && it.variants.length > 0),
                hasAddons: true,
                isCustomizable: it.isCustomizable,
                addonGroups: it.modifierGroups ? it.modifierGroups.map((g) => g.name) : [],
                variants: (it.variants || []).map((v) => ({
                  id: v.id,
                  name: v.name,
                  variantSize: v.variantSize,
                  sku: v.sku,
                  price: v.price,
                  isAvailable: v.isAvailable,
                  isActive: v.isActive,
                  portionSpec: v.portionSpec,
                })),
                hasMandatoryOptions: false,
                hasOptionalOptions: true,
                isAvailable: it.isAvailable,
                status: it.status || (it.isActive ? 'ACTIVE' : 'INACTIVE'),
                scheduledAvailability: 'All Day (10:00 - 23:00)',
              }));
              return remote;
            });
          }
          setIsMenuPublished(res.isPublished);
        }
      } catch (err) {
        console.warn('Backend food items load fallback:', err);
      }
    }
    loadBackendData();
  }, []);

  // Screen 12: Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'SOLD_OUT'>('ALL');
  const [priceRangeFilter, setPriceRangeFilter] = useState<'ALL' | 'UNDER_10' | '10_20' | '20_30' | 'OVER_30'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Screen 13: Add/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const dishFileInputRef = useRef<HTMLInputElement>(null);

  const handleDishImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        description: 'Dish image must be smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImages((prev) => [...prev, reader.result as string]);
        toast.success('Dish photo uploaded', { description: file.name });
      }
    };
    reader.readAsDataURL(file);
    if (dishFileInputRef.current) dishFileInputRef.current.value = '';
  };

  const [formCategory, setFormCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('15 min');
  const [formPricingMode, setFormPricingMode] = useState<'FIXED' | 'VARIANT_BASED'>('FIXED');
  const [formBasePrice, setFormBasePrice] = useState('12.00');
  const [formVatRate, setFormVatRate] = useState('18');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formVegetarian, setFormVegetarian] = useState(false);
  const [formVegan, setFormVegan] = useState(false);
  const [formHalal, setFormHalal] = useState(false);
  const [formSpicy, setFormSpicy] = useState(false);
  const [formSpicyLevel, setFormSpicyLevel] = useState<'Mild' | 'Medium' | 'Hot'>('Medium');
  const [formCalories, setFormCalories] = useState('');
  const [formServingSize, setFormServingSize] = useState('');
  const [formHasVariants, setFormHasVariants] = useState(false);
  const [formHasAddons, setFormHasAddons] = useState(true);
  const [formIsCustomizable, setFormIsCustomizable] = useState(true);
  const [formAddonGroups, setFormAddonGroups] = useState<string[]>([]);
  const [formVariants, setFormVariants] = useState<FoodVariantItem[]>([]);
  const [formMandatory, setFormMandatory] = useState(false);
  const [formOptional, setFormOptional] = useState(true);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formScheduled, setFormScheduled] = useState('All Day (10:00 - 23:00)');

  // Screen 14: Food Item Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<FoodItem | null>(null);

  // Manage Variants Modal State (can be opened from details or edit)
  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [variantManagerItem, setVariantManagerItem] = useState<FoodItem | null>(null);
  const [newVariantName, setNewVariantName] = useState('Large Portion');
  const [newVariantSize, setNewVariantSize] = useState('Large');
  const [newVariantPrice, setNewVariantPrice] = useState('14.50');
  const [newVariantSku, setNewVariantSku] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FoodItem | null>(null);

  // Calculated final display price for Screen 13
  const computedFinalPrice = useMemo(() => {
    if (formPricingMode === 'VARIANT_BASED') {
      return 'Variant-Dependent';
    }
    const base = parseFloat(formBasePrice) || 0;
    const vat = parseFloat(formVatRate) || 0;
    const final = base * (1 + vat / 100);
    return `€${final.toFixed(2)}`;
  }, [formPricingMode, formBasePrice, formVatRate]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategoryFilter === 'ALL' ||
        item.category.toLowerCase() === selectedCategoryFilter.toLowerCase() ||
        item.categorySlug.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const matchAvailability =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'IN_STOCK' && item.isAvailable) ||
        (availabilityFilter === 'SOLD_OUT' && !item.isAvailable);

      const finalPrice = item.basePrice;
      let matchPrice = true;
      if (priceRangeFilter === 'UNDER_10') matchPrice = finalPrice < 10;
      else if (priceRangeFilter === '10_20') matchPrice = finalPrice >= 10 && finalPrice <= 20;
      else if (priceRangeFilter === '20_30') matchPrice = finalPrice > 20 && finalPrice <= 30;
      else if (priceRangeFilter === 'OVER_30') matchPrice = finalPrice > 30;

      return matchSearch && matchCategory && matchAvailability && matchPrice;
    });
  }, [items, searchTerm, selectedCategoryFilter, availabilityFilter, priceRangeFilter]);

  // Open Screen 13 in ADD mode
  const handleOpenAdd = () => {
    setFormMode('ADD');
    setEditingItemId(null);
    setFormName('');
    setFormDescription('');
    setFormImages([]);
    const defaultCat = categories[0]?.name || 'Pizza';
    setFormCategory(defaultCat);
    setFormSku(`SKU-FD-00${items.length + 1}`);
    setFormPrepTime('15 min');
    setFormPricingMode('FIXED');
    setFormBasePrice('12.00');
    setFormVatRate('18');
    setFormDiscountPrice('');
    setFormVegetarian(false);
    setFormVegan(false);
    setFormHalal(false);
    setFormSpicy(false);
    setFormSpicyLevel('Medium');
    setFormCalories('650 kcal');
    setFormServingSize('350g (1 portion)');
    setFormHasVariants(false);
    setFormHasAddons(true);
    setFormIsCustomizable(true);
    setFormAddonGroups(['Cheese & Dairy']);
    setFormVariants([]);
    setFormMandatory(false);
    setFormOptional(true);
    setFormAvailable(true);
    setFormScheduled('All Day (10:00 - 23:00)');
    setIsFormOpen(true);
  };

  // Open Screen 13 in EDIT mode
  const handleOpenEdit = (item: FoodItem) => {
    setFormMode('EDIT');
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormImages(item.images && item.images.length > 0 ? item.images : []);
    setFormCategory(item.category);
    setFormSku(item.sku);
    setFormPrepTime(item.prepTime);
    setFormPricingMode(item.pricingMode || (item.basePrice === 0 ? 'VARIANT_BASED' : 'FIXED'));
    setFormBasePrice(item.basePrice.toString());
    setFormVatRate(item.vatRate.toString());
    setFormDiscountPrice(item.discountPrice ? item.discountPrice.toString() : '');
    setFormVegetarian(item.isVegetarian);
    setFormVegan(item.isVegan);
    setFormHalal(item.isHalal);
    setFormSpicy(item.isSpicy);
    setFormSpicyLevel(item.spicyLevel || 'Medium');
    setFormCalories(item.calories || '');
    setFormServingSize(item.servingSize || '');
    setFormHasVariants(item.hasVariants || (item.variants && item.variants.length > 0));
    setFormHasAddons(item.hasAddons !== false);
    setFormIsCustomizable(item.isCustomizable !== false);
    setFormAddonGroups(item.addonGroups);
    setFormVariants(item.variants || []);
    setFormMandatory(item.hasMandatoryOptions);
    setFormOptional(item.hasOptionalOptions);
    setFormAvailable(item.isAvailable);
    setFormScheduled(item.scheduledAvailability);
    setIsFormOpen(true);
  };

  // Open Details View
  const handleOpenDetails = (item: FoodItem) => {
    setSelectedDetailsItem(item);
    setIsDetailsOpen(true);
  };

  // Open Variant Manager Dialog
  const handleOpenVariantManager = (item: FoodItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setVariantManagerItem(item);
    setNewVariantName('Large Portion');
    setNewVariantSize('Large');
    setNewVariantPrice(item.basePrice > 0 ? (item.basePrice + 3.5).toFixed(2) : '15.00');
    const prefix = item.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'VAR';
    setNewVariantSku(`VAR-${prefix}-LG-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsVariantManagerOpen(true);
  };

  // Add Variant to Current Item in Variant Manager
  const handleAddVariant = async () => {
    if (!variantManagerItem) return;
    const priceNum = parseFloat(newVariantPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Invalid Price', { description: 'Please enter a valid non-negative price.' });
      return;
    }

    const newVariant: FoodVariantItem = {
      id: `v-${Date.now()}`,
      name: newVariantName.trim() || 'Custom Variant',
      variantSize: newVariantSize,
      sku: newVariantSku.trim() || `${variantManagerItem.sku}-VAR-${(variantManagerItem.variants?.length || 0) + 1}`,
      price: priceNum,
      portionSpec: `${newVariantSize} specification`,
      isAvailable: true,
      isActive: true,
      status: 'ACTIVE',
    };

    const updatedVariants = [...(variantManagerItem.variants || []), newVariant];
    const updatedItem = {
      ...variantManagerItem,
      variants: updatedVariants,
      hasVariants: true,
    };

    setVariantManagerItem(updatedItem);
    setItems((prev) => prev.map((it) => (it.id === variantManagerItem.id ? updatedItem : it)));

    try {
      await foodGrocerySupplierService.createVariant(variantManagerItem.id, {
        name: newVariant.name,
        price: newVariant.price,
        size: newVariant.variantSize,
        sku: newVariant.sku,
        portionSpec: newVariant.portionSpec,
      });
    } catch (err: any) {
      console.warn('Backend variant create fallback:', err);
    }

    toast.success('Variant Added', {
      description: `"${newVariant.name}" (€${priceNum.toFixed(2)}) added to ${variantManagerItem.name}.`,
    });
  };

  // Toggle Variant status
  const handleToggleVariantStatus = async (variantId: string) => {
    if (!variantManagerItem) return;
    const updatedVariants = (variantManagerItem.variants || []).map((v) => {
      if (v.id === variantId) {
        const next = !v.isActive;
        return { ...v, isActive: next, isAvailable: next, status: next ? 'ACTIVE' : ('INACTIVE' as any) };
      }
      return v;
    });

    const updatedItem = { ...variantManagerItem, variants: updatedVariants };
    setVariantManagerItem(updatedItem);
    setItems((prev) => prev.map((it) => (it.id === variantManagerItem.id ? updatedItem : it)));

    const target = updatedVariants.find((v) => v.id === variantId);
    try {
      await foodGrocerySupplierService.toggleVariantStatus(
        variantManagerItem.id,
        variantId,
        Boolean(target?.isActive)
      );
    } catch (err) {
      console.warn('Backend variant toggle fallback:', err);
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId: string) => {
    if (!variantManagerItem) return;
    const updatedVariants = (variantManagerItem.variants || []).filter((v) => v.id !== variantId);
    const updatedItem = {
      ...variantManagerItem,
      variants: updatedVariants,
      hasVariants: updatedVariants.length > 0,
    };

    setVariantManagerItem(updatedItem);
    setItems((prev) => prev.map((it) => (it.id === variantManagerItem.id ? updatedItem : it)));

    try {
      await foodGrocerySupplierService.deleteVariant(variantManagerItem.id, variantId);
    } catch (err) {
      console.warn('Backend variant delete fallback:', err);
    }

    toast.success('Variant Removed');
  };

  // Toggle Availability
  const handleToggleAvailability = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const nextAvail = !target.isAvailable;

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isAvailable: nextAvail } : it))
    );

    try {
      await foodGrocerySupplierService.toggleAvailability(id, nextAvail);
    } catch (err) {
      console.warn('Backend toggle availability sync fallback:', err);
    }

    toast.success(nextAvail ? `"${target.name}" marked In Stock` : `"${target.name}" marked Sold Out`);
  };

  // Activate / Deactivate Item
  const handleToggleStatus = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const nextStatus = it.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          toast.info(`Item status updated to ${nextStatus}`, {
            description: `${it.name} is now ${nextStatus}.`,
          });
          return { ...it, status: nextStatus };
        }
        return it;
      })
    );
  };

  // Delete Item Confirmation
  const handleOpenDelete = (item: FoodItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const itemToDelete = deletingItem;

    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    setIsDeleteOpen(false);
    setDeletingItem(null);

    try {
      const res = await foodGrocerySupplierService.deleteItem(itemToDelete.id);
      if (res?.softDeleted) {
        toast.info('Item Safely Deactivated', {
          description: res.message || `Preserved historical order accounting for "${itemToDelete.name}".`,
        });
        return;
      }
    } catch (err) {
      console.warn('Backend food item delete fallback:', err);
    }

    toast.success('Food Item Deleted', {
      description: `"${itemToDelete.name}" has been removed from catalog.`,
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Food Item (Add or Edit)
  const handleSaveItem = async (isDraft = false) => {
    if (!formName.trim()) {
      toast.error('Validation Error', { description: 'Please provide a dish name.' });
      return;
    }

    if (!formBasePrice) {
      toast.error('Validation Error', { description: 'Please enter the food item amount.' });
      return;
    }

    const matchedCat = categories.find((c) => c.name === formCategory) || categories[0];
    const basePriceNum = parseFloat(formBasePrice) || 0;

    const payload: any = {
      name: formName.trim(),
      sku: formSku.trim() || `SKU-0${items.length + 1}`,
      categoryId: matchedCat?.id,
      category: matchedCat?.name || formCategory,
      categorySlug: matchedCat?.slug || 'general',
      description: formDescription.trim() || 'Freshly prepared signature culinary dish.',
      imageUrl: formImages[0] || '',
      images: formImages.length > 0 ? formImages : [],
      prepTime: formPrepTime.trim() || '15 min',
      pricingMode: formPricingMode,
      basePrice: basePriceNum,
      vatRate: parseFloat(formVatRate) || 18,
      offerPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
      isVegetarian: formVegetarian,
      isVegan: formVegan,
      isHalal: formHalal,
      isSpicy: formSpicy,
      spicyLevel: formSpicyLevel,
      calories: formCalories.trim(),
      servingSize: formServingSize.trim(),
      hasVariants: formHasVariants,
      hasAddons: formHasAddons,
      isCustomizable: formIsCustomizable,
      addonGroups: formAddonGroups,
      variants: formVariants,
      hasMandatoryOptions: formMandatory,
      hasOptionalOptions: formOptional,
      isAvailable: formAvailable,
      status: isDraft ? 'DRAFT' : 'ACTIVE',
      scheduledAvailability: formScheduled,
    };

    if (formMode === 'ADD') {
      const newItem: FoodItem = {
        ...payload,
        id: `dish-${Date.now()}`,
      };

      setItems((prev) => [newItem, ...prev]);

      try {
        const created = await foodGrocerySupplierService.createItem(payload);
        if (created?.id) {
          setItems((prev) => prev.map((i) => (i.id === newItem.id ? { ...i, id: created.id } : i)));
        }
      } catch (err) {
        console.warn('Backend item create sync fallback:', err);
      }

      toast.success(isDraft ? 'Dish Draft Saved' : 'Dish Created Live', {
        description: `"${newItem.name}" added to ${matchedCat?.name}.`,
      });
    } else if (editingItemId) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingItemId ? { ...it, ...payload, id: editingItemId } : it))
      );

      try {
        await foodGrocerySupplierService.updateItem(editingItemId, payload);
      } catch (err) {
        console.warn('Backend item update sync fallback:', err);
      }

      toast.success('Food Item Updated', {
        description: `Changes to "${formName}" saved successfully.`,
      });
    }

    setIsFormOpen(false);
  };

  // Publish / Unpublish Menu Handler
  const handlePublishToggle = async () => {
    setPublishChecking(true);
    try {
      if (isMenuPublished) {
        await foodGrocerySupplierService.unpublishMenu();
        setIsMenuPublished(false);
        toast.info('Menu Unpublished', {
          description: 'Your menu is now in draft mode and hidden from customer applications.',
        });
      } else {
        const res = await foodGrocerySupplierService.publishMenu();
        setIsMenuPublished(true);
        toast.success('Menu Published Successfully!', {
          description: res.message || 'Dishes, variants, and categories are now live for customer ordering.',
        });
      }
      setIsPublishModalOpen(false);
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      toast.error('Publication Validation Issue', {
        description: Array.isArray(errors) ? errors.join(', ') : err?.response?.data?.message || 'Check menu configuration before publishing.',
      });
    } finally {
      setPublishChecking(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP BAR & PUBLISH STATUS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Utensils className="h-7 w-7 text-[#FCD223]" />
            Food Item Management
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Searchable, filterable dish catalog with multi-section recipe configuration, pricing, and VAT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Menu Publish Badge & Trigger */}
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className={cn(
              'px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer',
              isMenuPublished
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            )}
            title="Click to check publication status"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full animate-pulse',
                isMenuPublished ? 'bg-emerald-400' : 'bg-amber-400'
              )}
            />
            {isMenuPublished ? 'Published Live' : 'Menu in Draft'}
            <Globe className="h-3.5 w-3.5 ml-1 opacity-70" />
          </button>

          {/* Table / Grid View Switcher */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition-all cursor-pointer',
                viewMode === 'table' ? 'bg-[#FCD223] text-black font-bold' : 'text-zinc-400 hover:text-white'
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-lg p-1.5 transition-all cursor-pointer',
                viewMode === 'grid' ? 'bg-[#FCD223] text-black font-bold' : 'text-zinc-400 hover:text-white'
              )}
              title="Grid Card View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Food Item
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTERS STRIP
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search food item, recipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Availability</option>
              <option value="IN_STOCK">In Stock Only</option>
              <option value="SOLD_OUT">Sold Out / Unavailable</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-zinc-200 focus:border-[#FCD223] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Price Tiers</option>
              <option value="UNDER_10">Budget (&lt; €10)</option>
              <option value="10_20">Standard (€10 - €20)</option>
              <option value="20_30">Premium (€20 - €30)</option>
              <option value="OVER_30">Luxury Signature (&gt; €30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TABLE VIEW
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-white/10 bg-[#18181B] text-[10px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Food Image</th>
                  <th className="py-3 px-3 font-semibold">Item Name</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold text-right">Price (Incl. VAT)</th>
                  <th className="py-3 px-3 font-semibold text-center">Variants</th>
                  <th className="py-3 px-3 font-semibold text-center">Availability</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const finalPrice = item.basePrice;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetails(item)}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      {/* Image */}
                      <td className="py-3 px-4">
                        <div className="h-11 w-11 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                          <img
                            src={item.images[0] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & Badges */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-white group-hover:text-[#FCD223] transition-colors block text-xs">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.isVegetarian && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              Veg
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="text-[9px] bg-green-500/10 text-green-300 px-1.5 py-0.2 rounded border border-green-500/20">
                              Vegan
                            </span>
                          )}
                          {item.isHalal && (
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/20">
                              Halal
                            </span>
                          )}
                          {item.isSpicy && (
                            <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded border border-red-500/20 flex items-center gap-0.5">
                              <Flame className="h-2.5 w-2.5" /> {item.spicyLevel || 'Spicy'}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500">{item.prepTime}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-zinc-300">{item.category}</td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        {item.pricingMode === 'VARIANT_BASED' ? (
                          <div>
                            <span className="font-bold text-[#FCD223] text-xs">From €{item.variants?.[0]?.price?.toFixed(2) || '0.00'}</span>
                            <span className="text-[9px] text-zinc-400 block">Variant-Based</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-white text-xs">€{finalPrice.toFixed(2)}</span>
                          </div>
                        )}
                      </td>

                      {/* Variants count & manage button */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenVariantManager(item, e)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-medium text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                          title="Manage Variants"
                        >
                          <Layers className="h-3 w-3 text-[#FCD223]" />
                          {item.variants?.length || 0} Sizes
                        </button>
                      </td>

                      {/* Availability */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleAvailability(item.id, e)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors',
                            item.isAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              item.isAvailable ? 'bg-emerald-400' : 'bg-red-400'
                            )}
                          />
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold',
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.status === 'DRAFT'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-zinc-800 text-zinc-400'
                          )}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(item)}
                            title="View Details"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Dish"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:border-[#FCD223] hover:text-[#FCD223] transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleOpenDelete(item, e)}
                            title="Delete Dish"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          GRID VIEW
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const finalPrice = item.basePrice;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetails(item)}
                className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="relative h-44 w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                      <Utensils className="h-10 w-10 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/40" />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[#FCD223]">
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      )}
                    >
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#FCD223] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-[#FCD223]">
                        {item.pricingMode === 'VARIANT_BASED'
                          ? `From €${item.variants?.[0]?.price?.toFixed(2) || '0.00'}`
                          : `€${finalPrice.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {item.prepTime}
                    </span>
                    <button
                      onClick={(e) => handleOpenVariantManager(item, e)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FCD223] hover:underline"
                    >
                      <Layers className="h-3 w-3" /> {item.variants?.length || 0} Variants
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleToggleAvailability(item.id, e)}
                      className="text-xs font-medium text-zinc-400 hover:text-white"
                    >
                      {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-[#FCD223]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDelete(item, e)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          ADD / EDIT FOOD ITEM MODAL (SCREEN 13)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#121214] text-white p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Utensils className="h-5 w-5 text-[#FCD223]" />
              {formMode === 'ADD' ? 'Add New Food Item' : `Edit Dish: ${formName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure complete recipe details, pricing modes, and variants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Food Item Name *</label>
                  <Input
                    placeholder="e.g. Truffle Mushroom Tagliolini"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Menu Category *</label>
                  {categories.length > 0 ? (
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-[#18181B] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1 flex items-center justify-between p-2 rounded-md border border-amber-500/30 bg-amber-950/20 text-xs text-amber-300">
                      <span>No categories found</span>
                      <Link href="/restaurants/menu/categories" className="text-[#FCD223] font-bold hover:underline">
                        Create Category
                      </Link>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">Kitchen Preparation Time</label>
                  <Input
                    placeholder="e.g. 15 min"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="mt-1 border-white/10 bg-[#18181B] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe dish ingredients, recipe heritage, and culinary preparation..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#18181B] p-2 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
                />
              </div>

              {/* Dish Photo Upload */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Dish Photos</span>
                  <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
                </label>

                <input
                  ref={dishFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleDishImageUpload}
                />

                {formImages.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-28">
                          <img src={img} alt={`Dish preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/80 text-red-400 hover:text-white hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer shadow-md"
                            title="Remove image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-[#FCD223] text-black px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => dishFileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-[#FCD223]/50 hover:bg-white/5 transition-all h-28 cursor-pointer group"
                      >
                        <Upload className="h-5 w-5 text-zinc-400 group-hover:text-[#FCD223] transition-colors" />
                        <span className="text-[11px] text-zinc-400 group-hover:text-white mt-1 font-semibold">
                          Add Photo
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => dishFileInputRef.current?.click()}
                    className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#18181B]/60 p-6 text-center hover:border-[#FCD223]/50 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                      Click to upload dish photo
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      PNG, JPG or WEBP (rec. 800×600px, max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Pricing Configuration */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Food Item Pricing
              </h3>

              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4">
                <div className="max-w-sm">
                  <label className="text-xs font-semibold text-zinc-300">
                    Food Item Amount (€) *
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">€</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 12.00"
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(e.target.value)}
                      className="border-white/10 bg-[#121214] pl-7 text-xs font-mono text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Customization, Variants & Add-ons Switches */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" /> Variants &amp; Customization Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#18181B] cursor-pointer">
                  <span className="text-xs font-semibold">Enable Variants</span>
                  <input
                    type="checkbox"
                    checked={formHasVariants}
                    onChange={(e) => setFormHasVariants(e.target.checked)}
                    className="accent-[#FCD223] h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#18181B] cursor-pointer">
                  <span className="text-xs font-semibold">Enable Add-ons</span>
                  <input
                    type="checkbox"
                    checked={formHasAddons}
                    onChange={(e) => setFormHasAddons(e.target.checked)}
                    className="accent-[#FCD223] h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#18181B] cursor-pointer">
                  <span className="text-xs font-semibold">Allow Customizations</span>
                  <input
                    type="checkbox"
                    checked={formIsCustomizable}
                    onChange={(e) => setFormIsCustomizable(e.target.checked)}
                    className="accent-[#FCD223] h-4 w-4"
                  />
                </label>
              </div>

              {formHasVariants && (
                <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-300">
                    Configured with <strong>{formVariants.length}</strong> variant sizes
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (editingItemId) {
                        const target = items.find((i) => i.id === editingItemId);
                        if (target) handleOpenVariantManager(target);
                      } else {
                        toast.info('Save item first', {
                          description: 'Save this food item to configure specific variants in the manager.',
                        });
                      }
                    }}
                    className="text-xs border-[#FCD223]/30 text-[#FCD223] hover:bg-[#FCD223]/10"
                  >
                    <Layers className="h-3.5 w-3.5 mr-1" />
                    Manage Variants
                  </Button>
                </div>
              )}
            </div>

            {/* Section 4: Dietary Attributes */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD223] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Dietary Attributes
              </h3>

              <div className="flex flex-wrap gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formVegetarian}
                    onChange={(e) => setFormVegetarian(e.target.checked)}
                    className="accent-[#FCD223]"
                  />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formVegan}
                    onChange={(e) => setFormVegan(e.target.checked)}
                    className="accent-[#FCD223]"
                  />
                  <span>Vegan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formHalal}
                    onChange={(e) => setFormHalal(e.target.checked)}
                    className="accent-[#FCD223]"
                  />
                  <span>Halal Certified</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveItem(false)}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
            >
              {formMode === 'ADD' ? 'Save & Publish Dish' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOD ITEM DETAILS VIEW MODAL (SCREEN 14)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#121214] text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-[#FCD223]" />
                {selectedDetailsItem?.name}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-bold border',
                  selectedDetailsItem?.isAvailable
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                )}
              >
                {selectedDetailsItem?.isAvailable ? 'In Stock' : 'Sold Out'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Dish specification, portion details, and dietary info.
            </DialogDescription>
          </DialogHeader>

          {selectedDetailsItem && (
            <div className="space-y-4 py-2">
              <div className="h-48 w-full rounded-xl overflow-hidden border border-white/10 relative bg-zinc-900 flex items-center justify-center">
                {selectedDetailsItem.images && selectedDetailsItem.images[0] ? (
                  <img
                    src={selectedDetailsItem.images[0]}
                    alt={selectedDetailsItem.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Utensils className="h-12 w-12 text-zinc-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-[10px] font-semibold text-[#FCD223] bg-black/60 px-2 py-0.5 rounded">
                        {selectedDetailsItem.category}
                      </span>
                      <h4 className="text-base font-black text-white mt-1">{selectedDetailsItem.name}</h4>
                    </div>
                    <span className="text-lg font-black text-[#FCD223]">
                      {selectedDetailsItem.pricingMode === 'VARIANT_BASED'
                        ? 'Variant-Based'
                        : `€${selectedDetailsItem.basePrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs space-y-2">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-white">{selectedDetailsItem.category}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Description</span>
                  <p className="text-zinc-300 leading-relaxed">{selectedDetailsItem.description}</p>
                </div>
              </div>

              {/* Existing Variants Table in Details */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#FCD223]" /> Available Portions / Variants
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenVariantManager(selectedDetailsItem)}
                    className="text-xs h-7 border-[#FCD223]/30 text-[#FCD223] hover:bg-[#FCD223]/10"
                  >
                    Manage Variants
                  </Button>
                </div>

                {selectedDetailsItem.variants && selectedDetailsItem.variants.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedDetailsItem.variants.map((v, i) => (
                      <div
                        key={v.id || i}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-white/5 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{v.name}</span>
                          <span className="text-zinc-500 text-[10px] ml-2 font-mono">({v.variantSize || v.portionSpec})</span>
                        </div>
                        <span className="font-mono font-bold text-[#FCD223]">€{v.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-1">No variants configured. Standard single portion applies.</p>
                )}
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
                if (selectedDetailsItem) {
                  setIsDetailsOpen(false);
                  handleOpenEdit(selectedDetailsItem);
                }
              }}
              className="bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit Dish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          INLINE MANAGE VARIANTS DIALOG
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isVariantManagerOpen} onOpenChange={setIsVariantManagerOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#121214] text-white p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#FCD223]" />
                Manage Variants: {variantManagerItem?.name}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure sizing, portion specifications, and prices for this dish.
            </DialogDescription>
          </DialogHeader>

          {variantManagerItem && (
            <div className="space-y-4 py-2">
              {/* Existing Variants List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">Existing Portions:</span>
                {variantManagerItem.variants && variantManagerItem.variants.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {variantManagerItem.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#18181B] text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{v.name}</span>
                            <span className="text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                              {v.variantSize}
                            </span>
                          </div>
                          {v.portionSpec && (
                            <span className="text-[10px] text-zinc-500">{v.portionSpec}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#FCD223] text-sm">€{v.price.toFixed(2)}</span>
                          <button
                            onClick={() => v.id && handleToggleVariantStatus(v.id)}
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded cursor-pointer font-bold',
                              v.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                            )}
                          >
                            {v.isActive ? 'Active' : 'Hidden'}
                          </button>
                          <button
                            onClick={() => v.id && handleDeleteVariant(v.id)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-2">No variants created yet.</p>
                )}
              </div>

              {/* Add Variant Form */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                <span className="text-xs font-bold text-[#FCD223] block">Add New Variant Portion:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Variant Name</label>
                    <Input
                      placeholder="e.g. Small / 10-inch"
                      value={newVariantName}
                      onChange={(e) => setNewVariantName(e.target.value)}
                      className="mt-0.5 h-8 border-white/10 bg-[#121214] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Size Preset</label>
                    <select
                      value={newVariantSize}
                      onChange={(e) => setNewVariantSize(e.target.value)}
                      className="mt-0.5 w-full h-8 rounded-md border border-white/10 bg-[#121214] px-2 text-xs text-white"
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Regular">Regular</option>
                      <option value="Family Size">Family Size</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Price (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="12.50"
                      value={newVariantPrice}
                      onChange={(e) => setNewVariantPrice(e.target.value)}
                      className="mt-0.5 h-8 border-white/10 bg-[#121214] text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddVariant}
                  className="w-full bg-[#FCD223] text-black font-bold hover:bg-[#FCD223]/90 text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Variant to Dish
                </Button>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-zinc-400">
                <span>Want dedicated variant controls?</span>
                <Link
                  href={`/restaurants/menu/variants?item=${variantManagerItem.id}`}
                  className="text-[#FCD223] font-bold hover:underline flex items-center gap-1"
                >
                  Open in Dedicated Variants Page <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsVariantManagerOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MENU PUBLISHING MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#121214] text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#FCD223]" />
              Menu Publishing &amp; Live Availability
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Validate and control live ordering availability on the GOZOLT customer app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-2 text-xs">
              <span className="font-bold text-white block">Pre-Publication Readiness Checklist:</span>
              <div className="space-y-1.5 text-zinc-300">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>{categories.filter((c) => c.status === 'ACTIVE').length} Active Categories Configured</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>{items.filter((i) => i.status === 'ACTIVE').length} Active Dishes in Catalog</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>Accurate VAT and Pricing Integrity Verified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  <span>All Menu Items &amp; Pricing Verified</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              {isMenuPublished
                ? 'Your menu is currently live and customers can browse dishes, customize orders, and checkout.'
                : 'Your menu is currently in draft mode. Publishing will make active categories and dishes visible to customers.'}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsPublishModalOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              disabled={publishChecking}
              onClick={handlePublishToggle}
              className={cn(
                'font-bold text-xs shadow-md',
                isMenuPublished
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#FCD223] text-black hover:bg-[#FCD223]/90'
              )}
            >
              {isMenuPublished ? 'Unpublish (Switch to Draft)' : 'Publish Menu Live'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          DELETE ITEM CONFIRMATION DIALOG
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md border-red-500/30 bg-[#121214] text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Dish Confirmation
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Are you sure you want to remove <strong className="text-white">"{deletingItem?.name}"</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-zinc-300 bg-red-950/20 border border-red-500/20 rounded-xl p-3">
            <p>
              Safe Deletion Policy: If this dish is linked to past completed customer orders, it will be automatically deactivated rather than purged, protecting financial audits and receipt accounting.
            </p>
          </div>

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
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
            >
              Confirm Removal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
