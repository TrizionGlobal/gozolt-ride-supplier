'use client';

import { usePathname } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/use-auth';
import { NotificationDropdown } from './notification-dropdown';
import { ProfileDropdown } from './profile-dropdown';

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  // Build breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean);
  const pageTitle = segments.length > 0
    ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
    : 'Dashboard';

  const initials = user?.companyName
    ? user.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'MT';

  const isExpired = user?.subscription?.currentPeriodEnd && new Date(user.subscription.currentPeriodEnd) < new Date();
  const isSubscriptionSetup = pathname === '/subscription' && (!user?.subscription || isExpired);

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-[#27272A] bg-[#0A0A0A] px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-[#71717A]">Home</span>
        <span className="text-[#71717A]">&gt;</span>
        <span className="text-white font-medium">{pageTitle}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification dropdown */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <ProfileDropdown />

        {/* Logout button (visible when on subscription page since sidebar is hidden) */}
        {isSubscriptionSetup && (
          <button
            onClick={logout}
            className="ml-2 flex items-center justify-center rounded-full bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

      </div>
    </header>
  );
}
