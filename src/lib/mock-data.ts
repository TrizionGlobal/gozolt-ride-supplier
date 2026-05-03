import {
  DriverStatus,
  VehicleStatus,
  VehicleType,
  FuelType,
  DocumentStatus,
  DocumentType,
  PaymentStatus,
  SubscriptionTier,
} from '@/types';
import type {
  SupplierDriver,
  SupplierVehicle,
  SupplierDocument,
  SupplierPayout,
  SupplierSubscription,
  SupplierAnalytics,
  FleetVehicle,
  FleetVehicleDetail,
  FleetDriverDetail,
  MaintenanceLog,
  FuelLog,
  Driver,
  DriverCredentials,
  DriverRide,
  DriverDocument,
  AssignedVehicle,
  FleetLocationData,
  DocumentCenterItem,
  FinancialKPIs,
  PerDriverEarning,
  PayoutRecord,
  RevenueTrendPoint,
  MaintenanceLogEntry,
  FuelLogEntry,
  WeeklyChartPoint,
  SystemDistSegment,
  SubscriptionInfo,
  VehicleRate,
  BillingRecord,
  CompanyProfile,
  NotificationPreferences,
  PrivacySettings,
  TeamUser,
  LanguageSettings,
  DashboardKpis,
  DashboardActiveRide,
  SupplierRideListItem,
  SupplierRideKpis,
  InvoiceKpis,
  SupplierStatement,
  DriverEarningsBreakdown,
  ExpiringDocument,
  MaintenanceReminder,
} from '@/types';

export const mockDrivers: SupplierDriver[] = [
  {
    id: 'drv-001',
    firstName: 'Hans',
    lastName: 'Mueller',
    email: 'hans.mueller@demo.com',
    phone: '+49 170 1111111',
    licenseNumber: 'DL-2024-001',
    status: DriverStatus.ACTIVE,
    vehicleId: 'veh-001',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'drv-002',
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@demo.com',
    phone: '+49 170 2222222',
    licenseNumber: 'DL-2024-002',
    status: DriverStatus.ACTIVE,
    vehicleId: 'veh-002',
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'drv-003',
    firstName: 'Peter',
    lastName: 'Weber',
    email: 'peter.weber@demo.com',
    phone: '+49 170 3333333',
    licenseNumber: 'DL-2024-003',
    status: DriverStatus.PENDING_APPROVAL,
    vehicleId: null,
    createdAt: '2025-03-10T14:30:00Z',
  },
  {
    id: 'drv-004',
    firstName: 'Maria',
    lastName: 'Fischer',
    email: 'maria.fischer@demo.com',
    phone: '+49 170 4444444',
    licenseNumber: 'DL-2024-004',
    status: DriverStatus.SUSPENDED,
    vehicleId: null,
    createdAt: '2025-01-20T11:00:00Z',
  },
  {
    id: 'drv-005',
    firstName: 'Thomas',
    lastName: 'Koch',
    email: 'thomas.koch@demo.com',
    phone: '+49 170 5555555',
    licenseNumber: 'DL-2024-005',
    status: DriverStatus.ACTIVE,
    vehicleId: 'veh-003',
    createdAt: '2025-04-01T08:00:00Z',
  },
];

export const mockVehicles: SupplierVehicle[] = [
  {
    id: 'veh-001',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2024,
    plateNumber: 'B-AB 1234',
    color: 'Black',
    type: VehicleType.PREMIUM,
    fuelType: FuelType.DIESEL,
    status: VehicleStatus.ACTIVE,
    assignedDriverId: 'drv-001',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'veh-002',
    make: 'BMW',
    model: '5 Series',
    year: 2023,
    plateNumber: 'B-CD 5678',
    color: 'White',
    type: VehicleType.PREMIUM,
    fuelType: FuelType.PETROL,
    status: VehicleStatus.ACTIVE,
    assignedDriverId: 'drv-002',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'veh-003',
    make: 'Volkswagen',
    model: 'Passat',
    year: 2024,
    plateNumber: 'B-EF 9012',
    color: 'Silver',
    type: VehicleType.STANDARD,
    fuelType: FuelType.HYBRID,
    status: VehicleStatus.ACTIVE,
    assignedDriverId: 'drv-005',
    createdAt: '2025-02-01T11:00:00Z',
  },
  {
    id: 'veh-004',
    make: 'Tesla',
    model: 'Model S',
    year: 2024,
    plateNumber: 'B-GH 3456',
    color: 'Red',
    type: VehicleType.ELECTRIC,
    fuelType: FuelType.ELECTRIC,
    status: VehicleStatus.PENDING_APPROVAL,
    assignedDriverId: null,
    createdAt: '2025-03-20T15:00:00Z',
  },
  {
    id: 'veh-005',
    make: 'Mercedes-Benz',
    model: 'V-Class',
    year: 2023,
    plateNumber: 'B-IJ 7890',
    color: 'Black',
    type: VehicleType.XL,
    fuelType: FuelType.DIESEL,
    status: VehicleStatus.MAINTENANCE,
    assignedDriverId: null,
    createdAt: '2025-01-05T08:00:00Z',
  },
];

