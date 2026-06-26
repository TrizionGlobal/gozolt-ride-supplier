// Enums from Prisma schema
export enum Role {
  USER = 'USER',
  DRIVER = 'DRIVER',
  SUPPLIER = 'SUPPLIER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum DriverStatus {
  NEW_DRIVER = 'NEW_DRIVER',
  SUPPLIER_APPROVED = 'SUPPLIER_APPROVED',
  SUPPLIER_SUSPENDED = 'SUPPLIER_SUSPENDED',
  ADMIN_APPROVED = 'ADMIN_APPROVED',
  ADMIN_SUSPENDED = 'ADMIN_SUSPENDED',
  VEHICLE_ASSIGNED = 'VEHICLE_ASSIGNED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum SupplierStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum VehicleType {
  ECONOMY = 'ECONOMY',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  XL = 'XL',
  ELECTRIC = 'ELECTRIC',
}

export enum VehicleStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  WALLET = 'WALLET',
}

export enum SubscriptionTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum DocumentType {
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  INSURANCE = 'INSURANCE',
  ROADWORTHINESS = 'ROADWORTHINESS',
  POLICE_CLEARANCE = 'POLICE_CLEARANCE',
  TAXI_LICENSE = 'TAXI_LICENSE',
  OPERATOR_LICENSE = 'OPERATOR_LICENSE',
  COMPANY_REGISTRATION = 'COMPANY_REGISTRATION',
  VAT_CERTIFICATE = 'VAT_CERTIFICATE',
  VAT_REGISTRATION = 'VAT_REGISTRATION',
  PUBLIC_LIABILITY_INSURANCE = 'PUBLIC_LIABILITY_INSURANCE',
  VEHICLE_PHOTO_FRONT = 'VEHICLE_PHOTO_FRONT',
  VEHICLE_PHOTO_BACK = 'VEHICLE_PHOTO_BACK',
  VEHICLE_PHOTO_SIDE = 'VEHICLE_PHOTO_SIDE',
  VEHICLE_PHOTO_INTERIOR = 'VEHICLE_PHOTO_INTERIOR',
  VEHICLE_PHOTO_INTERIOR_2 = 'VEHICLE_PHOTO_INTERIOR_2',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  ID_CARD = 'ID_CARD',
}

// Shared pagination types
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface PaginatedQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// Supplier-specific interfaces
export interface SupplierProfile {
  id: string;
  email: string;
  companyName: string;
  vatNumber: string | null;
  contactPhone: string | null;
  status: SupplierStatus;
  subscription: SupplierSubscription | null;
  defaultDriverCommission?: number;
  supplierBankName?: string | null;
  supplierAccountNumber?: string | null;
  supplierAccountHolder?: string | null;
  supplierSwiftCode?: string | null;
  tradingName?: string | null;
  registrationNo?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  logoUrl?: string | null;
  editBankDetails?: boolean;
  createdAt: string;
}

export interface SupplierDriver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  vehicleId: string | null;
  createdAt: string;
}

export interface SupplierVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  type: VehicleType;
  fuelType: FuelType;
  status: VehicleStatus;
  assignedDriverId: string | null;
  createdAt: string;
}

export interface SupplierDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileUrl: string;
  entityType: string;
  entityId: string;
  vehicleId?: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface SupplierPayout {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

export interface SupplierSubscription {
  id: string;
  tier: SubscriptionTier;
  status: string;
  maxDrivers: number;
  maxVehicles: number;
  maxRides: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalRides: number;
  revenue: number;
  pendingDocuments: number;
}

// Fleet interfaces
export interface FleetVehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin: string | null;
  fuelType: FuelType;
  seats: number;
  status: VehicleStatus;
  photoUrls: string[];
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  createdAt: string;
}

export interface FleetVehicleDetail extends FleetVehicle {
  maintenanceCount: number;
  fuelLogCount: number;
  driver?: FleetDriverDetail | null;
  documents?: SupplierDocument[];
  rideCount?: number;
}

