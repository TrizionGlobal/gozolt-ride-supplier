import type { QuickService } from '@/types/quick-service-selection';

export const QUICK_SERVICES_CATALOG: QuickService[] = [
  {
    id: 'HOME_SERVICE',
    name: 'Home Services',
    description: 'Cleaning, pest control, gardening, plumbing and carpentry services.',
    icon: '/home-service-icon.png',
    children: [
      { id: 'HOME_CLEANING', name: 'Home Cleaning' },
      { id: 'PEST_CONTROL', name: 'Pest Control' },
      { id: 'GARDENING', name: 'Gardening' },
      { id: 'PLUMBING', name: 'Plumbing' },
      { id: 'CARPENTER', name: 'Carpenter' },
    ],
  },
  {
    id: 'PC_MOBILE_REPAIR',
    name: 'PC & Mobile Repair',
    description: 'Repairs for mobile phones, computers and office devices.',
    icon: '/pc-mobile-repair-icon.png',
    children: [
      { id: 'MOBILE', name: 'Mobile' },
      { id: 'LAPTOP_COMPUTER', name: 'Laptop/Computer' },
      { id: 'PRINTER_SCANNER', name: 'Printer / Scanner' },
    ],
  },
  {
    id: 'VEHICLE_MECHANIC',
    name: 'Vehicle Mechanic',
    description: 'Mechanical services for different vehicle types.',
    icon: '/vehicle-mechanic-icon.png',
    children: [
      { id: 'CAR_MECHANIC', name: 'Car' },
      { id: 'BIKE_MECHANIC', name: 'Bike' },
      { id: 'TRUCK_MECHANIC', name: 'Truck' },
    ],
  },
  {
    id: 'VEHICLE_WASH',
    name: 'Vehicle Wash',
    description: 'Professional washing services for vehicles.',
    icon: '/vehicle-wash-icon.png',
    children: [
      { id: 'CAR_WASH', name: 'Car' },
      { id: 'BIKE_WASH', name: 'Bike' },
      { id: 'TRUCK_WASH', name: 'Truck' },
    ],
  },
  {
    id: 'ELECTRICAL_REPAIR',
    name: 'Electrical Repair',
    description: 'Electrical support for homes, commercial and events.',
    icon: '/electrical-mechanic-icon.png',
    children: [
      { id: 'HOME_ELECTRICIAN', name: 'Home' },
      { id: 'COMMERCIAL_ELECTRICIAN', name: 'Commercial' },
      { id: 'EVENTS_ELECTRICIAN', name: 'Events' },
    ],
  },
  {
    id: 'APPLIANCE_REPAIR',
    name: 'Appliance Repair',
    description: 'Repair and maintenance of household appliances.',
    icon: '/appliance-repair-icon.png',
    children: [],
  },
  {
    id: 'BEAUTICIAN_WELLNESS',
    name: 'Beautician /Wellness',
    description: 'Professional beauty and wellness services.',
    icon: '/beauty-wellness-icon.png',
    children: [
      { id: 'MALE', name: 'Male' },
      { id: 'FEMALE', name: 'Female' },
      { id: 'KIDS', name: 'Kids' },
      { id: 'OTHERS_WELLNESS', name: 'Others' },
    ],
  },
  {
    id: 'LAUNDRY',
    name: 'Laundry',
    description: 'Laundry services for domestic and commercial needs.',
    icon: '/laundry-worker-icon.png',
    children: [
      { id: 'HOME_LAUNDRY', name: 'Home' },
      { id: 'HOSPITAL_LAUNDRY', name: 'Hospital' },
      { id: 'HOTEL_LAUNDRY', name: 'Hotel' },
      { id: 'COMMERCIALS_LAUNDRY', name: 'Commercials' },
    ],
  },
  {
    id: 'HIRE_A_PERSON',
    name: 'Hire a Person',
    description: 'Hire skilled people for temporary work and assistance.',
    icon: '/hire-a-person-icon.png',
    children: [],
  },
  {
    id: 'SECURITY_BOUNCER',
    name: 'Security/Bouncer',
    description: 'Security personnel for properties, venues and events.',
    icon: '/security-bouncer-icon.png',
    children: [],
  },
  {
    id: 'OTHER_SERVICES',
    name: 'Other Services',
    description: 'Additional professional and event-related services.',
    icon: '/other-services-icon.png',
    children: [
      { id: 'PAINTER', name: 'Painter' },
      { id: 'EVENT_ORGANISERS', name: 'Event Organisers' },
      { id: 'SUPPLIERS', name: 'Suppliers' },
    ],
  },
];