export const mockDocuments: SupplierDocument[] = [
  {
    id: 'doc-001',
    type: DocumentType.COMPANY_REGISTRATION,
    status: DocumentStatus.APPROVED,
    fileName: 'company-registration.pdf',
    fileUrl: '/uploads/doc-001.pdf',
    entityType: 'SUPPLIER',
    entityId: 'sup-001',
    expiresAt: '2027-01-01T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'doc-002',
    type: DocumentType.VAT_CERTIFICATE,
    status: DocumentStatus.APPROVED,
    fileName: 'vat-certificate.pdf',
    fileUrl: '/uploads/doc-002.pdf',
    entityType: 'SUPPLIER',
    entityId: 'sup-001',
    expiresAt: '2026-12-31T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-01-01T10:30:00Z',
  },
  {
    id: 'doc-003',
    type: DocumentType.INSURANCE,
    status: DocumentStatus.PENDING,
    fileName: 'fleet-insurance.pdf',
    fileUrl: '/uploads/doc-003.pdf',
    entityType: 'SUPPLIER',
    entityId: 'sup-001',
    expiresAt: '2026-06-01T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-03-15T09:00:00Z',
  },
];

export const mockPayouts: SupplierPayout[] = [
  {
    id: 'pay-001',
    amount: 4500.0,
    currency: 'EUR',
    status: PaymentStatus.COMPLETED,
    periodStart: '2025-01-01T00:00:00Z',
    periodEnd: '2025-01-31T23:59:59Z',
    paidAt: '2025-02-05T10:00:00Z',
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'pay-002',
    amount: 5200.5,
    currency: 'EUR',
    status: PaymentStatus.COMPLETED,
    periodStart: '2025-02-01T00:00:00Z',
    periodEnd: '2025-02-28T23:59:59Z',
    paidAt: '2025-03-05T10:00:00Z',
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'pay-003',
    amount: 4800.75,
    currency: 'EUR',
    status: PaymentStatus.PENDING,
    periodStart: '2025-03-01T00:00:00Z',
    periodEnd: '2025-03-31T23:59:59Z',
    paidAt: null,
    createdAt: '2025-04-01T00:00:00Z',
  },
];

export const mockSubscription: SupplierSubscription = {
  id: 'sub-001',
  tier: SubscriptionTier.PROFESSIONAL,
  maxDrivers: 50,
  maxVehicles: 30,
  pricePerMonth: 99.99,
  startedAt: '2025-01-01T00:00:00Z',
  expiresAt: '2026-01-01T00:00:00Z',
};

export const mockAnalytics: SupplierAnalytics = {
  totalDrivers: 5,
  activeDrivers: 3,
  totalVehicles: 5,
  activeVehicles: 3,
  totalRides: 1247,
  revenue: 14500.25,
  pendingDocuments: 1,
};

// Fleet mock data
export const mockFleetVehicles: FleetVehicle[] = [
  {
    id: '1',
    plateNumber: 'AP9900',
    make: 'TOYOTA',
    model: 'SEDAN',
    type: VehicleType.STANDARD,
    fuelType: FuelType.HYBRID,
    status: VehicleStatus.ACTIVE,
    assignedDriverId: 'drv-001',
    assignedDriverName: 'John',
    year: 2023,
    color: 'White',
    seats: 4,
    vin: null,
    photoUrls: [],
    createdAt: '2025-03-19T00:00:00Z',
  },
  {
    id: '2',
    plateNumber: 'ANS89',
    make: 'TOYOTA',
    model: 'SEDAN',
    type: VehicleType.PREMIUM,
    fuelType: FuelType.HYBRID,
    status: VehicleStatus.ACTIVE,
    assignedDriverId: 'drv-002',
    assignedDriverName: 'Alex',
    year: 2022,
    color: 'Black',
    seats: 4,
    vin: null,
    photoUrls: [],
    createdAt: '2025-03-25T00:00:00Z',
  },
  {
    id: '3',
    plateNumber: 'ANS89P',
    make: 'TOYOTA',
    model: 'SEDAN',
    type: VehicleType.XL,
    fuelType: FuelType.HYBRID,
    status: VehicleStatus.PENDING_APPROVAL,
    assignedDriverId: 'drv-003',
    assignedDriverName: 'John',
    year: 2024,
    color: 'Silver',
    seats: 6,
    vin: null,
    photoUrls: [],
    createdAt: '2025-03-28T00:00:00Z',
  },
];

export const mockFleetVehicleDetail: FleetVehicleDetail = {
  id: '1',
  plateNumber: 'ABC-123',
  make: 'Toyota',
  model: 'Corolla',
  type: VehicleType.STANDARD,
  fuelType: FuelType.HYBRID,
  status: VehicleStatus.ACTIVE,
  assignedDriverId: 'drv-001',
  assignedDriverName: 'John Berg',
  year: 2023,
  color: 'White',
  seats: 4,
  vin: null,
  photoUrls: [],
  createdAt: '2026-04-15T00:00:00Z',
  maintenanceCount: 3,
  fuelLogCount: 12,
};

export const mockFleetDriverDetail: FleetDriverDetail = {
  id: 'drv-001',
  driverId: 'DRV-MT-00001',
  firstName: 'john',
  lastName: 'borg',
  email: 'borg87@supermail.com',
  phone: '97841937',
  status: DriverStatus.ACTIVE,
  isOnline: true,
  avgRating: 4.8,
  totalRides: 156,
};

