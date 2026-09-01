'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Mail, Phone, Trash2, Edit2, ShieldAlert, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'sonner';

const MySwal = withReactContent(Swal);

export function WorkersTab() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentWorker, setCurrentWorker] = useState({ id: '', name: '', email: '', phone: '' });
  const [newWorker, setNewWorker] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/car-rentals/supplier/workers?page=${page}&limit=${limit}`);
      const items = res.data?.data || res.data || [];
      const newTotal = res.data?.meta?.total || items.length;

      setWorkers(items);
      setTotal(newTotal);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/car-rentals/supplier/workers', newWorker);
      setNewWorker({ name: '', email: '', phone: '' });
      setIsAddModalOpen(false);
      toast.success('Worker added successfully');
      fetchWorkers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put(`/car-rentals/supplier/workers/${currentWorker.id}`, currentWorker);
      setIsEditModalOpen(false);
      toast.success('Worker updated successfully');
      fetchWorkers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (worker: any) => {
    setCurrentWorker({ id: worker.id, name: worker.name, email: worker.email, phone: worker.phone || '' });
    setIsEditModalOpen(true);
  };

  const handleDeleteWorker = async (id: string, name: string, hasTasks: boolean) => {
    if (hasTasks) {
      MySwal.fire({
        title: 'Cannot Remove Worker',
        text: 'This staff member is assigned to pending tasks. Please wait until they are completed.',
        icon: 'error',
        background: '#111111',
        color: '#fff',
        confirmButtonColor: '#FACC15',
        confirmButtonText: 'OK',
        width: '450px',
        customClass: {
          popup: 'border border-[#27272A] rounded-xl p-4',
          title: 'text-sm font-bold',
          htmlContainer: 'text-xs text-gray-300 mt-1',
          confirmButton: 'px-4 py-1.5 text-xs rounded-lg font-bold text-black',
          icon: '!scale-50 !mt-2 !mb-0',
          actions: 'mt-2'
        }
      });
      return;
    }

    MySwal.fire({
      title: 'Remove Worker?',
      text: `Are you sure you want to remove ${name}? They will no longer be able to complete tasks.`,
      icon: 'warning',
      background: '#111111',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#27272A',
      confirmButtonText: 'Yes, remove',
      width: '400px',
      customClass: {
        popup: 'border border-[#27272A] rounded-xl p-4',
        title: 'text-lg font-bold',
        htmlContainer: 'text-sm text-gray-300',
        confirmButton: 'px-4 py-2 text-sm rounded-lg font-medium',
        cancelButton: 'px-4 py-2 text-sm rounded-lg font-medium',
        icon: '!scale-75 !mt-2 !mb-0',
        actions: 'mt-4'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/car-rentals/supplier/workers/${id}`);
          toast.success('Worker removed successfully');
          if (workers.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            fetchWorkers();
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to remove worker');
        }
      }
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (worker) => <span className="text-white font-medium">{worker.name}</span>
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (worker) => (
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-gray-500" /> {worker.email}</span>
          {worker.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-gray-500" /> {worker.phone}</span>}
        </div>
      )
    },
    {
      key: 'tasks',
      title: 'Current Tasks',
      className: 'text-center',
      render: (worker) => {
        const carTasks = (worker.tasks || []).map((t: any) => ({ ...t, _category: 'Car' }));
        const bikeTasks = (worker.bikeTasks || []).map((t: any) => ({ ...t, _category: 'Bike' }));
        const allTasks = [...carTasks, ...bikeTasks];

        if (allTasks.length === 0) {
          return <span className="text-gray-500 text-xs italic">No pending tasks</span>;
        }
        return (
          <div className="flex flex-col gap-2">
            {allTasks.map((task: any) => (
              <div key={task.id} className="bg-[#1A1A1A] p-2 rounded border border-[#27272A] text-xs">
                <div className="font-medium text-[#FACC15] mb-1">
                  {task._category} {task.taskType === 'HANDOVER' ? 'Handover' : 'Return'} - {task.booking?.vehicle?.name || 'Vehicle'}
                </div>
                <div className="text-[#A1A1AA]">
                  Due: {new Date(task.expiresAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (worker) => {
        const hasTasks = (worker.tasks?.length > 0) || (worker.bikeTasks?.length > 0);
        
        if (hasTasks) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 border border-blue-500/20">
              Assigned
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 border border-emerald-500/20">
            Available
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-center',
      render: (worker) => {
        const hasTasks = (worker.tasks?.length > 0) || (worker.bikeTasks?.length > 0);
        return (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => openEditModal(worker)} className="text-[#FACC15] hover:text-yellow-400 p-2 rounded-lg hover:bg-[#FACC15]/10 transition-colors" title="Edit">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => handleDeleteWorker(worker.id, worker.name, hasTasks)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    const handleOpenAdd = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-worker-modal', handleOpenAdd);
    return () => window.removeEventListener('open-add-worker-modal', handleOpenAdd);
  }, []);

  return (
    <div>
      <ServerSideTable
        columns={columns}
        data={workers}
        isLoading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyText="No workers found. Add one to assign handover tasks!"
      />

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
                  placeholder="Enter your number"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-white">Edit Worker</h3>
            <form onSubmit={handleEditWorker} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={currentWorker.name}
                  onChange={(e) => setCurrentWorker({ ...currentWorker, name: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={currentWorker.email}
                  onChange={(e) => setCurrentWorker({ ...currentWorker, email: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="Enter your number"
                  value={currentWorker.phone}
                  onChange={(e) => setCurrentWorker({ ...currentWorker, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none focus:border-[#FACC15]"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-medium text-black hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
