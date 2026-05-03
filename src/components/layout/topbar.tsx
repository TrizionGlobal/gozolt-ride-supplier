'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/use-auth';

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
        {/* Search */}
        <div className="relative w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
          <Input
            type="text"
            placeholder="Search Reservations..."
            className="pl-10 h-9 rounded-full bg-[#111111] border-[#3F3F46] text-white text-sm placeholder:text-[#71717A] focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20"
          />
        </div>

        {/* Notification bell */}
        <button className="text-[#71717A] hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FACC15]">
            <span className="text-xs font-bold text-black">{initials}</span>
          </div>
          <span className="text-sm text-white">{user?.companyName || 'Malta Taxis Ltd'}</span>
        </div>

        {/* Settings & Logout links */}
        <div className="flex flex-col items-end text-[10px] gap-0.5 ml-2">
          <Link href="/settings" className="text-[#71717A] hover:text-white transition-colors flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Settings
          </Link>
          <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