export const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'mnt-001',
    type: 'Oil change',
    description: 'Regular oil change with synthetic oil',
    cost: 85,
    performedAt: '2026-01-15T00:00:00Z',
    nextDueAt: '2026-07-15T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

export const mockFuelLogs: FuelLog[] = [
  {
    id: 'fuel-001',
    liters: 45,
    cost: 72,
    odometer: 15230,
    filledAt: '2026-02-10T00:00:00Z',
    createdAt: '2026-02-10T00:00:00Z',
  },
];

export const mockVehicleDocuments: SupplierDocument[] = [
  {
    id: 'vdoc-001',
    type: DocumentType.ROADWORTHINESS,
    status: DocumentStatus.APPROVED,
    fileName: 'VRT Certificates',
    fileUrl: '/uploads/vdoc-001.pdf',
    entityType: 'VEHICLE',
    entityId: '1',
    expiresAt: '2027-01-01T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'vdoc-002',
    type: DocumentType.ROADWORTHINESS,
    status: DocumentStatus.APPROVED,
    fileName: 'VRT Certificates',
    fileUrl: '/uploads/vdoc-002.pdf',
    entityType: 'VEHICLE',
    entityId: '1',
    expiresAt: '2027-06-01T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'vdoc-003',
    type: DocumentType.ROADWORTHINESS,
    status: DocumentStatus.PENDING,
    fileName: 'VRT Certificates',
    fileUrl: '/uploads/vdoc-003.pdf',
    entityType: 'VEHICLE',
    entityId: '1',
    expiresAt: '2027-12-01T00:00:00Z',
    rejectionReason: null,
    createdAt: '2025-07-01T00:00:00Z',
  },
];

// ── Driver Management Mock Data ──
export const mockDriverList: Driver[] = [
  {
    id: 'drv-1',
    driverId: 'DRV-MT-00001',
    firstName: 'John',
    lastName: 'Borg',
    phone: '+356 9932 3498',
    status: DriverStatus.ACTIVE,
    totalRides: 342,
    avgRating: 4.5,
    email: 'john@gmail.com',
    isOnline: true,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'drv-2',
    driverId: 'DRV-MT-00002',
    firstName: 'Mark',
    lastName: 'Vella',
    phone: '+356 9922 4567',
    status: DriverStatus.ACTIVE,
    totalRides: 209,
    avgRating: 4.3,
    email: 'mark@gmail.com',
    isOnline: false,
    createdAt: '2025-02-20T00:00:00Z',
  },
  {
    id: 'drv-3',
    driverId: 'DRV-MT-00003',
    firstName: 'Jose',
    lastName: 'Camilleri',
    phone: '+356 9934 5678',
    status: DriverStatus.ACTIVE,
    totalRides: 98,
    avgRating: 4.3,
    email: 'jose@gmail.com',
    isOnline: true,
    createdAt: '2025-03-10T00:00:00Z',
  },
];

export const mockDriverVehicleMap: Record<string, string> = {
  'drv-1': 'ABC-123',
  'drv-2': 'DP-189',
  'drv-3': 'ANT-786',
};

export const mockDriverCredentials: DriverCredentials = {
  driverId: 'DRV-MT-48291',
  temporaryPassword: 'GUZOH#7392',
};

export const mockDriverDetailData: Driver & { vehicle?: string } = {
  id: 'drv-1',
  driverId: 'MT-DK-123',
  firstName: 'John',
  lastName: 'Borg',
  phone: '+358 2367 2337',
  email: 'John@gmail.com',
  status: DriverStatus.ACTIVE,
  isOnline: true,
  avgRating: 4.8,
  totalRides: 342,
  createdAt: '2025-01-15T00:00:00Z',
  vehicle: 'ABC-123',
};

export const mockAssignedVehicle: AssignedVehicle = {
  plateNumber: 'ABC-123',
  model: 'Corolla',
  type: 'Sedan',
  make: 'Toyota',
};

export const mockDriverRides: DriverRide[] = [
  { id: 'ride-1', date: '2026-02-12', route: 'Vallat > Sliema', fare: 18 },
  { id: 'ride-2', date: '2026-02-12', route: 'Vallat > Sliema', fare: 18 },
];

export const mockDriverDocuments: DriverDocument[] = [
  { id: 'ddoc-1', type: 'VRT Certificates.', referenceNumber: '#01234567' },
  { id: 'ddoc-2', type: 'VRT Certificates.', referenceNumber: '#01234567' },
  { id: 'ddoc-3', type: 'VRT Certificates.', referenceNumber: '#01234567' },
];

