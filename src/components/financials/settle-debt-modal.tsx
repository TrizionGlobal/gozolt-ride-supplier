import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { financialService } from '@/services/financials/financial.service';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: {
    id: string;
    name: string;
    balance: number;
  } | null;
  onSuccess: () => void;
}

export function SettleDebtModal({ isOpen, onClose, driver, onSuccess }: SettleDebtModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize amount to the exact debt (absolute value) when modal opens
  if (driver && amount === '' && driver.balance < 0) {
    setAmount(Math.abs(driver.balance).toFixed(2));
  }

  const handleSettle = async () => {
    if (!driver) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialService.settleDriverDebt(driver.id, parsedAmount, notes);
      toast.success(`Successfully recorded receipt of €${parsedAmount.toFixed(2)} from ${driver.name}`);
      onSuccess();
      onClose();
      setAmount('');
      setNotes('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to settle debt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const debtAmount = driver ? Math.abs(driver.balance) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-[#27272A] bg-[#0A0A0A] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Receive Cash (Settle Debt)</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Record cash received from the driver to settle their negative balance.
          </DialogDescription>
        </DialogHeader>

        {driver && (
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#111111] p-3">
              <span className="text-sm font-medium text-[#A1A1AA]">Driver</span>
              <span className="text-sm font-semibold text-white">{driver.name}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-900/30 bg-red-500/10 p-3">
              <span className="text-sm font-medium text-red-400">Amount Owed to You</span>
              <span className="text-sm font-bold text-red-400">€{debtAmount.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-[#A1A1AA]">
                Cash Received (€)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-[#27272A] bg-[#111111] text-white"
                placeholder="Enter amount"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-[#A1A1AA]">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-[#27272A] bg-[#111111] text-white"
                placeholder="e.g. End of week cash settlement"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#27272A] bg-transparent text-white hover:bg-[#27272A] hover:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSettle}
            disabled={isSubmitting || !amount}
            className="bg-[#FACC15] text-black hover:bg-[#EAB308]"
          >
            {isSubmitting ? 'Recording...' : 'Record Cash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
