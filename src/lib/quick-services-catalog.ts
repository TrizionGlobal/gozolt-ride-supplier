import type {
  QuickService,
} from '@/types/quick-service-selection';

export const QUICK_SERVICES_CATALOG:
  QuickService[] = [
  {
    id: 'HOME_SERVICE',
    name: 'Home Service',
    description:
      'Cleaning, pest control and gardening services.',
    icon: '/home-service-icon.png',
    children: [
      {
        id: 'HOME_CLEANING',
        name: 'Home Cleaning',
      },
      {
        id: 'PEST_CONTROL',
        name: 'Pest Control',
      },
      {
        id: 'GARDENING',
        name: 'Gardening',
      },
    ],
  },
  {
    id: 'PC_MOBILE_REPAIR',
    name: 'PC / Mobile Repair',
    description:
      'Repairs for mobile phones, computers and office devices.',
    icon: '/pc-mobile-repair-icon.png',
    children: [
      {
        id: 'MOBILE_REPAIR',
        name: 'Mobile',
      },
      {
        id: 'LAPTOP_COMPUTER_REPAIR',
        name: 'Laptop / Computer',
      },
      {
        id: 'PRINTER_REPAIR',
        name: 'Printer',
      },
      {
        id: 'SCANNER_REPAIR',
        name: 'Scanner',
      },
    ],
  },
  {
    id: 'PLUMBING_CARPENTRY',
    name: 'Plumbing / Carpentry',
    description:
      'Professional plumbing and carpentry services.',
    icon: '/plumbing-carpentry-icon.png',
    children: [
      {
        id: 'PLUMBING',
        name: 'Plumbing',
      },
      {
        id: 'CARPENTRY',
        name: 'Carpentry',
      },
    ],
  },
  {
    id: 'VEHICLE_MECHANIC',
    name: 'Vehicle Mechanic',
    description:
      'Mechanical services for different vehicle types.',
    icon: '/vehicle-mechanic-icon.png',
    children: [
      {
        id: 'CAR_MECHANIC',
        name: 'Car',
      },
      {
        id: 'BIKE_MECHANIC',
        name: 'Bike',
      },
      {
        id: 'TRUCK_MECHANIC',
        name: 'Truck',
      },
    ],
  },
  {
    id: 'VEHICLE_WASH',
    name: 'Vehicle Wash',
    description:
      'Professional washing services for vehicles.',
    icon: '/vehicle-wash-icon.png',
    children: [
      {
        id: 'CAR_WASH',
        name: 'Car',
      },
      {
        id: 'BIKE_WASH',
        name: 'Bike',
      },
      {
        id: 'TRUCK_WASH',
        name: 'Truck',
      },
    ],
  },
  {
    id: 'ELECTRICAL_MECHANIC',
    name: 'Electrical Mechanic',
    description:
      'Electrical support for homes and lifts.',
    icon: '/electrical-mechanic-icon.png',
    children: [
      {
        id: 'HOME_ELECTRICIAN',
        name: 'Home',
      },
      {
        id: 'LIFT_ELECTRICIAN',
        name: 'Lift',
      },
    ],
  },
  {
    id: 'APPLIANCE_REPAIR',
    name: 'Appliance Repair',
    description:
      'Repair and maintenance of household appliances.',
    icon: '/appliance-repair-icon.png',
    children: [],
  },
  {
    id: 'BEAUTY_WELLNESS',
    name: 'Beauty / Wellness',
    description:
      'Professional beauty and wellness services.',
    icon: '/beauty-wellness-icon.png',
    children: [],
  },
  {
    id: 'HIRE_A_PERSON',
    name: 'Hire a Person',
    description:
      'Hire skilled people for temporary work and assistance.',
    icon: '/hire-a-person-icon.png',
    children: [],
  },
  {
    id: 'LAUNDRY_WORKER',
    name: 'Laundry Worker',
    description:
      'Laundry services for domestic and commercial needs.',
    icon: '/laundry-worker-icon.png',
    children: [
      {
        id: 'HOME_LAUNDRY',
        name: 'Home',
      },
      {
        id: 'HOSPITAL_LAUNDRY',
        name: 'Hospital',
      },
      {
        id: 'HOTEL_LAUNDRY',
        name: 'Hotel',
      },
      {
        id: 'COMMERCIAL_LAUNDRY',
        name: 'Commercial',
      },
    ],
  },
  {
    id: 'SECURITY_BOUNCER',
    name: 'Security / Bouncer',
    description:
      'Security personnel for properties, venues and events.',
    icon: '/security-bouncer-icon.png',
    children: [],
  },
  {
    id: 'OTHER_SERVICES',
    name: 'Other Services',
    description:
      'Additional professional and event-related services.',
    icon: '/other-services-icon.png',
    children: [
      {
        id: 'PAINTER',
        name: 'Painter',
      },
      {
        id: 'EVENT_ORGANIZER',
        name: 'Event Organizer',
      },
      {
        id: 'SUPPLIERS',
        name: 'Suppliers',
      },
    ],
  },
];