// ── GPS Fleet Tracking Mock Data ──
export const mockFleetLocations: FleetLocationData[] = [
  {
    driverId: 'drv-1',
    driverName: 'John Borg',
    vehicle: { id: 'v1', plateNumber: 'ABC - 123', make: 'Toyota', model: 'Corolla', type: 'STANDARD' },
    lat: 35.8989,
    lng: 14.5146,
    heading: 45,
    speed: 42,
  },
  {
    driverId: 'drv-2',
    driverName: 'Mark Vella',
    vehicle: { id: 'v2', plateNumber: 'ABC - 123', make: 'Toyota', model: 'Camry', type: 'PREMIUM' },
    lat: 35.9122,
    lng: 14.5036,
    heading: 180,
    speed: null,
  },
  {
    driverId: 'drv-3',
    driverName: 'David Farrugia',
    vehicle: { id: 'v3', plateNumber: 'ABC - 123', make: 'Toyota', model: 'RAV4', type: 'XL' },
    lat: 35.9200,
    lng: 14.4890,
    heading: 270,
    speed: 42,
  },
  {
    driverId: 'drv-4',
    driverName: 'Sarah Zammit',
    vehicle: { id: 'v4', plateNumber: 'ABC - 123', make: 'Honda', model: 'Civic', type: 'STANDARD' },
    lat: 35.8880,
    lng: 14.5050,
    heading: 90,
    speed: null,
  },
];

export const mockRoutePolyline: [number, number][] = [
  [35.8989, 14.5146],
  [35.9050, 14.5100],
  [35.9122, 14.5036],
];

// ── Document Center Mock Data ──
export const mockCompanyDocuments: DocumentCenterItem[] = [
  { id: 'cdoc-1', entityType: 'SUPPLIER', type: 'COMPANY_REGISTRATION', status: 'APPROVED', fileName: 'business-reg.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z' },
  { id: 'cdoc-2', entityType: 'SUPPLIER', type: 'VAT_CERTIFICATE', status: 'APPROVED', fileName: 'vat-cert.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z' },
  { id: 'cdoc-3', entityType: 'SUPPLIER', type: 'INSURANCE', status: 'APPROVED', fileName: 'insurance.pdf', expiresAt: '2026-06-15T00:00:00Z', createdAt: '2025-06-15T00:00:00Z' },
  { id: 'cdoc-4', entityType: 'SUPPLIER', type: 'TAXI_LICENSE', status: 'PENDING', fileName: 'tm-license.pdf', expiresAt: '2026-12-31T00:00:00Z', createdAt: '2026-01-10T00:00:00Z' },
];

export const mockVehicleDocuments2: DocumentCenterItem[] = [
  { id: 'vdoc2-1', entityType: 'SUPPLIER', type: 'VEHICLE_REGISTRATION', status: 'APPROVED', fileName: 'reg.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z', vehiclePlate: 'ABC-123' },
  { id: 'vdoc2-2', entityType: 'SUPPLIER', type: 'VEHICLE_REGISTRATION', status: 'APPROVED', fileName: 'reg.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z', vehiclePlate: 'ABC-123' },
  { id: 'vdoc2-3', entityType: 'SUPPLIER', type: 'VEHICLE_REGISTRATION', status: 'APPROVED', fileName: 'reg.pdf', expiresAt: '2026-06-15T00:00:00Z', createdAt: '2025-06-15T00:00:00Z', vehiclePlate: 'ABC-123' },
  { id: 'vdoc2-4', entityType: 'SUPPLIER', type: 'VEHICLE_REGISTRATION', status: 'PENDING', fileName: 'reg.pdf', expiresAt: '2026-12-31T00:00:00Z', createdAt: '2026-01-10T00:00:00Z', vehiclePlate: 'ABC-123' },
];

export const mockDriverDocuments2: DocumentCenterItem[] = [
  { id: 'ddoc2-1', entityType: 'DRIVER', type: 'DRIVING_LICENSE', status: 'APPROVED', fileName: 'license.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z', driverName: 'John Borg' },
  { id: 'ddoc2-2', entityType: 'DRIVER', type: 'TAXI_LICENSE', status: 'APPROVED', fileName: 'tm-badge.pdf', expiresAt: null, createdAt: '2025-06-15T00:00:00Z', driverName: 'John Borg' },
  { id: 'ddoc2-3', entityType: 'DRIVER', type: 'DRIVING_LICENSE', status: 'APPROVED', fileName: 'license.pdf', expiresAt: '2026-06-15T00:00:00Z', createdAt: '2025-06-15T00:00:00Z', driverName: 'Mark Vella' },
  { id: 'ddoc2-4', entityType: 'DRIVER', type: 'TAXI_LICENSE', status: 'PENDING', fileName: 'tm-badge.pdf', expiresAt: '2026-12-31T00:00:00Z', createdAt: '2026-01-10T00:00:00Z', driverName: 'John Borg' },
];

// ── Financials Mock Data ──
export const mockFinancialKPIs: FinancialKPIs = {
  grossRevenue: 14520,
  commissionRate: 15,
  commissionAmount: 2178,
  netRevenue: 12342,
  pendingPayout: 3240,
  tipEarnings: 1840,
};

export const mockRevenueTrend: RevenueTrendPoint[] = [
  { month: 'Jan', revenue: 6200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 7100 },
  { month: 'Apr', revenue: 6500 },
  { month: 'May', revenue: 7800 },
  { month: 'Jun', revenue: 8200 },
  { month: 'Jul', revenue: 7500 },
  { month: 'Aug', revenue: 9100 },
  { month: 'Sep', revenue: 8800 },
  { month: 'Oct', revenue: 9500 },
  { month: 'Nov', revenue: 10200 },
  { month: 'Dec', revenue: 11800 },
];

