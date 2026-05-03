'use client';

import type { MaintenanceReminder } from '@/types';

interface MaintenanceRemindersProps {
  reminders: MaintenanceReminder[];
}

export function MaintenanceReminders({ reminders }: MaintenanceRemindersProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Maintenance Schedule</h3>
      <div className="space-y-3">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#27272A] last:border-0">
            <div>
              <p className="text-sm text-white">
                {r.vehiclePlate} — {r.type}
              </p>
              <p className="text-xs text-[#71717A]">Due: {r.dueDate}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                r.status === 'overdue'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {r.status === 'overdue' ? `${Math.abs(r.daysUntilDue)}d overdue` : `${r.daysUntilDue}d away`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
