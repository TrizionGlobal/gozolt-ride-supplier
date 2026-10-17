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
      'Plumbing',
      'Carpenter',
      'Painter',
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

export function getQuickServiceIcon(
  category?: string,
  serviceTitle?: string
): string {
  const normCat = (category || '').toLowerCase().trim();
  const normTitle = (serviceTitle || '').toLowerCase().trim();

  // 1. Direct matching with SUPPLIER_QUICK_SERVICE_CATEGORIES by category ID/slug/name or child services
  for (const cat of SUPPLIER_QUICK_SERVICE_CATEGORIES) {
    if (
      cat.id.toLowerCase() === normCat ||
      cat.slug.toLowerCase() === normCat ||
      cat.name.toLowerCase() === normCat ||
      normCat.includes(cat.slug) ||
      normCat.includes(cat.name.toLowerCase())
    ) {
      return cat.icon;
    }

    if (
      cat.childServices.some(
        (child) =>
          child.toLowerCase() === normTitle ||
          normTitle.includes(child.toLowerCase()) ||
          child.toLowerCase().includes(normTitle)
      )
    ) {
      return cat.icon;
    }
  }

  // 2. Keyword fallback matching
  if (
    normCat.includes('home') ||
    normTitle.includes('clean') ||
    normTitle.includes('pest') ||
    normTitle.includes('garden') ||
    normTitle.includes('paint')
  ) {
    return '/home-service-icon.png';
  }
  if (
    normCat.includes('plumb') ||
    normTitle.includes('plumb') ||
    normCat.includes('carpenter') ||
    normTitle.includes('carpenter') ||
    normTitle.includes('carpentry')
  ) {
    return '/home-service-icon.png';
  }
  if (
    normCat.includes('pc') ||
    normCat.includes('mobile') ||
    normTitle.includes('mobile') ||
    normTitle.includes('phone') ||
    normTitle.includes('computer') ||
    normTitle.includes('laptop') ||
    normTitle.includes('printer') ||
    normTitle.includes('scanner')
  ) {
    return '/pc-mobile-repair-icon.png';
  }
  if (
    normCat.includes('mechanic') ||
    normTitle.includes('mechanic')
  ) {
    return '/vehicle-mechanic-icon.png';
  }
  if (
    normCat.includes('wash') ||
    normTitle.includes('wash')
  ) {
    return '/vehicle-wash-icon.png';
  }
  if (
    normCat.includes('electric') ||
    normTitle.includes('electric') ||
    normTitle.includes('lift') ||
    normTitle.includes('elevator')
  ) {
    return '/electrical-mechanic-icon.png';
  }
  if (
    normCat.includes('appliance') ||
    normTitle.includes('appliance')
  ) {
    return '/appliance-repair-icon.png';
  }
  if (
    normCat.includes('beauty') ||
    normCat.includes('wellness') ||
    normTitle.includes('beauty') ||
    normTitle.includes('wellness') ||
    normTitle.includes('massage') ||
    normTitle.includes('salon')
  ) {
    return '/beauty-wellness-icon.png';
  }
  if (
    normCat.includes('hire') ||
    normTitle.includes('hire') ||
    normTitle.includes('helper')
  ) {
    return '/hire-a-person-icon.png';
  }
  if (
    normCat.includes('laundry') ||
    normTitle.includes('laundry') ||
    normTitle.includes('iron')
  ) {
    return '/laundry-worker-icon.png';
  }
  if (
    normCat.includes('security') ||
    normCat.includes('bouncer') ||
    normTitle.includes('security') ||
    normTitle.includes('bouncer')
  ) {
    return '/security-bouncer-icon.png';
  }
  if (
    normCat.includes('other') ||
    normTitle.includes('event') ||
    normTitle.includes('organis') ||
    normTitle.includes('supplier')
  ) {
    return '/other-services-icon.png';
  }

  return '/quick-services-icon.png';
}