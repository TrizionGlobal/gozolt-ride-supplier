'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Trash2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';

export function WorkersTab() {
  const user = useAuthStore((s) => s.user);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await apiClient.get('/car-rentals/supplier/workers');
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/car-rentals/supplier/workers', newWorker);
      setNewWorker({ name: '', email: '', phone: '' });
      setIsAddModalOpen(false);
      fetchWorkers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to remove this worker?')) return;
    try {
      await apiClient.delete(`/car-rentals/supplier/workers/${id}`);
      fetchWorkers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Car Rental Workers</h3>
          <p className="text-sm text-[#A1A1AA]">Manage the staff members who handle car handovers and returns in the field.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Worker
        </button>
      </div>

      <div className="rounded-lg border border-[#27272A] overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1A1A1A] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-300">Name</th>
              <th className="px-6 py-4 font-medium text-gray-300">Contact</th>
              <th className="px-6 py-4 font-medium text-gray-300">Status</th>
              <th className="px-6 py-4 text-right font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A] bg-[#111111]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">Loading...</td>
              </tr>
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No workers found. Add one to assign handover tasks!
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-[#1A1A1A]">
                  <td className="px-6 py-4 text-white font-medium">{worker.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {worker.email}</span>
                      {worker.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {worker.phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteWorker(worker.id)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-white">Add Worker</h3>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-6 text-sm text-yellow-200/80 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p>Workers do NOT need a password to log in. You will assign them tasks, and they will receive a Magic Link via email to complete the task.</p>
            </div>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Email Address (For Magic Links)</label>
                <input
                  type="email"
                  required
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                  placeholder="+356 1234 5678"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-[#27272A] px-4 py-2 font-medium text-white hover:bg-[#1A1A1A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FACC15] px-4 py-2 font-medium text-black hover:bg-[#EAB308]"
                >
                  Add Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
