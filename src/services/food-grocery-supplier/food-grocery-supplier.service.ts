import { apiClient } from '@/lib/api-client';

export interface SupplierOrder {
  id: string;
  formattedBookingId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  totalAmount: number;
  pickupPin?: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: any;
  driverName?: string | null;
  driverPhone?: string | null;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    modifiers?: any[];
    instructions?: string;
    isUnavailable?: boolean;
  }>;
}

export interface SupplierProfileResponse {
  business: {
    id: string;
    supplierId?: string;
    name: string;
    slug?: string;
    businessType: 'RESTAURANT' | 'GROCERY_STORE';
    phone?: string;
    address: string;
    city: string;
    status: string;
    rating: number;
    ratingCount: number;
    categoryCount: number;
    productCount: number;
    imageUrl?: string;
  };
  stats: {
    todayOrders: number;
    activeOrders: number;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
  };
}

export interface SupplierBranch {
  id: string;
  name: string;
  address?: string;
  isDefault: boolean;
}

export interface SupplierVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  variantSize: string;
  portionSpec?: string;
  baseItemName?: string;
  category?: string;
  priceType: 'FIXED_PRICE' | 'PRICE_ADJUSTMENT';
  price: number;
  originalPrice?: number | null;
  displayOrder: number;
  isAvailable: boolean;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  branchPrices?: Record<string, number>;
}

export interface SupplierModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
  isAvailable: boolean;
  isDefault?: boolean;
}

export interface SupplierModifierGroup {
  id: string;
  name: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  minimumSelection: number;
  maximumSelection: number;
  displayOrder: number;
  options: SupplierModifierOption[];
}

export interface SupplierCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  itemCount: number;
  branchIds?: string[];
}

export interface SupplierItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  basePrice: number;
  offerPrice?: number | null;
  pricingMode: 'FIXED' | 'VARIANT_BASED';
  prepTime: string;
  imageUrl?: string;
  images: string[];
  isAvailable: boolean;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  isPopular: boolean;
  isCustomizable: boolean;
  hasVariants: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  dietaryTags?: string[];
  branchIds?: string[];
  variants: SupplierVariant[];
  modifierGroups?: SupplierModifierGroup[];
}

export interface SupplierMenuResponse {
  businessId: string;
  businessName: string;
  isPublished: boolean;
  branches: SupplierBranch[];
  categories: SupplierCategory[];
  items: SupplierItem[];
}

export interface PublishStatusResponse {
  isPublished: boolean;
  canPublish: boolean;
  validationErrors: string[];
  warnings: string[];
  summary: {
    categoriesCount: number;
    activeCategoriesCount: number;
    itemsCount: number;
    activeItemsCount: number;
  };
}

class FoodGrocerySupplierService {
  async getProfile(): Promise<SupplierProfileResponse> {
    const res = await apiClient.get('/food-grocery/supplier/profile');
    return res.data;
  }

  async getOrders(filter?: 'active' | 'completed' | 'cancelled'): Promise<SupplierOrder[]> {
    const res = await apiClient.get('/food-grocery/supplier/orders', {
      params: filter ? { filter } : undefined,
    });
    return res.data;
  }

  async acceptOrder(orderId: string): Promise<any> {
    const res = await apiClient.post(`/food-grocery/supplier/orders/${orderId}/accept`);
    return res.data;
  }

  async updatePreparation(orderId: string, stage: 'preparing' | 'ready', minutes?: number): Promise<any> {
    const res = await apiClient.post(`/food-grocery/supplier/orders/${orderId}/preparation`, {
      stage,
      estimatedPreparationMinutes: minutes ?? 20,
    });
    return res.data;
  }

  async updateProfile(data: any): Promise<any> {
    const res = await apiClient.patch('/food-grocery/supplier/profile', data);
    return res.data;
  }

  async getMenu(): Promise<SupplierMenuResponse> {
    const res = await apiClient.get('/food-grocery/supplier/menu');
    return res.data;
  }

