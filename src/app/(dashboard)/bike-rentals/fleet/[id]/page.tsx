'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, ArrowLeft, Bike, Bike, Info, Euro, Clock, Package } from 'lucide-react';

export default function BikeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [bike, setBike] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const res = await fetch(`/api/bike-rentals/supplier/bikes/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setBike(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchBike();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Bike not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FACC15] hover:underline">
          Go back to fleet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/bike-rentals/fleet')} className="rounded-lg border border-[#27272A] bg-[#111111] p-2 text-white hover:bg-[#1A1A1A] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{bike.name}</h1>
            <p className="text-sm text-[#A1A1AA]">ID: CR-{bike.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <Link
          href={`/bike-rentals/fleet/${bike.id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          <Pencil className="h-4 w-4" />
          Edit Bike
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
            <div className="h-48 w-full bg-[#1A1A1A] flex items-center justify-center relative">
              {bike.images?.[0] ? (
                <img src={bike.images[0]} alt={bike.name} className="h-full w-full object-cover" />
              ) : (
                <Bike className="h-16 w-16 text-[#27272A]" />
              )}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  bike.status === 'AVAILABLE' ? 'bg-emerald-500/90 text-white' :
                  bike.status === 'ON_RENT' ? 'bg-blue-500/90 text-white' :
                  'bg-red-500/90 text-white'
                }`}>
                  {bike.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-[#A1A1AA]" />
                Specifications
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Registration No</p>
                  <p className="text-sm font-medium text-white">{bike.registrationNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">VIN No</p>
                  <p className="text-sm font-medium text-white">{bike.vinNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Year</p>
                  <p className="text-sm font-medium text-white">{bike.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Category</p>
                  <p className="text-sm font-medium text-white">{bike.category}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Transmission</p>
                  <p className="text-sm font-medium text-white">{bike.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Fuel Type</p>
                  <p className="text-sm font-medium text-white">{bike.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Seats</p>
                  <p className="text-sm font-medium text-white">{bike.seats}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Features</p>
                  <div className="flex gap-2">
                    {bike.hasAirConditioning && <span className="inline-flex items-center rounded-full bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-medium text-white border border-[#27272A]">A/C</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Euro className="h-5 w-5 text-[#A1A1AA]" />
              Pricing Rules
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Daily Price</p>
                <p className="text-lg font-semibold text-white">€{Number(bike.pricePerDay).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Weekly Price</p>
                <p className="text-sm font-semibold text-white">€{Number(bike.weeklyPrice || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Monthly Price</p>
                <p className="text-sm font-semibold text-white">€{Number(bike.monthlyPrice || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#A1A1AA]" />
              Delivery Options
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#A1A1AA]">Self Pickup</p>
                <span className={`inline-flex h-2 w-2 rounded-full ${bike.isSelfPickupAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#A1A1AA]">Supplier Delivery</p>
                <span className={`inline-flex h-2 w-2 rounded-full ${bike.isSupplierDeliveryAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Doorstep Delivery</p>
                <span className={`inline-flex h-2 w-2 rounded-full ${bike.isDoorstepDeliveryAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