export const mockPerDriverEarnings: PerDriverEarning[] = [
  { driverName: 'Hans Mueller', rides: 87, gross: 3480, commission: 522, net: 2958, avgPerRide: 34, tipEarnings: 420, tipCount: 52 },
  { driverName: 'Anna Schmidt', rides: 76, gross: 3040, commission: 456, net: 2584, avgPerRide: 34, tipEarnings: 380, tipCount: 45 },
  { driverName: 'Peter Weber', rides: 68, gross: 2720, commission: 408, net: 2312, avgPerRide: 34, tipEarnings: 310, tipCount: 38 },
  { driverName: 'Maria Fischer', rides: 62, gross: 2480, commission: 372, net: 2108, avgPerRide: 34, tipEarnings: 280, tipCount: 30 },
  { driverName: 'Thomas Koch', rides: 54, gross: 2160, commission: 324, net: 1836, avgPerRide: 34, tipEarnings: 250, tipCount: 28 },
  { driverName: 'Sarah Braun', rides: 41, gross: 1640, commission: 246, net: 1394, avgPerRide: 34, tipEarnings: 200, tipCount: 22 },
];

export const mockPayoutHistory: PayoutRecord[] = [
  { id: 'pay-1', amount: 10889, status: 'COMPLETED', periodStart: '2026-01-01T00:00:00Z', periodEnd: '2026-01-31T00:00:00Z', processedAt: '2026-02-05T00:00:00Z', createdAt: '2026-02-01T00:00:00Z' },
  { id: 'pay-2', amount: 9076, status: 'COMPLETED', periodStart: '2025-12-01T00:00:00Z', periodEnd: '2025-12-31T00:00:00Z', processedAt: '2026-01-05T00:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'pay-3', amount: 8202, status: 'COMPLETED', periodStart: '2025-11-01T00:00:00Z', periodEnd: '2025-11-30T00:00:00Z', processedAt: '2025-12-05T00:00:00Z', createdAt: '2025-12-01T00:00:00Z' },
];

// ── Maintenance & Fuel Global Mock Data ──
export const mockGlobalMaintenanceLogs: MaintenanceLogEntry[] = [
  { id: 'm1', vehicle: 'ABC-123', type: 'Oil Change', date: '2026-01-15', mileage: '45,200 Km', cost: 85, status: 'Completed' },
  { id: 'm2', vehicle: 'DEF-456', type: 'Tire Rotation', date: '2026-01-20', mileage: '32,100 Km', cost: 120, status: 'Completed' },
  { id: 'm3', vehicle: 'GHI-789', type: 'Brake Inspection', date: '2026-02-01', mileage: '28,900 Km', cost: 200, status: 'Pending' },
  { id: 'm4', vehicle: 'MNO-345', type: 'Oil Change', date: '2026-02-10', mileage: '51,000 Km', cost: 85, status: 'Scheduled' },
];

export const mockGlobalFuelLogs: FuelLogEntry[] = [
  { id: 'f1', vehicle: 'ABC-123', driver: 'John Borg', date: '2026-02-13', liters: 45, cost: 72, mileage: '49,800 Km' },
  { id: 'f2', vehicle: 'DEF-456', driver: 'Mark Vella', date: '2026-02-09', liters: 50, cost: 80, mileage: '32,650 Km' },
  { id: 'f3', vehicle: 'GHI-789', driver: 'David Farrugia', date: '2026-02-06', liters: 42, cost: 67, mileage: '30,200 Km' },
  { id: 'f4', vehicle: 'MNO-345', driver: 'Sarah Zammit', date: '2026-02-07', liters: 48, cost: 77, mileage: '51,900 Km' },
];

// ── Analytics Mock Data ──
export const mockRidesThisWeek: WeeklyChartPoint[] = [
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 48 },
  { day: 'Wed', value: 72 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 85 },
  { day: 'Sat', value: 55 },
  { day: 'Sun', value: 40 },
];

export const mockRevenueTrendWeekly: WeeklyChartPoint[] = [
  { day: 'Mon', value: 4200 },
  { day: 'Tue', value: 3800 },
  { day: 'Wed', value: 5100 },
  { day: 'Thu', value: 6500 },
  { day: 'Fri', value: 6100 },
  { day: 'Sat', value: 3900 },
  { day: 'Sun', value: 2800 },
];

export const mockDriverPerformance: WeeklyChartPoint[] = [
  { day: 'Mon', value: 35 },
  { day: 'Tue', value: 28 },
  { day: 'Wed', value: 42 },
  { day: 'Thu', value: 38 },
  { day: 'Fri', value: 45 },
  { day: 'Sat', value: 30 },
  { day: 'Sun', value: 22 },
];

export const mockSystemDistribution: SystemDistSegment[] = [
  { name: 'System', value: 15 },
  { name: 'System', value: 15 },
  { name: 'System', value: 15 },
  { name: 'System', value: 15 },
];

// ── Subscription Mock Data ──
export const mockSubscriptionInfo: SubscriptionInfo = {
  tier: 'PROFESSIONAL',
  maxVehicles: 25,
  maxDrivers: 25,
  currentPeriodEnd: '2026-03-01T00:00:00Z',
};

export const mockSubscriptionUsage = {
  totalVehicles: 7,
  totalDrivers: 6,
};