  async getBranches(): Promise<SupplierBranch[]> {
    const res = await apiClient.get('/food-grocery/supplier/branches');
    return res.data;
  }

  // ── Category Actions ─────────────────────────────────
  async getCategories(): Promise<SupplierCategory[]> {
    const res = await apiClient.get('/food-grocery/supplier/menu/categories');
    return res.data;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
    branchIds?: string[];
  }): Promise<any> {
    const res = await apiClient.post('/food-grocery/supplier/menu/categories', data);
    return res.data;
  }

  async updateCategory(categoryId: string, data: any): Promise<any> {
    const res = await apiClient.patch(`/food-grocery/supplier/menu/categories/${categoryId}`, data);
    return res.data;
  }

  async deleteCategory(categoryId: string): Promise<any> {
    const res = await apiClient.delete(`/food-grocery/supplier/menu/categories/${categoryId}`);
    return res.data;
  }

  async toggleCategoryStatus(categoryId: string, isActive: boolean): Promise<any> {
    const res = await apiClient.patch(`/food-grocery/supplier/menu/categories/${categoryId}/status`, {
      isActive,
    });
    return res.data;
  }

  // ── Food Item Actions ────────────────────────────────
  async createItem(data: any): Promise<any> {
    const res = await apiClient.post('/food-grocery/supplier/menu/items', data);
    return res.data;
  }

  async updateItem(productId: string, data: any): Promise<any> {
    const res = await apiClient.patch(`/food-grocery/supplier/menu/items/${productId}`, data);
    return res.data;
  }

  async deleteItem(productId: string): Promise<any> {
    const res = await apiClient.delete(`/food-grocery/supplier/menu/items/${productId}`);
    return res.data;
  }

  async toggleAvailability(productId: string, isAvailable: boolean): Promise<any> {
    const res = await apiClient.patch(`/food-grocery/supplier/menu/items/${productId}/availability`, {
      isAvailable,
    });
    return res.data;
  }

  async toggleProductAvailability(productId: string, isAvailable: boolean): Promise<any> {
    return this.toggleAvailability(productId, isAvailable);
  }

  // ── Variant Actions ──────────────────────────────────
  async getVariants(productId: string): Promise<SupplierVariant[]> {
    const res = await apiClient.get(`/food-grocery/supplier/menu/items/${productId}/variants`);
    return res.data;
  }

  async createVariant(productId: string, data: any): Promise<any> {
    const res = await apiClient.post(`/food-grocery/supplier/menu/items/${productId}/variants`, data);
    return res.data;
  }

  async updateVariant(productId: string, variantId: string, data: any): Promise<any> {
    const res = await apiClient.patch(
      `/food-grocery/supplier/menu/items/${productId}/variants/${variantId}`,
      data,
    );
    return res.data;
  }

  async deleteVariant(productId: string, variantId: string): Promise<any> {
    const res = await apiClient.delete(
      `/food-grocery/supplier/menu/items/${productId}/variants/${variantId}`,
    );
    return res.data;
  }

  async toggleVariantStatus(productId: string, variantId: string, isActive: boolean): Promise<any> {
    const res = await apiClient.patch(
      `/food-grocery/supplier/menu/items/${productId}/variants/${variantId}/status`,
      { isActive },
    );
    return res.data;
  }

  // ── Menu Publishing ──────────────────────────────────
  async getPublishStatus(): Promise<PublishStatusResponse> {
    const res = await apiClient.get('/food-grocery/supplier/menu/publish-status');
    return res.data;
  }

  async publishMenu(): Promise<any> {
    const res = await apiClient.post('/food-grocery/supplier/menu/publish');
    return res.data;
  }

  async unpublishMenu(): Promise<any> {
    const res = await apiClient.post('/food-grocery/supplier/menu/unpublish');
    return res.data;
  }
}

export const foodGrocerySupplierService = new FoodGrocerySupplierService();
