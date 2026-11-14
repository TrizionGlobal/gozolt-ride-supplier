export type SupplierService =
  | 'CAB'
  | 'CAR_RENTAL'
  | 'BIKE_RENTAL'
  | 'QUICK_SERVICES'
  | 'AIRPORT_TRANSFER'
  | 'RESTAURANT'
  | 'GROCERY_STORE';

export const SUPPLIER_SERVICE_NAMES: Record<SupplierService, string> = {
  CAB: 'Cab Booking',
  CAR_RENTAL: 'Car Rentals',
  BIKE_RENTAL: 'Bike Rentals',
  QUICK_SERVICES: 'Quick Services',
  AIRPORT_TRANSFER: 'Airport Transport',
  RESTAURANT: 'Restaurants (Food Delivery)',
  GROCERY_STORE: 'Grocery Stores',
};

export function isSupplierService(
  value: string | null
): value is SupplierService {
  return (
    value === 'CAB' ||
    value === 'CAR_RENTAL' ||
    value === 'BIKE_RENTAL' ||
    value === 'QUICK_SERVICES' ||
    value === 'AIRPORT_TRANSFER' ||
    value === 'RESTAURANT' ||
    value === 'GROCERY_STORE'
  );
}