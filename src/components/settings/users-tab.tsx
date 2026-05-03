'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';
import { settingsService } from '@/services/settings/settings.service';
import type { TeamUser } from '@/types';

const ROLE_OPTIONS: TeamUser['role'][] = ['Admin', 'Manager', 'Viewer'];

const roleStyles: Record<string, { bg: string; text: string }> = {
  Owner: { bg: 'bg-[#FACC15]/20', text: 'text-[#FACC15]' },
  Admin: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Manager: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Viewer: { bg: 'bg-[#3F3F46]', text: 'text-[#A1A1AA]' },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
};

export function UsersTab() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamUser['role']>('Viewer');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsService.getTeamUsers();
        setUsers(data);
      } catch {
        // fallback handled in service
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const newUser = await settingsService.inviteUser(inviteEmail.trim(), inviteRole);
      setUsers((prev) => [...prev, newUser]);
      setInviteEmail('');
      setShowInvite(false);
      toast.success('Invitation sent');
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this user?');
    if (!confirmed) return;

    try {
      await settingsService.removeUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User removed');
    } catch {
      toast.error('Failed to remove user');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded bg-[#27272A] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Team Users</h3>
          <p className="text-sm text-[#71717A]">Manage who has access to this portal</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="mb-6 rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg border border-[#27272A] bg-[#111111] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamUser['role'])}
              className="rounded-lg border border-[#27272A] bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              className="rounded-lg bg-[#FACC15] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-60"
            >
              {isInviting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#71717A]">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#71717A]">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const rStyle = roleStyles[user.role] || roleStyles.Viewer;
              const sStyle = statusStyles[user.status] || statusStyles.Pending;
              return (
                <tr
                  key={user.id}
                  className="border-b border-[#27272A] last:border-b-0 transition-colors hover:bg-[#1A1A1A]/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-[#A1A1AA]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${rStyle.bg} ${rStyle.text}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${sStyle.bg} ${sStyle.text}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="rounded-lg p-1.5 text-[#71717A] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
