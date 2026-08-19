import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  FileText,
  Wallet,
  Wrench,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Navigation,
  Receipt,
  Banknote,
  Star,
  CalendarCheck,
} from 'lucide-react';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  FLEET: '/fleet',
  DRIVERS: '/drivers',
  NEW_DRIVERS: '/new-drivers',
  DRIVER_SETTLEMENTS: '/drivers/settlements',
  RIDES: '/rides',
  FLEET_DRIVERS: '/fleet/drivers',
  FLEET_VEHICLES: '/fleet/vehicles',
  GPS_TRACKING: '/gps-tracking',
  DOCUMENTS: '/documents',
  FINANCIALS: '/financials',
  INVOICES: '/invoices',
  MAINTENANCE: '/maintenance-fuel',
  ANALYTICS: '/analytics',
  SUBSCRIPTION: '/subscription',
  SETTINGS: '/settings',
  PAYOUTS: '/payouts',
  CAR_RENTALS: '/car-rentals',
  RENTAL_EARNINGS: '/earnings',
} as const;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, module: 'CAB' },
  { label: 'Dashboard', href: '/car-rentals/dashboard', icon: LayoutDashboard, module: 'RENTAL' },
  { label: 'Car Rentals', href: ROUTES.CAR_RENTALS, icon: Truck, module: 'RENTAL' },
  { label: 'Fleet', href: '/car-rentals/fleet', icon: Truck, module: 'RENTAL' },
  { label: 'Booking Management', href: '/car-rentals/bookings', icon: CalendarCheck, module: 'RENTAL' },
  { label: 'Rental Earnings', href: ROUTES.RENTAL_EARNINGS, icon: Wallet, module: 'RENTAL' },
  { label: 'Reviews & Ratings', href: '/car-rentals/reviews', icon: Star, module: 'RENTAL' },
  { label: 'Staff & Workers', href: '/car-rentals/workers', icon: Users, module: 'RENTAL' },
  { label: 'Fleet', href: ROUTES.FLEET, icon: Truck, module: 'CAB' },
  { label: 'My Fleet Drivers', href: ROUTES.DRIVERS, icon: Users, module: 'CAB' },
  { label: 'Find New Drivers', href: ROUTES.NEW_DRIVERS, icon: Users, module: 'CAB' },
  { label: 'Driver Settlements', href: ROUTES.DRIVER_SETTLEMENTS, icon: Wallet, module: 'CAB' },
  { label: 'Rides', href: ROUTES.RIDES, icon: Navigation, module: 'CAB' },
  { label: 'GPS Tracking', href: ROUTES.GPS_TRACKING, icon: MapPin, module: 'CAB' },
  { label: 'Documents', href: ROUTES.DOCUMENTS, icon: FileText, module: 'CAB' },
  { label: 'Earnings', href: ROUTES.FINANCIALS, icon: Wallet, module: 'CAB' },
  { label: 'Invoices', href: ROUTES.INVOICES, icon: Receipt, module: 'CAB' },
  { label: 'Maintenance & Fuel', href: ROUTES.MAINTENANCE, icon: Wrench, module: 'CAB' },
  { label: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3, module: 'CAB' },
  { label: 'Payouts', href: ROUTES.PAYOUTS, icon: Banknote, module: 'CAB' },
] as const;

export const SIGNOUT_ITEM = {
  label: 'Sign Out',
  icon: LogOut,
} as const;

export const AUTH_COOKIE_NAME = 'gozolt-supplier-access-token';
export const REFRESH_COOKIE_NAME = 'gozolt-supplier-refresh-token';
