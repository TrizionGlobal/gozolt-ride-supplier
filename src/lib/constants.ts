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
} from 'lucide-react';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  FLEET: '/fleet',
  DRIVERS: '/drivers',
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
} as const;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Fleet', href: ROUTES.FLEET, icon: Truck },
  { label: 'Drivers', href: ROUTES.DRIVERS, icon: Users },
  { label: 'Rides', href: ROUTES.RIDES, icon: Navigation },
  { label: 'GPS Tracking', href: ROUTES.GPS_TRACKING, icon: MapPin },
  { label: 'Documents', href: ROUTES.DOCUMENTS, icon: FileText },
  { label: 'Earnings', href: ROUTES.FINANCIALS, icon: Wallet },
  { label: 'Invoices', href: ROUTES.INVOICES, icon: Receipt },
  { label: 'Maintenance & Fuel', href: ROUTES.MAINTENANCE, icon: Wrench },
  { label: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: 'Payouts', href: ROUTES.PAYOUTS, icon: Banknote },
] as const;

export const SIGNOUT_ITEM = {
  label: 'Sign Out',
  icon: LogOut,
} as const;

export const AUTH_COOKIE_NAME = 'gozolt-supplier-access-token';
export const REFRESH_COOKIE_NAME = 'gozolt-supplier-refresh-token';
