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

export interface ShiftTime {
  id: string;
  openTime: string;
  closeTime: string;
  shiftLabel?: string;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  shifts: ShiftTime[];
}

const INITIAL_HOURS: DaySchedule[] = [
  {
    day: 'Monday',
    isOpen: true,
    shifts: [{ id: 'm-1', openTime: '11:00', closeTime: '23:00', shiftLabel: 'All Day' }],
  },
  {
    day: 'Tuesday',
    isOpen: true,
    shifts: [{ id: 'tu-1', openTime: '11:00', closeTime: '23:00', shiftLabel: 'All Day' }],
  },
  {
    day: 'Wednesday',
    isOpen: true,
    shifts: [{ id: 'w-1', openTime: '11:00', closeTime: '23:00', shiftLabel: 'All Day' }],
  },
  {
    day: 'Thursday',
    isOpen: true,
    shifts: [{ id: 'th-1', openTime: '11:00', closeTime: '23:30', shiftLabel: 'All Day' }],
  },
  {
    day: 'Friday',
    isOpen: true,
    shifts: [
      { id: 'f-1', openTime: '11:00', closeTime: '15:00', shiftLabel: 'Lunch Shift' },
      { id: 'f-2', openTime: '18:00', closeTime: '00:00', shiftLabel: 'Dinner Shift' },
    ],
  },
  {
    day: 'Saturday',
    isOpen: true,
    shifts: [{ id: 'sa-1', openTime: '11:00', closeTime: '00:00', shiftLabel: 'All Day' }],
  },
  {
    day: 'Sunday',
    isOpen: true,
    shifts: [{ id: 'su-1', openTime: '12:00', closeTime: '22:30', shiftLabel: 'All Day' }],
  },
];

export default function RestaurantOperatingHoursPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_HOURS);
  const [isSaving, setIsSaving] = useState(false);

  // Temporary Kitchen Snooze state
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [snoozeDuration, setSnoozeDuration] = useState('30m');
  const [isSnoozeModalOpen, setIsSnoozeModalOpen] = useState(false);

  // Toggle Day Open / Close
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

  // Update specific shift time
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

  // Add split shift to a day
  const addSplitShift = (dayName: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const newShift: ShiftTime = {
            id: `shift-${Date.now()}`,
            openTime: '18:00',
            closeTime: '23:30',
            shiftLabel: 'Dinner Shift',
          };
          toast.success(`Split shift added to ${dayName}`);
          return { ...d, shifts: [...d.shifts, newShift] };
        }
        return d;
      })
    );
  };

  // Remove shift from day
  const removeShift = (dayName: string, shiftId: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          if (d.shifts.length <= 1) {
            toast.error('At least one shift is required when open');
            return d;
          }
          return { ...d, shifts: d.shifts.filter((s) => s.id !== shiftId) };
        }
        return d;
      })
    );
  };

  // Apply quick time preset to a day
  const applyQuickPreset = (dayName: string, open: string, close: string) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          return {
            ...d,
            isOpen: true,
            shifts: [{ id: `shift-${Date.now()}`, openTime: open, closeTime: close, shiftLabel: 'All Day' }],
          };
        }
        return d;
      })
    );
    toast.success(`Applied ${open} - ${close} to ${dayName}`);
  };

  // Handle Kitchen Snooze
  const handleConfirmSnooze = () => {
    setIsSnoozed(true);
    setIsSnoozeModalOpen(false);
    toast.warning('Kitchen Paused / Snoozed', {
      description: `Temporarily closed for new orders for ${snoozeDuration}.`,
    });
  };

  const handleResumeKitchen = () => {
    setIsSnoozed(false);
    toast.success('Kitchen Resumed Live!', {
      description: 'Online ordering is now accepting new customer tickets.',
    });
  };

  // Save full schedule
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Weekly Operating Hours Saved!', {
        description: 'New schedules are immediately active across all Gozolt customer apps.',
      });
    }, 500);
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* ──────────────────────────────────────────────────────────────────────────
          HEADER BAR: FULL WIDTH WITH SNOOZE & SAVE
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Clock className="h-7 w-7 text-[#FCD223]" />
            Operating Hours
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Set your weekly kitchen opening hours for customer ordering and delivery availability
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rush Pause / Kitchen Snooze */}
          {isSnoozed ? (
            <Button
              onClick={handleResumeKitchen}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <PlayCircle className="mr-1.5 h-4 w-4" />
              Resume Kitchen
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsSnoozeModalOpen(true)}
              className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold text-xs"
              title="Temporarily pause incoming orders"
            >
              <PauseCircle className="mr-1.5 h-4 w-4 text-amber-400" />
              Kitchen Rush Pause
            </Button>
          )}

          {/* Save Hours Primary Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving Timetable...' : 'Save Hours'}
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          RUSH PAUSE ALERT BANNER (ONLY SHOWN WHEN SNOOZED)
          ────────────────────────────────────────────────────────────────────────── */}
      {isSnoozed && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#18181B] to-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/20 p-2.5 text-amber-400 animate-pulse">
              <PauseCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Kitchen Ordering Temporarily Snoozed</span>
                <Badge className="border-amber-500/40 bg-amber-500/20 text-amber-300 text-[10px]">
                  RUSH CLOSURE ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customers on Gozolt app see your restaurant as &quot;Busy with high kitchen volume - Reopening soon&quot;.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleResumeKitchen}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap"
          >
            <PlayCircle className="mr-1.5 h-4 w-4" /> Re-open Kitchen Now
          </Button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          WEEKLY SCHEDULE TABLE (FULL SCREEN WIDTH)
          Allows Open/Close toggle and editable timings for every day
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FCD223]" />
              Weekly Regular Schedule (7 Days)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set exact opening and closing hours. Toggle days open or closed with 1-click.
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {schedule.map((day) => (
            <div
              key={day.day}
              className={cn(
                'p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors',
                day.isOpen ? 'hover:bg-white/[0.02]' : 'bg-black/30'
              )}
            >
              {/* Left: Open/Close Switch & Day Name */}
              <div className="flex items-center gap-4 min-w-[200px]">
                {/* Large Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleDayOpen(day.day)}
                  className={cn(
                    'relative inline-flex h-7 w-13 items-center rounded-full transition-colors cursor-pointer shrink-0',
                    day.isOpen ? 'bg-emerald-500' : 'bg-zinc-700'
                  )}
                  title={day.isOpen ? `Click to mark ${day.day} Closed` : `Click to mark ${day.day} Open`}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-black transition-transform font-bold text-[9px] flex items-center justify-center text-white',
                      day.isOpen ? 'translate-x-7' : 'translate-x-1'
                    )}
                  >
                    {day.isOpen ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-base font-bold transition-colors',
                        day.isOpen ? 'text-white' : 'text-zinc-500 line-through'
                      )}
                    >
                      {day.day}
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px] font-bold px-2 py-0 border',
                        day.isOpen
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {day.isOpen ? 'OPEN' : 'CLOSED ALL DAY'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {day.isOpen
                      ? `${day.shifts.length} active service shift${day.shifts.length > 1 ? 's' : ''}`
                      : 'Not accepting delivery or pickup orders'}
                  </span>
                </div>
              </div>

              {/* Middle: Shift Times & Quick Presets */}
              {day.isOpen ? (
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 lg:justify-center">
                  {/* Shifts List */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
                    {day.shifts.map((shift, idx) => (
                      <div
                        key={shift.id}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0E0E10] p-2"
                      >
                        {day.shifts.length > 1 && (
                          <span className="text-[10px] font-bold text-[#FCD223] uppercase px-1">
                            Shift {idx + 1}
                          </span>
                        )}

                        {/* Open Time */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#18181B] px-2.5 py-1">
                          <span className="text-[11px] font-semibold text-zinc-400">Open:</span>
                          <input
                            type="time"
                            value={shift.openTime}
                            onChange={(e) =>
                              updateShiftTime(day.day, shift.id, 'openTime', e.target.value)
                            }
                            className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
                          />
                        </div>

                        <span className="text-zinc-500 text-xs">to</span>

                        {/* Close Time */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#18181B] px-2.5 py-1">
                          <span className="text-[11px] font-semibold text-zinc-400">Close:</span>
                          <input
                            type="time"
                            value={shift.closeTime}
                            onChange={(e) =>
                              updateShiftTime(day.day, shift.id, 'closeTime', e.target.value)
                            }
                            className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
                          />
                        </div>

                        {/* Delete Shift Button if multiple */}
                        {day.shifts.length > 1 && (
                          <button
                            onClick={() => removeShift(day.day, shift.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Remove split shift"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Split Shift Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSplitShift(day.day)}
                    className="border-dashed border-white/15 bg-white/5 text-[11px] text-zinc-400 hover:text-white h-8"
                    title="Add split lunch / dinner shift"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Split Shift
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center lg:justify-center py-2 text-xs text-zinc-500 italic">
                  Kitchen closed for customer ordering all day. Toggle switch on the left to set hours.
                </div>
              )}

              {/* Right: Quick Hours Presets */}
              {day.isOpen && (
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold mr-1 hidden xl:inline">
                    Presets:
                  </span>
                  <button
                    onClick={() => applyQuickPreset(day.day, '11:00', '23:00')}
                    className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 hover:text-[#FCD223] hover:border-[#FCD223]/30 transition-all font-mono"
                    title="11:00 - 23:00 (Standard)"
                  >
                    11:00-23:00
                  </button>
                  <button
                    onClick={() => applyQuickPreset(day.day, '11:00', '00:00')}
                    className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 hover:text-[#FCD223] hover:border-[#FCD223]/30 transition-all font-mono"
                    title="11:00 - 00:00 (Late Night)"
                  >
                    Late Night
                  </button>
                  <button
                    onClick={() => applyQuickPreset(day.day, '12:00', '22:30')}
                    className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-zinc-400 hover:text-[#FCD223] hover:border-[#FCD223]/30 transition-all font-mono"
                    title="12:00 - 22:30 (Sunday)"
                  >
                    Sunday Hours
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: KITCHEN SNOOZE / RUSH CLOSURE
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isSnoozeModalOpen} onOpenChange={setIsSnoozeModalOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <PauseCircle className="h-5 w-5 text-amber-400" />
              Kitchen Rush Pause
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Temporarily stop accepting new incoming orders during unexpected kitchen volume surges or equipment cleaning.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Pause Duration
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { key: '30m', label: '30 Mins' },
                  { key: '1h', label: '1 Hour' },
                  { key: '2h', label: '2 Hours' },
                  { key: 'restOfDay', label: 'Until Tomorrow' },
                ].map((dur) => (
                  <button
                    key={dur.key}
                    type="button"
                    onClick={() => setSnoozeDuration(dur.key)}
                    className={cn(
                      'rounded-xl border py-2 text-center text-xs font-bold transition-all',
                      snoozeDuration === dur.key
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
                    )}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Existing preparing orders in your KDS will remain active. Customers won't be able to place new orders until paused period ends.
              </span>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSnoozeModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSnooze}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
            >
              Confirm Rush Pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
