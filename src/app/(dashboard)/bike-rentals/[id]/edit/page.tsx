'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BikeRentalForm } from '../../components/BikeRentalForm';
import { bikeRentalsService, BikeRentalBike } from '@/services/bike-rentals/bike-rentals.service';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBikeRentalsStore } from '@/stores/bike-rentals.store';

export default function EditBikeRentalPage() {
  const params = useParams();
  const id = params.id as string;
  const [bike, setBike] = useState<BikeRentalBike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      bikeRentalsService.getBike(id)
        .then(data => setBike(data))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return <div className="flex w-full h-[50vh] items-center justify-center text-sm text-[#A1A1AA]">Loading bike data...</div>;
  }

  if (!bike) {
    return <div className="flex w-full h-[50vh] items-center justify-center text-sm text-red-500">Bike not found</div>;
  }

  const toggleStatus = async () => {
    if (!bike || isTogglingStatus) return;
    const newStatus = bike.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    setIsTogglingStatus(true);
    try {
      await bikeRentalsService.updateBikeStatus(id, newStatus);
      setBike({ ...bike, status: newStatus });
      useBikeRentalsStore.getState().clearFleetCache();
      toast.success(`Bike successfully marked as ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update bike status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/bike-rentals/fleet" className="text-[#A1A1AA] hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Edit Bike Rental</h1>
        </div>
        <div className="flex items-center gap-3">
          {bike.status === 'ON_RENT' ? (
            <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
              On Rent
            </span>
          ) : (
            <>
              <span className="text-sm font-medium text-[#A1A1AA]">
                {bike.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
              </span>
              <button
                type="button"
                onClick={toggleStatus}
                disabled={isTogglingStatus}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  bike.status === 'AVAILABLE' ? 'bg-[#FACC15]' : 'bg-[#27272A]'
                } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none flex h-4 w-4 transform items-center justify-center rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                    bike.status === 'AVAILABLE' ? 'translate-x-4 bg-black' : 'translate-x-0 bg-[#A1A1AA]'
                  }`}
                >
                  {isTogglingStatus && (
                    <Loader2 className={`h-3 w-3 animate-spin ${bike.status === 'AVAILABLE' ? 'text-[#FACC15]' : 'text-black'}`} />
                  )}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      <BikeRentalForm initialData={bike} />
    </div>
  );
}
