'use client';

interface DocumentStatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approved' },
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' },
  EXPIRED: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Expired' },
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.PENDING;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
