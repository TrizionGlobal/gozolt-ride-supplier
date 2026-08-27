'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, ArrowLeft, Car, Info, Euro, Clock, Package } from 'lucide-react';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/car-rentals/supplier/vehicles/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setVehicle(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchVehicle();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Vehicle not found</h2>
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
          <button onClick={() => router.push('/car-rentals/fleet')} className="rounded-lg border border-[#27272A] bg-[#111111] p-2 text-white hover:bg-[#1A1A1A] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{vehicle.name}</h1>
            <p className="text-sm text-[#A1A1AA]">ID: CR-{vehicle.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <Link
          href={`/car-rentals/fleet/${vehicle.id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          <Pencil className="h-4 w-4" />
          Edit Vehicle
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
            <div className="h-48 w-full bg-[#1A1A1A] flex items-center justify-center relative">
              {vehicle.images?.[0] ? (
                <img src={vehicle.images[0]} alt={vehicle.name} className="h-full w-full object-cover" />
              ) : (
                <Car className="h-16 w-16 text-[#27272A]" />
              )}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/90 text-white' :
                  vehicle.status === 'ON_RENT' ? 'bg-blue-500/90 text-white' :
                  'bg-red-500/90 text-white'
                }`}>
                  {vehicle.status.replace('_', ' ')}
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
                  <p className="text-sm font-medium text-white">{vehicle.registrationNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">VIN No</p>
                  <p className="text-sm font-medium text-white">{vehicle.vinNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Year</p>
                  <p className="text-sm font-medium text-white">{vehicle.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Category</p>
                  <p className="text-sm font-medium text-white">{vehicle.category}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Transmission</p>
                  <p className="text-sm font-medium text-white">{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Fuel Type</p>
                  <p className="text-sm font-medium text-white">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Seats</p>
                  <p className="text-sm font-medium text-white">{vehicle.seats}</p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] mb-1">Features</p>
                  <div className="flex gap-2">
                    {vehicle.hasAirConditioning && <span className="inline-flex items-center rounded-full bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-medium text-white border border-[#27272A]">A/C</span>}
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
                <p className="text-lg font-semibold text-white">€{Number(vehicle.pricePerDay).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Weekly Price</p>
                <p className="text-sm font-semibold text-white">€{Number(vehicle.weeklyPrice || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Monthly Price</p>
                <p className="text-sm font-semibold text-white">€{Number(vehicle.monthlyPrice || 0).toFixed(2)}</p>
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
                <span className={`inline-flex h-2 w-2 rounded-full ${vehicle.isSelfPickupAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#A1A1AA]">Supplier Delivery</p>
                <span className={`inline-flex h-2 w-2 rounded-full ${vehicle.isSupplierDeliveryAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">Doorstep Delivery</p>
                <span className={`inline-flex h-2 w-2 rounded-full ${vehicle.isDoorstepDeliveryAllowed ? 'bg-green-500' : 'bg-[#27272A]'}`} />
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
