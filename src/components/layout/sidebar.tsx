'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#27272A] bg-[#0A0A0A] transition-all duration-300',
        isCollapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      {/* Logo + Collapse toggle */}
      <div className={cn('flex items-center justify-between px-4 py-4', isCollapsed && 'justify-center px-2')}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Gozolt"
            width={36}
            height={36}
            className="shrink-0 object-contain"
          />
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-[#FACC15]">GOZOLT</span>
              <p className="text-[10px] text-[#71717A] -mt-0.5">Supplier Portal</p>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button onClick={toggle} className="text-[#71717A] hover:text-white transition-colors">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button onClick={toggle} className="mt-2 text-[#71717A] hover:text-white transition-colors">
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Plan badge */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-full bg-[#FACC15] px-3 py-1 text-center text-xs font-semibold text-black">
            Professional Plan
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[#FACC15] text-black font-medium'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white',
                isCollapsed && 'justify-center px-2',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-2">
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-[#1A1A1A] transition-colors',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-[#27272A] px-3 py-3">
          <p className="text-center text-[10px] text-[#52525B]">
            Born in Malta, Loved by Europe
          </p>
        </div>
      )}
    </aside>
  );
}
