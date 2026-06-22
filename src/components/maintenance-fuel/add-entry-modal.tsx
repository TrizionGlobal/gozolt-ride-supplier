'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { maintenanceFuelService } from '@/services/maintenance-fuel/maintenance-fuel.service';

type TabType = 'maintenance' | 'fuel';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  activeTab: TabType;
}

export function AddEntryModal({ isOpen, onClose, onAdded, activeTab }: AddEntryModalProps) {
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maintenance fields
  const [maintType, setMaintType] = useState('');
  const [maintCustomType, setMaintCustomType] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintMileage, setMaintMileage] = useState('');
  const [maintCost, setMaintCost] = useState('');
  const [maintDescription, setMaintDescription] = useState('');
  const [maintNextDue, setMaintNextDue] = useState('');

  // Fuel fields
  const [fuelDate, setFuelDate] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    maintenanceFuelService.getVehiclesList().then(setVehicles);
  }, [isOpen]);

  useEffect(() => {
    // Reset form on open
    setSelectedVehicle('');
    const today = new Date().toISOString().split('T')[0];
    setMaintType('');
    setMaintCustomType('');
    setMaintDate(today);
    setMaintMileage('');
    setMaintCost('');
    setMaintDescription('');
    setMaintNextDue('');
    setFuelDate(today);
    setFuelLiters('');
    setFuelCost('');
    setFuelOdometer('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'maintenance') {
        const finalType = maintType === 'Other' ? maintCustomType : maintType;
        if (!finalType || !maintDate) {
          toast.error('Please fill in required fields');
          setIsSubmitting(false);
          return;
        }
        await maintenanceFuelService.addMaintenanceEntry(selectedVehicle, {
          type: finalType,
          performedAt: new Date(maintDate).toISOString(),
          cost: maintCost ? Number(maintCost) : undefined,
          odometer: maintMileage ? Number(maintMileage) : undefined,
          description: maintDescription || undefined,
          nextDueAt: maintNextDue ? new Date(maintNextDue).toISOString() : undefined,
        });
        toast.success('Maintenance entry added');
      } else {
        if (!fuelDate || !fuelLiters || !fuelCost) {
          toast.error('Please fill in required fields');
          setIsSubmitting(false);
          return;
        }
        await maintenanceFuelService.addFuelEntry(selectedVehicle, {
          liters: Number(fuelLiters),
          cost: Number(fuelCost),
          odometer: fuelOdometer ? Number(fuelOdometer) : undefined,
          filledAt: new Date(fuelDate).toISOString(),
        });
        toast.success('Fuel entry added');
      }
      onAdded();
      onClose();
    } catch {
      toast.error('Failed to add entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none';
  const labelCls = 'mb-1.5 block text-sm text-[#D4D4D8]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative mx-4 w-full max-w-[500px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-bold text-white">
          {activeTab === 'maintenance' ? 'Add Maintenance Entry' : 'Add Fuel Entry'}
        </h2>

        {/* Vehicle dropdown */}
        <div className="mb-4">
          <label className={labelCls}>Vehicle *</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            <option value="">Choose a vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.plate}</option>
            ))}
          </select>
        </div>

        {activeTab === 'maintenance' ? (
          <>
            <div className="mb-4">
              <label className={labelCls}>Type *</label>
              <select
                value={maintType}
                onChange={(e) => setMaintType(e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">Select type...</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                <option value="Engine Service">Engine Service</option>
                <option value="General Inspection">General Inspection</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {maintType === 'Other' && (
              <div className="mb-4">
                <label className={labelCls}>Specify Type *</label>
                <input
                  type="text"
                  value={maintCustomType}
                  onChange={(e) => setMaintCustomType(e.target.value)}
                  placeholder="e.g. Battery Replacement"
                  className={inputCls}
                />
              </div>
            )}
            <div className="mb-4">
              <label className={labelCls}>Date *</label>
              <input type="date" value={maintDate} onChange={(e) => setMaintDate(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Mileage (Km)</label>
                <input type="number" value={maintMileage} onChange={(e) => setMaintMileage(e.target.value)} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cost (€)</label>
                <input type="number" value={maintCost} onChange={(e) => setMaintCost(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Description</label>
              <textarea value={maintDescription} onChange={(e) => setMaintDescription(e.target.value)} rows={2} className={inputCls} />
            </div>
            <div className="mb-6">
              <label className={labelCls}>Next Due Date</label>
              <input type="date" value={maintNextDue} onChange={(e) => setMaintNextDue(e.target.value)} className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className={labelCls}>Date *</label>
              <input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Liters *</label>
                <input type="number" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cost (€) *</label>
                <input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelCls}>Odometer (Km)</label>
              <input type="number" value={fuelOdometer} onChange={(e) => setFuelOdometer(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-[#27272A] py-2.5 text-sm font-medium text-white hover:bg-[#3F3F46] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