export const vehicleRatePricing: VehicleRate[] = [
  { vehicleType: 'Economy', baseRate: 2.50, perKm: 0.85, perMin: 0.15, minFare: 5.00 },
  { vehicleType: 'Standard', baseRate: 3.50, perKm: 0.50, perMin: 0.20, minFare: 6.50 },
  { vehicleType: 'Premium', baseRate: 5.00, perKm: 0.80, perMin: 0.30, minFare: 9.00 },
  { vehicleType: 'XL (6+ seats)', baseRate: 5.50, perKm: 0.80, perMin: 0.25, minFare: 10.00 },
  { vehicleType: 'Electric/Green', baseRate: 3.00, perKm: 1.00, perMin: 0.18, minFare: 6.00 },
];

export const mockBillingHistory: BillingRecord[] = [
  { id: 'b1', date: '2026-02-01', description: 'Professional Plan — February 2026', amount: 99, status: 'Paid', invoiceUrl: null },
  { id: 'b2', date: '2026-01-01', description: 'Professional Plan — January 2026', amount: 99, status: 'Paid', invoiceUrl: null },
  { id: 'b3', date: '2025-12-01', description: 'Professional Plan — December 2025', amount: 99, status: 'Paid', invoiceUrl: null },
];

// ── Settings Mock Data ──
export const mockCompanyProfile: CompanyProfile = {
  companyName: 'Gozolt Transport Ltd.',
  registrationNumber: 'C-12345',
  vatNumber: 'MT1234567',
  email: 'admin@gozolttransport.com',
  phone: '+356 2123 4567',
  address: '123 Republic Street',
  city: 'Valletta',
  country: 'Malta',
  postalCode: 'VLT 1234',
};

export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  rideAlerts: true,
  payoutAlerts: true,
};

export const defaultPrivacySettings: PrivacySettings = {
  shareAnalytics: true,
  showDriverProfiles: true,
  allowMarketingEmails: false,
};

export const mockTeamUsers: TeamUser[] = [
  { id: 'u1', name: 'John Borg', email: 'john@gozolttransport.com', role: 'Owner', status: 'Active', joinedAt: '2025-01-15T00:00:00Z' },
  { id: 'u2', name: 'Maria Camilleri', email: 'maria@gozolttransport.com', role: 'Admin', status: 'Active', joinedAt: '2025-03-20T00:00:00Z' },
  { id: 'u3', name: 'David Farrugia', email: 'david@gozolttransport.com', role: 'Manager', status: 'Active', joinedAt: '2025-06-10T00:00:00Z' },
  { id: 'u4', name: 'Sarah Zammit', email: 'sarah@gozolttransport.com', role: 'Viewer', status: 'Pending', joinedAt: '2026-02-01T00:00:00Z' },
];

export const defaultLanguageSettings: LanguageSettings = {
  appLanguage: 'English',
  driverAppLanguage: 'English',
};

// ── Dashboard Mock Data ──
export const mockDashboardKpis: DashboardKpis = {
  activeDrivers: 24,
  totalVehicles: 31,
  ridesToday: 87,
  revenueMTD: 14450,
  tipEarningsMTD: 1840,
};

export const mockDashboardActiveRides: DashboardActiveRide[] = [
  { id: '1', driver: 'John Borg', vehicle: 'ABC-123', rider: 'Maria C.', route: 'Sliema → Marsa', status: 'In progress', duration: '12 min', tipAmount: 2.00 },
  { id: '2', driver: 'Mark Vella', vehicle: 'DEF-456', rider: 'James F.', route: 'Valletta → Mosta', status: 'In progress', duration: '8 min', tipAmount: null },
  { id: '3', driver: 'David Farrugia', vehicle: 'GHI-789', rider: 'Anna S.', route: 'St Julians → Rabat', status: 'In progress', duration: '18 min', tipAmount: 3.00 },
];

