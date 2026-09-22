export type SupplierService =
  | 'CAB'
  | 'CAR_RENTAL'
  | 'BIKE_RENTAL'
  | 'QUICK_SERVICES';

export const SUPPLIER_SERVICE_NAMES: Record<SupplierService, string> = {
  CAB: 'Cab Booking',
  CAR_RENTAL: 'Car Rentals',
  BIKE_RENTAL: 'Bike Rentals',
  QUICK_SERVICES: 'Quick Services',
};

export function isSupplierService(
  value: string | null
): value is SupplierService {
  return (
    value === 'CAB' ||
    value === 'CAR_RENTAL' ||
    value === 'BIKE_RENTAL' ||
    value === 'QUICK_SERVICES'
  );
}