'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Mail, Phone, Trash2, Edit2, ShieldAlert, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { PhoneInput } from '@/components/ui/phone-input';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'sonner';

const MySwal = withReactContent(Swal);

export function WorkersTab({ moduleType = 'RENTAL' }: { moduleType?: string }) {
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
  const [addNameError, setAddNameError] = useState('');
  const [editNameError, setEditNameError] = useState('');
  const [addEmailError, setAddEmailError] = useState('');
  const [editEmailError, setEditEmailError] = useState('');

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) {
      const parts = trimmed.split('@');
      if (parts.length > 2) return 'Email cannot contain multiple @ symbols';
      const [local, domain] = parts;
      if (!local) return 'Please enter username before @';
      if (!domain) return 'Please enter domain after @ (e.g. gmail.com)';
      if (!domain.includes('.')) return 'Domain must include an extension (e.g. .com)';
      const domainParts = domain.split('.');
      const tld = domainParts[domainParts.length - 1];
      if (!tld) return 'Please enter domain extension (e.g. .com)';
      if (!/^[a-zA-Z]{2,}$/.test(tld)) {
        return 'Domain extension must contain only letters (e.g. .com)';
      }
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      return 'Enter a valid email (e.g. name@example.com)';
    }
    return '';
  };

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = moduleType === 'QUICK_SERVICES'
        ? '/quick-services/supplier/workers'
        : moduleType === 'BIKE_RENTAL'
          ? '/bike-rentals/supplier/workers'
          : '/car-rentals/supplier/workers';
      const res = await apiClient.get(`${endpoint}?page=${page}&limit=${limit}`);
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

  const cleanPhone = (phone?: string) => {
    if (!phone) return undefined;
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return undefined;
    return phone.trim();
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newWorker.name.trim();
    const trimmedEmail = newWorker.email.trim();

    let hasError = false;
    if (!trimmedName) {
      setAddNameError('Please enter worker name');
      hasError = true;
    } else if (trimmedName.length > 50) {
      setAddNameError('Full name cannot exceed 50 characters');
      hasError = true;
    } else {
      setAddNameError('');
    }

    if (!trimmedEmail) {
      setAddEmailError('Email address is required');
      hasError = true;
    } else {
      const emailErr = validateEmail(trimmedEmail);
      if (emailErr) {
        setAddEmailError(emailErr);
        hasError = true;
      } else {
        setAddEmailError('');
      }
    }

    if (hasError) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = moduleType === 'QUICK_SERVICES'
        ? '/quick-services/supplier/workers'
        : moduleType === 'BIKE_RENTAL'
          ? '/bike-rentals/supplier/workers'
          : '/car-rentals/supplier/workers';
      await apiClient.post(endpoint, {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: cleanPhone(newWorker.phone),
      });
      setNewWorker({ name: '', email: '', phone: '' });
      setAddNameError('');
      setAddEmailError('');
      setIsAddModalOpen(false);
      toast.success('Worker added successfully');
      fetchWorkers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = currentWorker.name.trim();
    const trimmedEmail = currentWorker.email.trim();

    let hasError = false;
    if (!trimmedName) {
      setEditNameError('Please enter worker name');
      hasError = true;
    } else if (trimmedName.length > 50) {
      setEditNameError('Full name cannot exceed 50 characters');
      hasError = true;
    } else {
      setEditNameError('');
    }

    if (!trimmedEmail) {
      setEditEmailError('Email address is required');
      hasError = true;
    } else {
      const emailErr = validateEmail(trimmedEmail);
      if (emailErr) {
        setEditEmailError(emailErr);
        hasError = true;
      } else {
        setEditEmailError('');
      }
    }

    if (hasError) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = moduleType === 'QUICK_SERVICES'
        ? '/quick-services/supplier/workers'
        : moduleType === 'BIKE_RENTAL'
          ? '/bike-rentals/supplier/workers'
          : '/car-rentals/supplier/workers';
      await apiClient.put(`${endpoint}/${currentWorker.id}`, {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: cleanPhone(currentWorker.phone) || null,
      });
      setEditNameError('');
      setEditEmailError('');
      setIsEditModalOpen(false);
      toast.success('Worker updated successfully');
      fetchWorkers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (worker: any) => {
    setCurrentWorker({ id: worker.id, name: worker.name, email: worker.email, phone: worker.phone || '' });
    setEditNameError('');
    setEditEmailError('');
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
          const endpoint = moduleType === 'QUICK_SERVICES'
            ? '/quick-services/supplier/workers'
            : moduleType === 'BIKE_RENTAL'
              ? '/bike-rentals/supplier/workers'
              : '/car-rentals/supplier/workers';
          await apiClient.delete(`${endpoint}/${id}`);
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
            <form onSubmit={handleAddWorker} noValidate className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <span className="text-xs text-gray-500">{newWorker.name.length}/50</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={newWorker.name}
                  onChange={(e) => {
                    setNewWorker({ ...newWorker, name: e.target.value.slice(0, 50) });
                    if (addNameError) setAddNameError('');
                  }}
                  className={`w-full rounded-lg border ${
                    addNameError ? 'border-red-500 focus:border-red-500' : 'border-[#27272A] focus:border-[#FACC15]'
                  } bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none transition-colors`}
                  placeholder="Enter Name"
                />
                {addNameError && (
                  <p className="mt-1 text-xs text-red-500">{addNameError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Email Address (For Magic Links)</label>
                <input
                  type="email"
                  required
                  value={newWorker.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewWorker({ ...newWorker, email: val });
                    if (val.includes('@') || addEmailError) {
                      setAddEmailError(validateEmail(val));
                    }
                  }}
                  onBlur={() => {
                    if (newWorker.email.trim()) {
                      setAddEmailError(validateEmail(newWorker.email));
                    }
                  }}
                  className={`w-full rounded-lg border ${
                    addEmailError ? 'border-red-500 focus:border-red-500' : 'border-[#27272A] focus:border-[#FACC15]'
                  } bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none transition-colors`}
                  placeholder="Enter Email Address"
                />
                {addEmailError && (
                  <p className="mt-1 text-xs text-red-500">{addEmailError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Phone Number (Optional)</label>
                <PhoneInput
                  placeholder="Enter Phone Number"
                  value={newWorker.phone}
                  onChange={(val) => setNewWorker({ ...newWorker, phone: val })}
                  className="phone-input-modal"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewWorker({ name: '', email: '', phone: '' });
                    setAddNameError('');
                    setAddEmailError('');
                  }}
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
            <form onSubmit={handleEditWorker} noValidate className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <span className="text-xs text-gray-500">{currentWorker.name.length}/50</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={currentWorker.name}
                  onChange={(e) => {
                    setCurrentWorker({ ...currentWorker, name: e.target.value.slice(0, 50) });
                    if (editNameError) setEditNameError('');
                  }}
                  className={`w-full rounded-lg border ${
                    editNameError ? 'border-red-500 focus:border-red-500' : 'border-[#27272A] focus:border-[#FACC15]'
                  } bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none transition-colors`}
                />
                {editNameError && (
                  <p className="mt-1 text-xs text-red-500">{editNameError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={currentWorker.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentWorker({ ...currentWorker, email: val });
                    if (val.includes('@') || editEmailError) {
                      setEditEmailError(validateEmail(val));
                    }
                  }}
                  onBlur={() => {
                    if (currentWorker.email.trim()) {
                      setEditEmailError(validateEmail(currentWorker.email));
                    }
                  }}
                  className={`w-full rounded-lg border ${
                    editEmailError ? 'border-red-500 focus:border-red-500' : 'border-[#27272A] focus:border-[#FACC15]'
                  } bg-[#0A0A0A] p-3 text-white placeholder-gray-500 outline-none transition-colors`}
                />
                {editEmailError && (
                  <p className="mt-1 text-xs text-red-500">{editEmailError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Phone Number (Optional)</label>
                <PhoneInput
                  placeholder="Enter Phone Number"
                  value={currentWorker.phone}
                  onChange={(val) => setCurrentWorker({ ...currentWorker, phone: val })}
                  className="phone-input-modal"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditNameError('');
                    setEditEmailError('');
                  }}
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
