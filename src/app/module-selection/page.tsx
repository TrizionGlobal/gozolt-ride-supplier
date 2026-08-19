'use client';

import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Truck, Navigation } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';

export default function ModuleSelectionPage() {
  const router = useRouter();
  const { setActiveModule } = useSidebarStore();

  const handleSelection = (module: 'CAB' | 'RENTAL') => {
    setActiveModule(module);
    if (module === 'CAB') {
      router.push('/dashboard');
    } else {
      router.push('/car-rentals/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Topbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Welcome to the <span className="text-[#FACC15]">Supplier Portal</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Select the module you wish to manage today. You can always switch between modules later from the sidebar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cab Booking Card */}
            <button 
              onClick={() => handleSelection('CAB')}
              className="group relative flex flex-col items-center justify-center p-12 rounded-3xl border border-[#27272A] bg-[#111111] transition-all duration-300 hover:border-[#FACC15] hover:bg-[#1A1A1A] hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#27272A] group-hover:bg-[#FACC15]/20 group-hover:border-[#FACC15]/50 transition-colors">
                  <Navigation className="h-10 w-10 text-[#FACC15]" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Cab Booking</h2>
                  <p className="text-sm text-gray-400">
                    Manage your active fleet, drivers, ride history, settlements, and live GPS tracking for Cab services.
                  </p>
                </div>
              </div>
            </button>

            {/* Car Rentals Card */}
            <button 
              onClick={() => handleSelection('RENTAL')}
              className="group relative flex flex-col items-center justify-center p-12 rounded-3xl border border-[#27272A] bg-[#111111] transition-all duration-300 hover:border-[#FACC15] hover:bg-[#1A1A1A] hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#27272A] group-hover:bg-[#FACC15]/20 group-hover:border-[#FACC15]/50 transition-colors">
                  <Truck className="h-10 w-10 text-[#FACC15]" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Car Rentals</h2>
                  <p className="text-sm text-gray-400">
                    Manage rental bookings, process handovers & returns, track rental earnings, and view your rental customers.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