export interface MaintenanceLog {
  id: string;
  type: string;
  description: string | null;
  cost: number | null;
  performedAt: string;
  nextDueAt: string | null;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  liters: number;
  cost: number;
  odometer: number | null;
  filledAt: string;
  createdAt: string;
}

export interface CreateVehiclePayload {
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vin?: string;
  fuelType?: string;
  seats?: number;
  insurancePolicyNumber?: string;
  taxRate?: number;
  mileage?: number;
}

export interface FleetDriverDetail {
  id: string;
  driverId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: DriverStatus;
  isOnline: boolean;
  avgRating: number;
  totalRides: number;
}

// Driver management interfaces
export interface Driver {
  id: string;
  driverId: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status: DriverStatus;
  isOnline: boolean;
  avgRating: number;
  totalRides: number;
  createdAt: string;
}

export interface DriverCredentials {
  driverId: string;
  temporaryPassword: string;
}

export interface CreateDriverPayload {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo?: File;
  docs?: { label: string; file: File }[];
  dateOfBirth?: string;
  nationality?: string;
  countryOfResidence?: string;
  nationalId?: string;
  homeAddress?: string;
  emergencyContacts?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  licenseIssueDate?: string;
  licenseCategory?: string;
  licenseIssuingCountry?: string;
  cpcCertificateNumber?: string;
  taxiPhvLicenseNumber?: string;
  insurancePolicyNumber?: string;
}

