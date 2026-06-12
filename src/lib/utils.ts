import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount?: number | string | null): string {
  const num = Number(amount);
  if (amount == null || isNaN(num)) return '€0.00';
  return `€${num.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatDocumentType(type: string): string {
  const map: Record<string, string> = {
    COMPANY_REGISTRATION: 'Business Registration',
    VAT_CERTIFICATE: 'VAT Certificate',
    INSURANCE: 'Insurance Policy',
    TAXI_LICENSE: 'TM License',
    OPERATOR_LICENSE: 'Operator License',
    DRIVING_LICENSE: 'Driving License',
    VEHICLE_REGISTRATION: 'Registration',
    ROADWORTHINESS: 'Roadworthiness',
    POLICE_CLEARANCE: 'Police Clearance',
    PUBLIC_LIABILITY_INSURANCE: 'Public Liability Insurance',
    VAT_REGISTRATION: 'VAT Registration',
    ID_CARD: 'ID Card',
    PROFILE_PHOTO: 'Profile Photo',
    VEHICLE_PHOTO_FRONT: 'Photo (Front)',
    VEHICLE_PHOTO_BACK: 'Photo (Back)',
    VEHICLE_PHOTO_SIDE: 'Photo (Side)',
    VEHICLE_PHOTO_INTERIOR: 'Photo (Interior)',
    VEHICLE_PHOTO_INTERIOR_2: 'Interior Photo (additional)',
  };
  return map[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
