export type QuickServiceId =
  | 'HOME_SERVICE'
  | 'PC_MOBILE_REPAIR'
  | 'PLUMBING_CARPENTRY'
  | 'VEHICLE_MECHANIC'
  | 'VEHICLE_WASH'
  | 'ELECTRICAL_MECHANIC'
  | 'APPLIANCE_REPAIR'
  | 'BEAUTY_WELLNESS'
  | 'HIRE_A_PERSON'
  | 'LAUNDRY_WORKER'
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