export interface ChangeDriverStatusPayload {
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface DriverRide {
  id: string;
  date: string;
  route: string;
  fare: number;
}

export interface DriverDocument {
  id: string;
  type: string;
  referenceNumber: string;
  fileUrl?: string;
  fileName?: string;
  status?: string;
  expiresAt?: string;
  uploadedAt?: string;
}

export interface AssignedVehicle {
  plateNumber: string;
  model: string;
  type: string;
  make: string;
}

// Document Center interfaces
export type DocumentTab = 'Company' | 'Vehicle' | 'Driver';

export interface DocumentCenterItem {
  id: string;
  entityType: string;
  type: string;
  status: string;
  fileName: string;
  expiresAt: string | null;
  createdAt: string;
  entityName?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverId?: string;
  vehicleId?: string;
  rejectionReason?: string | null;
  fileUrl?: string | null;
}

export interface UploadDocumentPayload {
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  driverId?: string;
  vehicleId?: string;
  expiresAt?: string;
  file?: File;
  entityType?: string;
  documentId?: string;
}

// GPS Fleet Tracking interfaces
export interface FleetLocationData {
  driverId: string;
  driverName: string;
  vehicle: {
    id: string;
    plateNumber: string;
    make: string;
    model: string;
    type: string;
  } | null;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
}

export type FleetStatusFilter = 'All' | 'Online' | 'On Ride' | 'Available' | 'Offline';

// Financial interfaces
export interface FinancialKPIs {
  grossRevenue: number;
  commissionAmount: number;
  commissionRate: number;
  netRevenue: number;
  pendingPayout: number;
  tipEarnings: number;
}

export interface PerDriverEarning {
  driverId: string;
  driverName: string;
  vehicleType?: string | null;
  totalEarnings: number;
  totalTips: number;
  totalPaidOut: number;
  availableBalance: number;
  totalCashReceived?: number;
  totalCardReceived?: number;
  lastPaymentDate?: string;
  cardEarnings?: number;
  cashEarnings?: number;
  tipEarnings?: number;
  tipCount?: number;
  ridesCompleted?: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  periodStart: string | null;
  periodEnd: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface PayoutSettings {
  schedule: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  isStripeConnected: boolean;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

export interface SupplierStatement {
  id: string;
  statementNo: string;
  periodStart: string;
  periodEnd: string;
  totalRides: number;
  grossRevenue: number;
  commissionEarned: number;
  netBalance: number;
  pdfUrl: string | null;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
}

// Subscription interfaces
export interface SubscriptionInfo {
  tier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  maxVehicles: number;
  maxDrivers: number;
  maxRides: number;
  currentPeriodEnd: string | null;
}

export interface PlanDetails {
  tier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  price: number;
  maxVehicles: number;
  maxDrivers: number;
  maxRides: number;
  features: string[];
  isRecommended?: boolean;
}

export interface VehicleRate {
  vehicleType: string;
  baseRate: number;
  perKm: number;
  perMin: number;
  minFare: number;
}

export interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  invoiceUrl: string | null;
}

// Maintenance & Fuel interfaces
export interface MaintenanceLogEntry {
  id: string;
  vehicle: string;
  type: string;
  rawDate?: string;
  date: string;
  mileage: string;
  cost: number;
  status: 'Completed' | 'Scheduled' | 'Pending' | 'Overdue';
  nextDueAt?: string;
}

export interface FuelLogEntry {
  id: string;
  vehicle: string;
  rawDate?: string;
  date: string;
  liters: number;
  cost: number;
  mileage: string;
}

// Analytics interfaces
export interface WeeklyChartPoint {
  day: string;
  value: number;
}

export interface SystemDistSegment {
  name: string;
  value: number;
}

// Settings interfaces
export interface CompanyProfile {
  companyName: string;
  registrationNumber: string;
  vatNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  defaultDriverCommission: number;
  logoUrl?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  rideAlerts: boolean;
  payoutAlerts: boolean;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  showDriverProfiles: boolean;
  allowMarketingEmails: boolean;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Pending';
  joinedAt: string;
}

export interface LanguageSettings {
  appLanguage: string;
  driverAppLanguage: string;
}

export type SettingsTab = 'company' | 'notifications' | 'users' | 'language' | 'privacy' | 'security' | 'bank';

export interface RegistrationFormData {
  companyName: string;
  metroName: string;
  sortingName: string;
  registration: string;
  metroNumber: string;
  dOrder: string;
  vatNumber: string;
  tinNumber: string;
  address: string;
  taxBase: string;
  email: string;
  infoEmail: string;
  phone: string;
  city: string;
  adjustedTime: string;
  mod: string;
  password: string;
  confirmPassword: string;
}

// Dashboard interfaces
export interface DashboardKpis {
  activeDrivers: number;
  totalVehicles: number;
  ridesToday: number;
  revenueMTD: number;
  tipEarningsMTD: number;
}

export interface DashboardActiveRide {
  id: string;
  driver: string;
  vehicle: string;
  rider: string;
  route: string;
  status: string;
  duration: string;
  tipAmount: number | null;
}

// Rides Management interfaces
export interface SupplierRideListItem {
  id: string;
  displayId: string;
  driverName: string;
  driverId: string;
  vehiclePlate: string;
  vehicleType: string;
  riderName: string | null;
  pickup: string;
  dropoff: string;
  distance: string;
  status: string;
  estimatedFare: number;
  actualFare: number | null;
  baseFare: number | null;
  distanceFare: number | null;
  timeFare: number | null;
  bookingFee: number | null;
  surgeMultiplier: number;
  tipAmount: number | null;
  paymentMethod: string;
  requestedAt: string;
  completedAt: string | null;
}

export interface SupplierRideKpis {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeNow: number;
}

// Invoice interfaces
export interface InvoiceKpis {
  totalInvoiced: number;
  paid: number;
  pending: number;
  tipPassThrough: number;
}

// Driver earnings breakdown
export interface DriverEarningsBreakdown {
  totalEarnings: number;
  cashEarnings: number;
  cardEarnings: number;
  tipEarnings: number;
  tipCount: number;
  ridesCompleted: number;
}

// Document expiry
export interface ExpiringDocument {
  id: string;
  type: string;
  entityName: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

// 2FA
export interface TwoFactorSetup {
  qrCodeUrl: string;
  secret: string;
  isEnabled: boolean;
}

// Maintenance reminders
export interface MaintenanceReminder {
  id: string;
  vehiclePlate: string;
  type: string;
  dueDate: string;
  daysUntilDue: number;
  status: 'upcoming' | 'overdue';
}
