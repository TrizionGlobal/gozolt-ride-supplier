'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { SIDEBAR_ITEMS, ROUTES } from '@/lib/constants';
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
            src="/logo-icon.png"
            alt="Gozolt"
            width={44}
            height={44}
            className="shrink-0 object-contain"
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wide leading-none">
                <span className="text-white">GO</span>
                <span className="text-[#FACC15]">ZOLT</span>
              </span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-[#FACC15] uppercase mt-0.5">Supplier Portal</span>
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



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          let isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          // Prevent "Drivers" from being active when in "Driver Settlements"
          if (item.href === ROUTES.DRIVERS && pathname.startsWith(ROUTES.DRIVER_SETTLEMENTS)) {
            isActive = false;
          }

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



      {/* Footer */}
      <div className={cn("border-t border-[#27272A] px-4 py-3", isCollapsed && "px-2")}>
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[#FACC15]/10 px-2 py-0.5 text-[10px] font-medium text-[#FACC15] ring-1 ring-inset ring-[#FACC15]/20">
                v1.0.0
              </span>
            </div>
            <span className="text-[10px] text-[#52525B]">Born in Malta, Loved by Europe</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-md bg-[#FACC15]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#FACC15] ring-1 ring-inset ring-[#FACC15]/20">
              v1.0
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
