'use client';

import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Props {
  bookingId: string;
  bookingRef?: string;
  tripLeg?: 'OUTBOUND' | 'RETURN';
  isRoundTrip?: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignTransferWorkerModal({
  bookingId,
  bookingRef,
  tripLeg = 'OUTBOUND',
  isRoundTrip = false,
  onClose,
  onAssigned,
}: Props) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    apiClient
      .get('/airport-transfers/supplier/workers')
      .then((res) => {
        const workersArray = res.data.data || [];
        setWorkers(workersArray);
        if (workersArray.length > 0) setSelectedWorkerId(workersArray[0].id);
      })
      .catch((err) => {
        console.error('Failed to load workers:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;
    setAssigning(true);
    try {
      await apiClient.post(`/airport-transfers/supplier/bookings/${bookingId}/assign-task`, {
        workerId: selectedWorkerId,
        magicLinkBaseUrl: window.location.origin,
        tripLeg,
      });
      onAssigned();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to assign transfer task');
    } finally {
      setAssigning(false);
    }
  };

  const legLabel = !isRoundTrip ? 'One-Way Trip' : tripLeg === 'RETURN' ? 'Return Trip' : 'First Trip';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl">
        <h3 className="mb-2 text-xl font-bold text-white">Assign to Worker</h3>
        <p className="text-sm text-gray-400 mb-6">
          Select a worker to handle this transfer ({legLabel}). An email with a Magic Link will be sent to them.
        </p>

        {loading ? (
          <div className="text-gray-400 text-sm">Loading workers...</div>
        ) : workers.length === 0 ? (
          <div>
            <div className="text-yellow-500 text-sm mb-4">
              No workers found. Please add workers in Settings first.
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#27272A] px-4 py-2 font-medium text-white hover:bg-[#1A1A1A]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">Select Worker</label>
              <select
                required
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white outline-none focus:border-[#FACC15]"
              >
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} ({worker.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#27272A] px-4 py-2 font-medium text-white hover:bg-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning}
                className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 font-medium text-black hover:bg-[#EAB308] disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {assigning ? 'Sending Link...' : 'Assign & Send Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