// ── Rides Management Mock Data ──
export const mockSupplierRides: SupplierRideListItem[] = [
  { id: 'ride-001', displayId: 'R-5001', driverName: 'Hans Mueller', driverId: 'drv-001', vehiclePlate: 'ABC-123', vehicleType: 'STANDARD', riderName: 'James Falzon', pickup: 'Valletta Bus Terminal', dropoff: 'Sliema Ferries', status: 'COMPLETED', estimatedFare: 12.50, actualFare: 13.20, baseFare: 5.00, distanceFare: 4.80, timeFare: 2.40, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 2.00, paymentMethod: 'CARD', requestedAt: '2026-02-25T08:30:00Z', completedAt: '2026-02-25T08:52:00Z' },
  { id: 'ride-002', displayId: 'R-5002', driverName: 'Anna Schmidt', driverId: 'drv-002', vehiclePlate: 'DEF-456', vehicleType: 'PREMIUM', riderName: 'Maria Camilleri', pickup: 'Mosta Centre', dropoff: 'Valletta Waterfront', status: 'COMPLETED', estimatedFare: 15.00, actualFare: 16.80, baseFare: 5.00, distanceFare: 7.20, timeFare: 3.60, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 3.00, paymentMethod: 'CARD', requestedAt: '2026-02-25T09:15:00Z', completedAt: '2026-02-25T09:42:00Z' },
  { id: 'ride-003', displayId: 'R-5003', driverName: 'Peter Weber', driverId: 'drv-003', vehiclePlate: 'GHI-789', vehicleType: 'STANDARD', riderName: 'David Zammit', pickup: 'St Julians Paceville', dropoff: 'Bugibba Square', status: 'IN_PROGRESS', estimatedFare: 18.00, actualFare: null, baseFare: null, distanceFare: null, timeFare: null, bookingFee: null, surgeMultiplier: 1.2, tipAmount: null, paymentMethod: 'CASH', requestedAt: '2026-02-25T10:00:00Z', completedAt: null },
  { id: 'ride-004', displayId: 'R-5004', driverName: 'Hans Mueller', driverId: 'drv-001', vehiclePlate: 'ABC-123', vehicleType: 'STANDARD', riderName: 'Sarah Borg', pickup: 'Mdina Gate', dropoff: 'Marsaxlokk Market', status: 'COMPLETED', estimatedFare: 22.00, actualFare: 24.50, baseFare: 5.00, distanceFare: 12.00, timeFare: 6.50, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 5.00, paymentMethod: 'CARD', requestedAt: '2026-02-24T14:20:00Z', completedAt: '2026-02-24T14:55:00Z' },
  { id: 'ride-005', displayId: 'R-5005', driverName: 'Maria Fischer', driverId: 'drv-004', vehiclePlate: 'JKL-012', vehicleType: 'PREMIUM', riderName: 'John Galea', pickup: 'MIA Airport', dropoff: 'Hilton Portomaso', status: 'COMPLETED', estimatedFare: 20.00, actualFare: 19.80, baseFare: 5.00, distanceFare: 9.00, timeFare: 4.80, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: null, paymentMethod: 'CARD', requestedAt: '2026-02-24T16:30:00Z', completedAt: '2026-02-24T16:52:00Z' },
  { id: 'ride-006', displayId: 'R-5006', driverName: 'Thomas Koch', driverId: 'drv-005', vehiclePlate: 'MNO-345', vehicleType: 'XL', riderName: 'Chris Vella', pickup: 'Mellieha Bay', dropoff: 'Cirkewwa Ferry', status: 'CANCELLED', estimatedFare: 8.00, actualFare: null, baseFare: null, distanceFare: null, timeFare: null, bookingFee: null, surgeMultiplier: 1.0, tipAmount: null, paymentMethod: 'CARD', requestedAt: '2026-02-24T11:00:00Z', completedAt: null },
  { id: 'ride-007', displayId: 'R-5007', driverName: 'Anna Schmidt', driverId: 'drv-002', vehiclePlate: 'DEF-456', vehicleType: 'PREMIUM', riderName: 'Tina Abela', pickup: 'Qormi Road', dropoff: 'Hamrun Centre', status: 'COMPLETED', estimatedFare: 7.50, actualFare: 7.20, baseFare: 3.50, distanceFare: 2.00, timeFare: 0.70, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 1.50, paymentMethod: 'CASH', requestedAt: '2026-02-23T08:00:00Z', completedAt: '2026-02-23T08:12:00Z' },
  { id: 'ride-008', displayId: 'R-5008', driverName: 'Peter Weber', driverId: 'drv-003', vehiclePlate: 'GHI-789', vehicleType: 'STANDARD', riderName: 'Paul Grech', pickup: 'Tarxien Temples', dropoff: 'Paola Square', status: 'COMPLETED', estimatedFare: 6.00, actualFare: 5.80, baseFare: 3.50, distanceFare: 1.30, timeFare: 0.00, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 1.00, paymentMethod: 'CARD', requestedAt: '2026-02-23T10:30:00Z', completedAt: '2026-02-23T10:38:00Z' },
  { id: 'ride-009', displayId: 'R-5009', driverName: 'Hans Mueller', driverId: 'drv-001', vehiclePlate: 'ABC-123', vehicleType: 'STANDARD', riderName: 'Rita Azzopardi', pickup: 'Sliema Strand', dropoff: 'Gzira Seafront', status: 'NO_SHOW_USER', estimatedFare: 5.50, actualFare: null, baseFare: null, distanceFare: null, timeFare: null, bookingFee: null, surgeMultiplier: 1.0, tipAmount: null, paymentMethod: 'CARD', requestedAt: '2026-02-22T18:00:00Z', completedAt: null },
  { id: 'ride-010', displayId: 'R-5010', driverName: 'Maria Fischer', driverId: 'drv-004', vehiclePlate: 'JKL-012', vehicleType: 'PREMIUM', riderName: 'Luke Mifsud', pickup: 'Balzan Centre', dropoff: 'Attard Gardens', status: 'COMPLETED', estimatedFare: 8.00, actualFare: 8.40, baseFare: 3.50, distanceFare: 3.20, timeFare: 0.70, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: 2.00, paymentMethod: 'CARD', requestedAt: '2026-02-22T09:00:00Z', completedAt: '2026-02-22T09:15:00Z' },
  { id: 'ride-011', displayId: 'R-5011', driverName: 'Thomas Koch', driverId: 'drv-005', vehiclePlate: 'MNO-345', vehicleType: 'XL', riderName: 'Amy Spiteri', pickup: 'Naxxar Centre', dropoff: 'San Gwann', status: 'COMPLETED', estimatedFare: 9.00, actualFare: 8.60, baseFare: 5.50, distanceFare: 1.80, timeFare: 0.30, bookingFee: 1.00, surgeMultiplier: 1.0, tipAmount: null, paymentMethod: 'CASH', requestedAt: '2026-02-21T15:00:00Z', completedAt: '2026-02-21T15:14:00Z' },
  { id: 'ride-012', displayId: 'R-5012', driverName: 'Anna Schmidt', driverId: 'drv-002', vehiclePlate: 'DEF-456', vehicleType: 'PREMIUM', riderName: 'Ivan Bonnici', pickup: 'Birkirkara Bypass', dropoff: 'Msida Marina', status: 'IN_PROGRESS', estimatedFare: 10.00, actualFare: null, baseFare: null, distanceFare: null, timeFare: null, bookingFee: null, surgeMultiplier: 1.0, tipAmount: null, paymentMethod: 'CARD', requestedAt: '2026-02-25T10:30:00Z', completedAt: null },
];

