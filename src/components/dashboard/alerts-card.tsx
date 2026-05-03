'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const alerts = [
  {
    id: '1',
    type: 'warning' as const,
    message: '3 vehicles insurance documents expiring within 7 days...',
  },
  {
    id: '2',
    type: 'error' as const,
    message: 'Vehicle ABC-001 annual maintenance inspection overdue...',
  },
  {
    id: '3',
    type: 'info' as const,
    message: '3 drivers pending vehicle assignment...',
  },
  {
    id: '4',
    type: 'success' as const,
    message: 'Payout of €2,500 processed successfully...',
  },
];

const alertStyles = {
  warning: { border: 'border-l-[#FACC15]', icon: AlertTriangle, iconColor: 'text-[#FACC15]', bg: 'bg-[#FACC15]/5' },
  error: { border: 'border-l-[#EF4444]', icon: AlertCircle, iconColor: 'text-[#EF4444]', bg: 'bg-[#EF4444]/5' },
  info: { border: 'border-l-[#3B82F6]', icon: Info, iconColor: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/5' },
  success: { border: 'border-l-[#22C55E]', icon: CheckCircle, iconColor: 'text-[#22C55E]', bg: 'bg-[#22C55E]/5' },
};

export function AlertsCard() {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">Alerts</h3>
      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-2.5 rounded-lg border-l-4 ${style.border} ${style.bg} py-2.5 px-3`}
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.iconColor}`} />
              <p className="text-sm text-[#D4D4D8]">{alert.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
