export interface SupplierQuickServiceCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  childServices: string[];
}

export const SUPPLIER_QUICK_SERVICE_CATEGORIES:
  SupplierQuickServiceCategory[] = [
  {
    id: 'HOME_SERVICE',
    slug: 'home-service',
    name: 'Home Service',
    icon: '/home-service-icon.png',
    childServices: [
      'Home Cleaning',
      'Pest Control',
      'Gardening',
    ],
  },
  {
    id: 'PC_MOBILE_REPAIR',
    slug: 'pc-mobile-repair',
    name: 'PC / Mobile Repair',
    icon: '/pc-mobile-repair-icon.png',
    childServices: [
      'Mobile',
      'Laptop/Computer',
      'Printer',
      'Scanner',
    ],
  },

  {
    id: 'VEHICLE_MECHANIC',
    slug: 'vehicle-mechanic',
    name: 'Vehicle Mechanic',
    icon: '/vehicle-mechanic-icon.png',
    childServices: ['Car', 'Bike', 'Truck'],
  },
  {
    id: 'VEHICLE_WASH',
    slug: 'vehicle-wash',
    name: 'Vehicle Wash',
    icon: '/vehicle-wash-icon.png',
    childServices: ['Car', 'Bike', 'Truck'],
  },
  {
    id: 'ELECTRICAL_REPAIR',
    slug: 'electrical-repair',
    name: 'Electrical Repair',
    icon: '/electrical-mechanic-icon.png',
    childServices: ['Home', 'Commercial', 'Events'],
  },
  {
    id: 'APPLIANCE_REPAIR',
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    icon: '/appliance-repair-icon.png',
    childServices: [],
  },
  {
    id: 'BEAUTICIAN_WELLNESS',
    slug: 'beautician-wellness',
    name: 'Beautician / Wellness',
    icon: '/beauty-wellness-icon.png',
    childServices: ['Male', 'Female', 'Kids', 'Others'],
  },
  {
    id: 'HIRE_A_PERSON',
    slug: 'hire-a-person',
    name: 'Hire a Person',
    icon: '/hire-a-person-icon.png',
    childServices: [],
  },
  {
    id: 'LAUNDRY',
    slug: 'laundry',
    name: 'Laundry',
    icon: '/laundry-worker-icon.png',
    childServices: [
      'Home',
      'Hospital',
      'Hotel',
      'Commercial',
    ],
  },
  {
    id: 'SECURITY_BOUNCER',
    slug: 'security-bouncer',
    name: 'Security / Bouncer',
    icon: '/security-bouncer-icon.png',
    childServices: [],
  },
  {
    id: 'OTHER_SERVICES',
    slug: 'other-services',
    name: 'Other Services',
    icon: '/other-services-icon.png',
    childServices: [
      'Painter',
      'Event Organizer',
      'Suppliers',
    ],
  },
];

export function getSupplierQuickServiceBySlug(
  slug: string
) {
  return SUPPLIER_QUICK_SERVICE_CATEGORIES.find(
    (service) => service.slug === slug
  );
}