export const mockSupplierRideKpis: SupplierRideKpis = {
  totalRides: 1847, completedToday: 87, activeNow: 12,
  totalRevenue: 14450, totalTips: 1840, cancellationRate: 6.2,
};

// ── Invoice Mock Data ──
export const mockSupplierStatements: SupplierStatement[] = [
  { id: 'inv-001', statementNo: 'INV-2026-001', periodStart: '2026-01-01T00:00:00Z', periodEnd: '2026-01-31T00:00:00Z', totalRides: 342, grossRevenue: 10889, commissionEarned: 1633, netBalance: 9256, pdfUrl: null },
  { id: 'inv-002', statementNo: 'INV-2025-012', periodStart: '2025-12-01T00:00:00Z', periodEnd: '2025-12-31T00:00:00Z', totalRides: 298, grossRevenue: 9076, commissionEarned: 1361, netBalance: 7715, pdfUrl: null },
  { id: 'inv-003', statementNo: 'INV-2025-011', periodStart: '2025-11-01T00:00:00Z', periodEnd: '2025-11-30T00:00:00Z', totalRides: 275, grossRevenue: 8202, commissionEarned: 1230, netBalance: 6972, pdfUrl: null },
  { id: 'inv-004', statementNo: 'INV-2025-010', periodStart: '2025-10-01T00:00:00Z', periodEnd: '2025-10-31T00:00:00Z', totalRides: 310, grossRevenue: 9450, commissionEarned: 1418, netBalance: 8032, pdfUrl: null },
  { id: 'inv-005', statementNo: 'INV-2025-009', periodStart: '2025-09-01T00:00:00Z', periodEnd: '2025-09-30T00:00:00Z', totalRides: 265, grossRevenue: 7890, commissionEarned: 1184, netBalance: 6706, pdfUrl: null },
  { id: 'inv-006', statementNo: 'INV-2025-008', periodStart: '2025-08-01T00:00:00Z', periodEnd: '2025-08-31T00:00:00Z', totalRides: 290, grossRevenue: 8700, commissionEarned: 1305, netBalance: 7395, pdfUrl: null },
];

export const mockInvoiceKpis: InvoiceKpis = {
  totalInvoiced: 42680, paid: 38200, pending: 4480, tipPassThrough: 3840,
};

// ── Driver Earnings Breakdown Mock Data ──
export const mockDriverEarningsBreakdown: DriverEarningsBreakdown = {
  totalEarnings: 3480, cashEarnings: 1200, cardEarnings: 1860, tipEarnings: 420, tipCount: 52, ridesCompleted: 87,
};

// ── Document Expiry Mock Data ──
export const mockExpiringDocuments: ExpiringDocument[] = [
  { id: 'doc-exp-1', type: 'Insurance', entityName: 'Vehicle ABC-123', expiresAt: '2026-03-15', daysUntilExpiry: 16 },
  { id: 'doc-exp-2', type: 'Driving License', entityName: 'Hans Mueller', expiresAt: '2026-03-08', daysUntilExpiry: 9 },
];

// ── Tips Analytics Mock Data ──
export const mockTipTrendWeek: WeeklyChartPoint[] = [
  { day: 'Mon', value: 42 }, { day: 'Tue', value: 35 },
  { day: 'Wed', value: 55 }, { day: 'Thu', value: 62 },
  { day: 'Fri', value: 71 }, { day: 'Sat', value: 85 },
  { day: 'Sun', value: 48 },
];

// ── Maintenance Reminders Mock Data ──
export const mockMaintenanceReminders: MaintenanceReminder[] = [
  { id: 'mr-1', vehiclePlate: 'ABC-123', type: 'Oil Change', dueDate: '2026-03-01', daysUntilDue: 2, status: 'upcoming' },
  { id: 'mr-2', vehiclePlate: 'DEF-456', type: 'Tire Rotation', dueDate: '2026-02-20', daysUntilDue: -7, status: 'overdue' },
  { id: 'mr-3', vehiclePlate: 'GHI-789', type: 'Brake Inspection', dueDate: '2026-03-15', daysUntilDue: 16, status: 'upcoming' },
];
