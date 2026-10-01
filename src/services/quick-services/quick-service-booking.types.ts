export type QuickServiceBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'TO_ASSIGN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type QuickServicePaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type QuickServiceExecutionStatus =
  | 'PENDING'
  | 'SELF_ASSIGNED'
  | 'WORKER_ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type QuickServiceAssignmentFilter =
  | 'ALL'
  | 'UNASSIGNED'
  | 'ASSIGNED_TO_ME'
  | 'WORKER_ASSIGNED';

export interface QuickServiceCustomer {
  id: string;
  name: string;
  email?: string;
  mobile: string;
}

export interface QuickServiceWorker {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
  tasks?: unknown[];
  bikeTasks?: unknown[];
  quickServiceTasks?: unknown[];
}

export interface QuickServiceWorkerListResponse {
  workers: QuickServiceWorker[];
  total: number;
}

export interface QuickServiceBookingTimelineItem {
  id: string;
  status: QuickServiceBookingStatus;
  description?: string;
  createdAt: string;
}

export interface QuickServiceBooking {
  id: string;
  bookingReference: string;

  customer: QuickServiceCustomer;

  categoryId: string;
  categoryName: string;
  childService?: string | null;

  description?: string | null;
  requirements?: Record<string, unknown> | null;
  attachments?: string[];

  serviceAddress: string;
  latitude?: number;
  longitude?: number;
  scheduledAt: string;

  status: QuickServiceBookingStatus;
  serviceStatus?: QuickServiceExecutionStatus;
  paymentStatus: QuickServicePaymentStatus;

  amount?: number;
  currency?: string;
  
  collectedAmount?: number;
  paymentMethodType?: string;

  assignedToSupplier?: boolean;
  assignedToSelf?: boolean;
  worker?: QuickServiceWorker | null;

  timeline?: QuickServiceBookingTimelineItem[];

  createdAt: string;
  updatedAt?: string;
}

export interface QuickServiceBookingFilters {
  search?: string;
  categoryId?: string;
  childService?: string;
  status?: QuickServiceBookingStatus | '';
  assignment?: QuickServiceAssignmentFilter;
  page?: number;
  limit?: number;
}

export interface QuickServiceBookingListResponse {
  bookings: QuickServiceBooking[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignQuickServiceWorkerPayload {
  workerId: string;
}