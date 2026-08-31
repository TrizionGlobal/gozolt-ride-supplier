'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeft, ArrowLeftRight } from 'lucide-react';
import { SIDEBAR_ITEMS, ROUTES } from '@/lib/constants';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useCarRentalsStore } from '@/stores/car-rentals.store';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle, activeModule, setActiveModule } = useSidebarStore();
  const { logout } = useAuth();
  
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSource(urlParams.get('source'));
  }, [pathname]);

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
        {SIDEBAR_ITEMS.filter((item) => item.module === activeModule || !activeModule).map((item) => {
          const Icon = item.icon;
          let isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isBookingSubPage = pathname.match(/^\/(car-rentals|bike-rentals)\/[a-zA-Z0-9-]+\/(details|handover|return)$/);

          // Prevent "Drivers" from being active when in "Driver Settlements"
          if (item.href === ROUTES.DRIVERS && pathname.startsWith(ROUTES.DRIVER_SETTLEMENTS)) {
            isActive = false;
          }

          // Prevent "Car Rentals" or "Bike Rentals" from being active when in its distinct sub-modules
          if (
            (item.href === ROUTES.CAR_RENTALS &&
            (pathname.startsWith('/car-rentals/dashboard') ||
             pathname.startsWith('/car-rentals/fleet') ||
             pathname.startsWith('/car-rentals/reviews') ||
             pathname.startsWith('/car-rentals/workers') ||
             pathname.startsWith('/car-rentals/bookings') ||
             pathname.startsWith('/car-rentals/payouts') ||
             pathname.startsWith('/car-rentals/operational') ||
             pathname === '/car-rentals/new' ||
             pathname.match(/^\/car-rentals\/[a-zA-Z0-9-]+\/edit$/) ||
             (isBookingSubPage && source === 'bookings'))) ||
            (item.href === ROUTES.BIKE_RENTALS &&
            (pathname.startsWith('/bike-rentals/dashboard') ||
             pathname.startsWith('/bike-rentals/fleet') ||
             pathname.startsWith('/bike-rentals/reviews') ||
             pathname.startsWith('/bike-rentals/workers') ||
             pathname.startsWith('/bike-rentals/bookings') ||
             pathname.startsWith('/bike-rentals/payouts') ||
             pathname.startsWith('/bike-rentals/operational') ||
             pathname === '/bike-rentals/new' ||
             pathname.match(/^\/bike-rentals\/[a-zA-Z0-9-]+\/edit$/) ||
             (isBookingSubPage && source === 'bookings')))
          ) {
            isActive = false;
          }

          if ((item.href === ROUTES.CAR_RENTALS || item.href === ROUTES.BIKE_RENTALS) && isBookingSubPage && source !== 'bookings') {
            isActive = true;
          }

          // Make "Fleet" active for new vehicle and edit vehicle pages
          if ((item.href === '/car-rentals/fleet' && (pathname === '/car-rentals/new' || pathname.match(/^\/car-rentals\/[a-zA-Z0-9-]+\/edit$/))) ||
              (item.href === '/bike-rentals/fleet' && (pathname === '/bike-rentals/new' || pathname.match(/^\/bike-rentals\/[a-zA-Z0-9-]+\/edit$/)))) {
            isActive = true;
          }

          // Make "Booking Management" active for details, handover, and return pages
          if ((item.href === '/car-rentals/bookings' || item.href === '/bike-rentals/bookings') && isBookingSubPage && source === 'bookings') {
            isActive = true;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.href === '/car-rentals/bookings') {
                  useCarRentalsStore.getState().setManagementFilters(1, 20, '', 'today');
                }
              }}
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



      {/* Switch Module Button */}
      <div className={cn("px-3 pb-3", isCollapsed && "flex justify-center")}>
        <Link 
          href="/module-selection" 
          onClick={() => setActiveModule(null)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#71717A] transition-colors hover:bg-[#1A1A1A] hover:text-[#FACC15]",
            isCollapsed && "px-2 justify-center"
          )}
          title={isCollapsed ? "Switch Module" : undefined}
        >
          <ArrowLeftRight className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Switch Module</span>}
        </Link>
      </div>

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
