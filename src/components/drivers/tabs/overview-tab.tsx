'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, HandCoins, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { driverService } from '@/services/drivers/driver.service';
import { financialService } from '@/services/financials/financial.service';
import { PhoneInput } from '@/components/ui/phone-input';
import type { Driver, PerDriverEarning } from '@/types';
import { DriverStatus } from '@/types';

interface OverviewTabProps {
  driver: Driver;
  vehicle?: string;
  onUpdate?: (updatedDriver: Partial<Driver>) => void;
}

const statusStyles: Record<string, { text: string; label: string }> = {
  [DriverStatus.NEW_DRIVER]: { text: 'text-blue-400', label: 'New Driver' },
  [DriverStatus.SUPPLIER_APPROVED]: { text: 'text-yellow-400', label: 'Admin Pending' },
  [DriverStatus.SUPPLIER_SUSPENDED]: { text: 'text-red-400', label: 'Supplier Suspended' },
  [DriverStatus.ADMIN_APPROVED]: { text: 'text-yellow-400', label: 'Needs Vehicle' },
  [DriverStatus.ADMIN_SUSPENDED]: { text: 'text-red-400', label: 'Admin Suspended' },
  [DriverStatus.VEHICLE_ASSIGNED]: { text: 'text-blue-400', label: 'Vehicle Assigned' },
  [DriverStatus.ACTIVE]: { text: 'text-green-400', label: 'Active' },
  [DriverStatus.SUSPENDED]: { text: 'text-red-400', label: 'Suspended' },
};

export function OverviewTab({ driver, vehicle, onUpdate }: OverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: driver.firstName,
    lastName: driver.lastName,
    phone: driver.phone,
    email: driver.email || '',
  });

  const style = statusStyles[driver.status] || statusStyles[DriverStatus.ACTIVE];

  const [earnings, setEarnings] = useState<PerDriverEarning | null>(null);

  useEffect(() => {
    async function loadEarnings() {
      const data = await financialService.getPerDriverEarnings();
      const driverEarnings = data.find(d => d.driverId === driver.id) || {
        driverId: driver.id,
        driverName: driver.firstName + ' ' + driver.lastName,
        totalEarnings: 0,
        totalTips: 0,
        totalPaidOut: 0,
        availableBalance: 0,
        cardEarnings: 0,
        cashEarnings: 0,
        tipEarnings: 0,
        tipCount: 0,
        ridesCompleted: driver.totalRides || 0,
      };
      setEarnings(driverEarnings);
    }
    loadEarnings();
  }, [driver]);

  const handleSave = async () => {
    const phoneMatch = formData.phone?.match(/^(\+\d{1,4})\s?(.*)$/);
    const phoneNational = phoneMatch ? phoneMatch[2] : formData.phone;
    if (!phoneNational || phoneNational.trim() === '') {
      toast.error('Phone number is required');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]+/g, '');
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Invalid phone number format');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...formData, phone: cleanPhone };
      const updated = await driverService.updateDriver(driver.id, payload);
      onUpdate?.(updated);
      toast.success('Driver details updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update driver details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Driver Details */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setFormData({
                    firstName: driver.firstName,
                    lastName: driver.lastName,
                    phone: driver.phone,
                    email: driver.email || '',
                  });
                  setIsEditing(false);
                }}
                className="flex items-center justify-center rounded-md p-2 text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center rounded-md bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center rounded-md p-2 text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 pt-2">
          <div>
            <p className="text-xs text-[#71717A]">First Name</p>
            {isEditing ? (
              <input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 w-full rounded-md border border-[#3F3F46] bg-[#0A0A0A] px-3 py-1.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-white">{driver.firstName}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Last Name</p>
            {isEditing ? (
              <input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 w-full rounded-md border border-[#3F3F46] bg-[#0A0A0A] px-3 py-1.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-white">{driver.lastName}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Phone</p>
            {isEditing ? (
              <PhoneInput
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
                placeholder="Enter Mobile Number"
                className="!border-[#3F3F46] mt-1"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-white">{driver.phone}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Email</p>
            {isEditing ? (
              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-[#3F3F46] bg-[#0A0A0A] px-3 py-1.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-white">{driver.email || '—'}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Driver ID</p>
            <p className="mt-1 text-sm font-medium text-white">{driver.driverId}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Status</p>
            <p className={`mt-1 text-sm font-medium ${style.text}`}>{style.label}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Vehicle</p>
            <p className="mt-1 text-sm font-medium text-white">{vehicle || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Total Rides</p>
            <p className="mt-1 text-sm font-medium text-white">{driver.totalRides}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Rating</p>
            <p className="mt-1 text-sm font-medium text-white">{driver.avgRating}</p>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      {earnings ? (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Earnings Breakdown (MTD)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
                  <DollarSign className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <p className="text-xs text-[#A1A1AA]">Total Earnings</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(earnings.totalEarnings)}</p>
            </div>
            <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0EA5E9]/20">
                  <TrendingUp className="h-4 w-4 text-[#0EA5E9]" />
                </div>
                <p className="text-xs text-[#A1A1AA]">Card Earnings</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(earnings.cardEarnings)}</p>
            </div>
            <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                  <HandCoins className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-xs text-[#A1A1AA]">Tips Earned</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-400">{formatCurrency(earnings.tipEarnings)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#71717A]">Cash Earnings</p>
              <p className="mt-1 text-sm font-medium text-white">{formatCurrency(earnings.cashEarnings)}</p>
            </div>
            <div>
              <p className="text-xs text-[#71717A]">Rides Completed</p>
              <p className="mt-1 text-sm font-medium text-white">{earnings.ridesCompleted}</p>
            </div>
            <div>
              <p className="text-xs text-[#71717A]">Tip Count</p>
              <p className="mt-1 text-sm font-medium text-white">{earnings.tipCount}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6 text-center text-[#71717A]">
          Loading earnings...
        </div>
      )}
    </div>
  );
}
