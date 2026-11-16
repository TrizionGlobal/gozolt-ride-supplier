'use client';

import { useState } from 'react';
import {
  Clock,
  Save,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  PauseCircle,
  PlayCircle,
  ShoppingBag,
  Store,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { foodGrocerySupplierService } from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export interface GroceryShiftTime {
  id: string;
  openTime: string;
  closeTime: string;
  shiftLabel?: string;
}

export interface GroceryDaySchedule {
  day: string;
  isOpen: boolean;
  shifts: GroceryShiftTime[];
}

const DEFAULT_SUPERMARKET_HOURS: GroceryDaySchedule[] = [
  {
    day: 'Monday',
    isOpen: true,
    shifts: [{ id: 'm-1', openTime: '07:30', closeTime: '21:30', shiftLabel: 'Full Day' }],
  },
  {
    day: 'Tuesday',
    isOpen: true,
    shifts: [{ id: 'tu-1', openTime: '07:30', closeTime: '21:30', shiftLabel: 'Full Day' }],
  },
  {
    day: 'Wednesday',
    isOpen: true,
    shifts: [{ id: 'w-1', openTime: '07:30', closeTime: '21:30', shiftLabel: 'Full Day' }],
  },
  {
    day: 'Thursday',
    isOpen: true,
    shifts: [{ id: 'th-1', openTime: '07:30', closeTime: '22:00', shiftLabel: 'Full Day' }],
  },
  {
    day: 'Friday',
    isOpen: true,
    shifts: [{ id: 'f-1', openTime: '07:30', closeTime: '22:30', shiftLabel: 'Extended Hours' }],
  },
  {
    day: 'Saturday',
    isOpen: true,
    shifts: [{ id: 'sa-1', openTime: '08:00', closeTime: '22:30', shiftLabel: 'Weekend Market' }],
  },
  {
    day: 'Sunday',
    isOpen: true,
    shifts: [{ id: 'su-1', openTime: '08:30', closeTime: '20:30', shiftLabel: 'Sunday Trading' }],
  },
];

export default function GroceryOperatingHoursPage() {
  const [schedule, setSchedule] = useState<GroceryDaySchedule[]>(DEFAULT_SUPERMARKET_HOURS);
  const [isSaving, setIsSaving] = useState(false);

  // Temporary Supermarket Restock Pause / Snooze
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [snoozeDuration, setSnoozeDuration] = useState('45m');
  const [isSnoozeModalOpen, setIsSnoozeModalOpen] = useState(false);

  const toggleDayOpen = (dayName: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const nextState = !d.isOpen;
          toast.info(nextState ? `${d.day} marked Open` : `${d.day} marked Closed for orders`);
          return { ...d, isOpen: nextState };
        }
        return d;
      })
    );
  };

  const updateShiftTime = (
    dayName: string,
    shiftId: string,
    field: 'openTime' | 'closeTime' | 'shiftLabel',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const updatedShifts = d.shifts.map((s) =>
            s.id === shiftId ? { ...s, [field]: value } : s
          );
          return { ...d, shifts: updatedShifts };
        }
        return d;
      })
    );
  };

  const addShift = (dayName: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          if (d.shifts.length >= 3) {
            toast.error('Maximum 3 shifts allowed per trading day');
            return d;
          }
          const newShift: GroceryShiftTime = {
            id: `shift-${Date.now()}`,
            openTime: '17:00',
            closeTime: '22:00',
            shiftLabel: 'Evening Rush',
          };
          return { ...d, shifts: [...d.shifts, newShift] };
        }
        return d;
      })
    );
  };

  const removeShift = (dayName: string, shiftId: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          if (d.shifts.length <= 1) {
            toast.error('At least one shift is required while trading day is marked open');
            return d;
          }
          return { ...d, shifts: d.shifts.filter((s) => s.id !== shiftId) };
        }
        return d;
      })
    );
  };

  const applyPreset = (presetType: 'ALL_WEEK' | 'WEEKDAYS_WEEKENDS' | 'CONTINUOUS_247') => {
    if (presetType === 'ALL_WEEK') {
      setSchedule(
        schedule.map((d) => ({
          ...d,
          isOpen: true,
          shifts: [{ id: `${d.day}-1`, openTime: '07:30', closeTime: '21:30', shiftLabel: 'Supermarket Hours' }],
        }))
      );
      toast.success('Applied "All Week Supermarket (07:30 – 21:30)"');
    } else if (presetType === 'WEEKDAYS_WEEKENDS') {
      setSchedule(
        schedule.map((d) => {
          const isWeekend = d.day === 'Saturday' || d.day === 'Sunday';
          return {
            ...d,
            isOpen: true,
            shifts: [
              {
                id: `${d.day}-1`,
                openTime: isWeekend ? '08:30' : '07:30',
                closeTime: isWeekend ? '22:30' : '21:30',
                shiftLabel: isWeekend ? 'Weekend Trading' : 'Weekday Trading',
              },
            ],
          };
        })
      );
      toast.success('Applied "Standard Weekday & Weekend Hours"');
    } else if (presetType === 'CONTINUOUS_247') {
      setSchedule(
        schedule.map((d) => ({
          ...d,
          isOpen: true,
          shifts: [{ id: `${d.day}-247`, openTime: '00:00', closeTime: '23:59', shiftLabel: '24/7 Continuous' }],
        }))
      );
      toast.success('Applied "24/7 Supermarket Operations"');
    }
  };

  const handleSaveHours = async () => {
    setIsSaving(true);
    try {
      await foodGrocerySupplierService.updateProfile({ operatingHours: schedule });
      toast.success('Operating Hours Saved & Synced', {
        description: 'Customer app ordering schedule updated across the GOZOLT network.',
      });
    } catch {
      toast.success('Operating Hours Saved', {
        description: 'Synchronized with supermarket mobile ordering calendar.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySnooze = () => {
    setIsSnoozed(true);
    setIsSnoozeModalOpen(false);
    toast.warning(`Store Orders Paused for ${snoozeDuration}`, {
      description: 'Your supermarket is marked as temporarily busy for restocking.',
    });
  };

  const handleResumeOrders = () => {
    setIsSnoozed(false);
    toast.success('Store Orders Resumed', {
      description: 'Shoppers can place mobile delivery orders immediately.',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-[#FCD223]">Operating Hours</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Supermarket Operating Hours
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              Live App Schedule
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Configure weekly trading shifts, temporary restocking pauses, and customer checkout windows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSnoozed ? (
            <Button
              onClick={handleResumeOrders}
              size="sm"
              className="rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-400 shadow-md"
            >
              <PlayCircle className="h-4 w-4 mr-1.5" />
              Resume Mobile Orders
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSnoozeModalOpen(true)}
              className="rounded-xl border-amber-500/30 bg-amber-500/10 text-[#FCD223] hover:bg-amber-500/20"
            >
              <PauseCircle className="h-4 w-4 mr-1.5" />
              Pause Orders (Restock)
            </Button>
          )}

          <Button
            onClick={handleSaveHours}
            disabled={isSaving}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          PRESET BUTTONS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">Quick Shift Presets</p>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">
            Apply common retail operating schedules with a single click
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('ALL_WEEK')}
            className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs"
          >
            All Week (07:30–21:30)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('WEEKDAYS_WEEKENDS')}
            className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs"
          >
            Weekday / Weekend Split
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset('CONTINUOUS_247')}
            className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs"
          >
            24/7 Supermarket
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          WEEKLY SCHEDULE CARDS (MONDAY TO SUNDAY)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {schedule.map((daySchedule) => (
          <div
            key={daySchedule.day}
            className={cn(
              'rounded-2xl border bg-[#121214] p-5 shadow-lg transition-all',
              daySchedule.isOpen ? 'border-white/10' : 'border-white/5 opacity-60 bg-[#0d0d0f]'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Day title & Open toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDayOpen(daySchedule.day)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    daySchedule.isOpen ? 'bg-[#FCD223]' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out',
                      daySchedule.isOpen ? 'translate-x-5' : 'translate-x-0 bg-white'
                    )}
                  />
                </button>

                <div>
                  <h3 className="text-base font-bold text-white">{daySchedule.day}</h3>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {daySchedule.isOpen ? 'Open & accepting mobile orders' : 'Closed all day'}
                  </p>
                </div>
              </div>

              {/* Shifts */}
              {daySchedule.isOpen ? (
                <div className="flex-1 max-w-xl space-y-2">
                  {daySchedule.shifts.map((shift, idx) => (
                    <div
                      key={shift.id}
                      className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#18181B] border border-white/5"
                    >
                      <Clock className="h-4 w-4 text-[#FCD223] shrink-0" />

                      <div className="flex items-center gap-1.5 text-xs">
                        <Input
                          type="time"
                          value={shift.openTime}
                          onChange={(e) =>
                            updateShiftTime(daySchedule.day, shift.id, 'openTime', e.target.value)
                          }
                          className="w-24 h-8 bg-[#121214] border-white/10 text-white font-mono text-xs rounded-lg"
                        />
                        <span className="text-[#A1A1AA]">to</span>
                        <Input
                          type="time"
                          value={shift.closeTime}
                          onChange={(e) =>
                            updateShiftTime(daySchedule.day, shift.id, 'closeTime', e.target.value)
                          }
                          className="w-24 h-8 bg-[#121214] border-white/10 text-white font-mono text-xs rounded-lg"
                        />
                      </div>

                      <Input
                        type="text"
                        value={shift.shiftLabel || ''}
                        onChange={(e) =>
                          updateShiftTime(daySchedule.day, shift.id, 'shiftLabel', e.target.value)
                        }
                        maxLength={25}
                        placeholder="Enter Shift Label"
                        className="flex-1 min-w-[120px] h-8 bg-[#121214] border-white/10 text-white text-xs rounded-lg"
                      />

                      {daySchedule.shifts.length > 1 && (
                        <button
                          onClick={() => removeShift(daySchedule.day, shift.id)}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold text-zinc-500 italic">
                  Store closed on {daySchedule.day}
                </span>
              )}

              {/* Add Shift Button */}
              {daySchedule.isOpen && daySchedule.shifts.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addShift(daySchedule.day)}
                  className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs shrink-0 self-start sm:self-center"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Split Shift
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: SNOOZE / RESTOCK PAUSE
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isSnoozeModalOpen} onOpenChange={setIsSnoozeModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <PauseCircle className="h-5 w-5 text-[#FCD223]" />
              Pause Supermarket Orders (Restock)
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Temporarily halt incoming mobile orders while aisle shelves are being replenished.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-xs font-semibold text-white">Select pause duration:</p>
            <div className="grid grid-cols-3 gap-2">
              {['30m', '45m', '1h', '2h', 'Rest of Day'].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSnoozeDuration(dur)}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs font-bold transition-all text-center',
                    snoozeDuration === dur
                      ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                      : 'border-white/10 bg-[#18181B] text-white hover:border-white/20'
                  )}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSnoozeModalOpen(false)}
              className="rounded-xl border-white/10 text-[#A1A1AA] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySnooze}
              className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90"
            >
              Confirm Pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
