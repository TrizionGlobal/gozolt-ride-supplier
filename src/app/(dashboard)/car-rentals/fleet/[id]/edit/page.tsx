'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X } from 'lucide-react';


export default function EditRentalVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    registrationNo: '',
    vinNo: '',
    year: new Date().getFullYear(),
    category: 'GO',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seats: 5,
    luggageCapacity: 2,
    hasAirConditioning: true,
    pricePerDay: 50,
    weeklyPrice: 300,
    monthlyPrice: 1000,
    securityDeposit: 300,
    isSelfPickupAllowed: true,
    isSupplierDeliveryAllowed: false,
    isDoorstepDeliveryAllowed: false,
    images: [] as string[]
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/car-rentals/supplier/vehicles/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || '',
            registrationNo: data.registrationNo || '',
            vinNo: data.vinNo || '',
            year: data.year || new Date().getFullYear(),
            category: data.category || 'GO',
            transmission: data.transmission || 'AUTOMATIC',
            fuelType: data.fuelType || 'PETROL',
            seats: data.seats || 5,
            luggageCapacity: data.luggageCapacity || 2,
            hasAirConditioning: data.hasAirConditioning ?? true,
            pricePerDay: Number(data.pricePerDay) || 0,
            weeklyPrice: Number(data.weeklyPrice) || 0,
            monthlyPrice: Number(data.monthlyPrice) || 0,
            securityDeposit: Number(data.securityDeposit) || 0,
            isSelfPickupAllowed: data.isSelfPickupAllowed ?? true,
            isSupplierDeliveryAllowed: data.isSupplierDeliveryAllowed ?? false,
            isDoorstepDeliveryAllowed: data.isDoorstepDeliveryAllowed ?? false,
            images: data.images || []
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/car-rentals/supplier/vehicles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/car-rentals/fleet');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Rental Vehicle</h1>
        <p className="text-sm text-[#A1A1AA]">Update the configuration of your rental vehicle.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-[#27272A] bg-[#111111] p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-[#27272A] pb-2">Basic Details</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Vehicle Name (Make & Model)</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="e.g. Toyota Yaris"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Category</label>
              <select
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="GO">Go-5P</option>
                <option value="PREMIUM">Premium</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Registration No</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="e.g. MLT1234"
                value={formData.registrationNo}
                onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">VIN No</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="e.g. VIN12345"
                value={formData.vinNo}
                onChange={(e) => setFormData({...formData, vinNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Registration No</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="e.g. MLT1234"
                value={formData.registrationNo}
                onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">VIN No</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="e.g. VIN12345"
                value={formData.vinNo}
                onChange={(e) => setFormData({...formData, vinNo: e.target.value})}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Year</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Year</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Transmission</label>
              <select
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.transmission}
                onChange={(e) => setFormData({...formData, transmission: e.target.value})}
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Fuel Type</label>
              <select
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.fuelType}
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Price Per Day (€)</label>
              <input
                type="number"
                min="0"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({...formData, pricePerDay: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Weekly Price (€)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.weeklyPrice}
                onChange={(e) => setFormData({...formData, weeklyPrice: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Monthly Price (€)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({...formData, monthlyPrice: Number(e.target.value)})}
              />
            </div>

          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Seats</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1">Luggage Capacity</label>
              <input
                type="number"
                min="0"
                required
                className="w-full rounded-lg border border-[#27272A] bg-[#1A1A1A] px-3 py-2 text-white focus:border-[#FACC15] focus:outline-none"
                value={formData.luggageCapacity}
                onChange={(e) => setFormData({...formData, luggageCapacity: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={formData.hasAirConditioning}
                onChange={(e) => setFormData({...formData, hasAirConditioning: e.target.checked})}
                className="rounded border-[#27272A] bg-[#1A1A1A] text-[#FACC15] focus:ring-[#FACC15]"
              />
              Has Air Conditioning
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-[#27272A] bg-[#111111] p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-[#27272A] pb-2">Delivery Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={formData.isSelfPickupAllowed}
                onChange={(e) => setFormData({...formData, isSelfPickupAllowed: e.target.checked})}
                className="rounded border-[#27272A] bg-[#1A1A1A] text-[#FACC15] focus:ring-[#FACC15]"
              />
              Self Pickup Allowed
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={formData.isSupplierDeliveryAllowed}
                onChange={(e) => setFormData({...formData, isSupplierDeliveryAllowed: e.target.checked})}
                className="rounded border-[#27272A] bg-[#1A1A1A] text-[#FACC15] focus:ring-[#FACC15]"
              />
              Supplier Delivery Allowed
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={formData.isDoorstepDeliveryAllowed}
                onChange={(e) => setFormData({...formData, isDoorstepDeliveryAllowed: e.target.checked})}
                className="rounded border-[#27272A] bg-[#1A1A1A] text-[#FACC15] focus:ring-[#FACC15]"
              />
              Doorstep Delivery Allowed
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-[#27272A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#FACC15] px-6 py-2 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
