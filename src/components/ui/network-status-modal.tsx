'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function NetworkStatusModal() {
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      window.location.reload();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Avoid hydration mismatch by waiting for mount
  if (!hasMounted || !isOffline) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-[#27272A] bg-[#111111] p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <WifiOff className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">No Internet Connection</h2>
        <p className="mb-6 text-sm text-[#A1A1AA]">
          Please check your network settings. The portal will automatically resume once your internet is restored.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
