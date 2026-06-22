import { Calendar, AlertCircle } from 'lucide-react';

interface MaintenanceReminder {
  id: string;
  vehiclePlate: string;
  type: string;
  dueDate: string;
  daysUntilDue: number;
  status: 'due_soon' | 'overdue';
}

interface MaintenanceRemindersProps {
  reminders: MaintenanceReminder[];
}

export function MaintenanceReminders({ reminders }: MaintenanceRemindersProps) {
  if (!reminders || reminders.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111111] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Maintenance Schedule</h2>
      </div>

      <div className="flex flex-col gap-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#1A1A1A] p-4"
          >
            <div>
              <p className="font-medium text-white">
                {reminder.vehiclePlate} — {reminder.type}
              </p>
              <p className="text-sm text-[#71717A]">Due: {reminder.dueDate}</p>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                reminder.status === 'overdue'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {reminder.status === 'overdue'
                ? `Overdue by ${reminder.daysUntilDue}d`
                : `${reminder.daysUntilDue}d away`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
