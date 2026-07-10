'use client';

import { useState } from 'react';
import { X, Euro, Info, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { financialService } from '@/services/financials/financial.service';
import { useAuthStore } from '@/stores/auth.store';

interface PayDriverModalProps {
  driverId: string;
  driverName: string;
  vehicleType?: string | null;
  availableBalance: number;
  userCancellationFees: number;
  totalRides: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayDriverModal({
  driverId,
  driverName,
  vehicleType,
  availableBalance,
  userCancellationFees,
  totalRides: initialTotalRides,
  onClose,
  onSuccess,
}: PayDriverModalProps) {
  const { user } = useAuthStore();
  const globalCommRate = user?.defaultDriverCommission || 0;
  
  const defaultCommRate = globalCommRate;
  
  // Calculate combined total: Owed Balance + User Cancellation Fees
  const combinedTotal = availableBalance + userCancellationFees;

  // Calculate default deduction and amount based on rate
  const defaultDeduction = (combinedTotal * defaultCommRate) / 100;
  const defaultAmount = combinedTotal - defaultDeduction;

  const [amount, setAmount] = useState<string>(defaultAmount > 0 ? defaultAmount.toFixed(2) : '0');
  const [deductions, setDeductions] = useState<string>(defaultDeduction > 0 ? defaultDeduction.toFixed(2) : '0');
  const [totalRides, setTotalRides] = useState<string>(initialTotalRides > 0 ? initialTotalRides.toString() : '0');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ amount: number, remaining: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const numDeductions = parseFloat(deductions) || 0;
  const numTotalRides = parseInt(totalRides) || undefined;
  const totalDeducted = numAmount + numDeductions;
  const remainingBalance = combinedTotal - totalDeducted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (numAmount <= 0 && numDeductions <= 0) {
      setErrorMsg('Total payout and deductions cannot both be zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialService.payDriver(driverId, numAmount, numDeductions, numTotalRides, undefined, notes);
      setSuccessDetails({ amount: numAmount, remaining: remainingBalance });
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || 'Failed to record payout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] shadow-2xl p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 mb-4">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-[#A1A1AA] mb-6 text-sm leading-relaxed">
            You have successfully recorded a payout of <span className="text-white font-medium">{formatCurrency(successDetails.amount)}</span> to <strong>{driverName}</strong>. An email receipt has been sent to your registered email address.
          </p>
          <div className="rounded-lg border border-[#27272A] bg-[#1A1A1A] p-4 text-left mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#A1A1AA]">Remaining Owed Balance</span>
              <span className="font-medium text-white">{formatCurrency(successDetails.remaining)}</span>
            </div>
          </div>
          <button
            onClick={onSuccess}
            className="w-full rounded-lg bg-[#FACC15] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
          >
            Close & Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272A] p-4">
          <h2 className="text-lg font-semibold text-white">Pay Driver</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="rounded-lg border border-[#27272A] bg-[#1A1A1A] p-3 text-sm">
            <div className="flex justify-between text-[#A1A1AA] mb-1">
              <span>Driver:</span>
              <span className="font-medium text-white">{driverName}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA] mb-1">
              <span>Ride Owed Balance:</span>
              <span className="font-medium text-white">{formatCurrency(availableBalance)}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA] mb-1">
              <span>User Cancellation Fees:</span>
              <span className="font-medium text-white">{formatCurrency(userCancellationFees)}</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA] pt-1 border-t border-[#27272A]">
              <span>Total Available Balance:</span>
              <span className="font-medium text-green-400">{formatCurrency(combinedTotal)}</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
              Payment Amount (To Driver)
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                readOnly
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A]/50 pl-9 py-2 text-[#A1A1AA] cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#A1A1AA]">
              Supplier Commission / Deductions (To You)
              {defaultCommRate > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs bg-[#FACC15]/20 text-[#FACC15]">
                  {defaultCommRate}% Default
                </span>
              )}
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={deductions}
                readOnly
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A]/50 pl-9 py-2 text-[#A1A1AA] cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>



          {remainingBalance > 0 && totalDeducted <= combinedTotal && (
            <div className="text-xs text-[#71717A] italic text-right">
              {formatCurrency(remainingBalance)} will remain in Owed Balance
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
              Total Rides
            </label>
            <input
              type="number"
              min="0"
              value={totalRides}
              readOnly
              className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A]/50 px-3 py-2 text-[#A1A1AA] cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vehicle rental fee deducted"
              className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder:text-[#52525B] focus:border-[#FACC15] focus:outline-none min-h-[60px]"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] disabled:opacity-50 transition-colors flex items-center"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
