export type QuickServiceId =
  | 'HOME_SERVICE'
  | 'PC_MOBILE_REPAIR'
  | 'VEHICLE_MECHANIC'
  | 'VEHICLE_WASH'
  | 'ELECTRICAL_REPAIR'
  | 'APPLIANCE_REPAIR'
  | 'BEAUTICIAN_WELLNESS'
  | 'LAUNDRY'
  | 'HIRE_A_PERSON'
  | 'SECURITY_BOUNCER'
  | 'OTHER_SERVICES';

export interface QuickChildService {
  id: string;
  name: string;
}

export interface QuickService {
  id: QuickServiceId;
  name: string;
  description: string;
  icon: string;
  children: QuickChildService[];
}

export interface SelectedQuickService {
  serviceId: QuickServiceId;
  childServiceIds: string[];
}

export interface QuickServiceSelection {
  services: SelectedQuickService[];
}
