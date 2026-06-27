'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const router = useRouter();

  const initials = user?.companyName
    ? user.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'MT';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 p-1 pr-3 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 ${
          isOpen ? 'bg-[#1A1A1A] border-[#FACC15]' : 'bg-[#111111] border-[#FACC15]/50 hover:border-[#FACC15] hover:bg-[#1A1A1A]'
        }`}
      >
        <div className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-full bg-[#FACC15]">
          {user?.logoUrl ? (
            <img src={user.logoUrl} alt="Company Logo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-black">{initials}</span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium text-white leading-tight">{user?.companyName || 'Malta Taxis Ltd'}</span>
          <ChevronDown className={`h-4 w-4 text-[#A1A1AA] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-xl border border-[#27272A] bg-[#111111] shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-4 py-3 border-b border-[#27272A] bg-[#0A0A0A]">
            <p className="text-sm font-semibold text-white truncate">{user?.companyName || 'Malta Taxis Ltd'}</p>
            <p className="text-xs text-[#71717A] truncate mt-0.5">{user?.email || 'admin@maltataxis.com'}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); router.push('/settings'); }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-[#D4D4D8] hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4 mr-3 text-[#A1A1AA]" />
              Settings & Team
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push('/subscription'); }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-[#D4D4D8] hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <CreditCard className="h-4 w-4 mr-3 text-[#A1A1AA]" />
              Billing & Subscription
            </button>
          </div>
          
          <div className="border-t border-[#27272A] py-1">
            <button
              onClick={() => { setIsOpen(false); logout(); }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-[#1A1A1A] transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
