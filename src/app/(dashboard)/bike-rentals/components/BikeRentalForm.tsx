'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bikeRentalsService, BikeRentalBike, ProtectionPackage, Addon, MileagePackage } from '@/services/bike-rentals/bike-rentals.service';
import { useBikeRentalsStore } from '@/stores/bike-rentals.store';

interface Props {
  initialData?: BikeRentalBike;
}

const DEFAULT_PACKAGES: ProtectionPackage[] = [
  {
    title: 'All Inclusive Protection',
    stars: 3,
    deductibleText: 'No deductible',
    deductibleColorHex: '#16a34a',
    pricePerDay: '' as any,
    originalPricePerDay: undefined,
    discountText: undefined,
    valueIdentifier: 'all_inclusive',
    features: {
      'Interior Protection': true,
      'Roadside Protection': true,
      'Tyre & Glass Protection': true,
      'Personal Accident Protection': true,
      'Loss Damage Waiver (including theft protection)': true,
    }
  },
  {
    title: 'Smart Protection',
    stars: 2,
    deductibleText: 'No deductible',
    deductibleColorHex: '#16a34a',
    pricePerDay: '' as any,
    originalPricePerDay: undefined,
    discountText: undefined,
    valueIdentifier: 'smart',
    features: {
      'Interior Protection': true,
      'Roadside Protection': true,
      'Loss Damage Waiver (including theft protection)': true,
    }
  },
  {
    title: 'Basic Protection',
    stars: 1,
    deductibleText: 'Deductible: up to €1,200.00',
    deductibleColorHex: '#111111',
    pricePerDay: '' as any,
    valueIdentifier: 'basic',
    features: {
      'Loss Damage Waiver (including theft protection)': true,
    }
  }
];

export function BikeRentalForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic Details
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [registrationNo, setRegistrationNo] = useState(initialData?.registrationNo || '');
  const [year, setYear] = useState(initialData?.year || '');
  const [transmission, setTransmission] = useState(initialData?.transmission || '');
  const [fuelType, setFuelType] = useState(initialData?.fuelType || '');
  const [seats, setSeats] = useState<number | ''>(initialData?.seats || '');
  const [engineCapacityCc, setEngineCapacityCc] = useState<number | ''>(initialData?.engineCapacityCc || '');
  const [mileage, setMileage] = useState<number | ''>(initialData?.mileage || '');
    const [pricePerDay, setPricePerDay] = useState<number | ''>(initialData?.pricePerDay || '');
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0] || '');
  // Features & Delivery Options
    const [isSelfPickupAllowed, setIsSelfPickupAllowed] = useState(initialData?.isSelfPickupAllowed ?? true);
  const [isSupplierDeliveryAllowed, setIsSupplierDeliveryAllowed] = useState(initialData?.isSupplierDeliveryAllowed ?? false);
  const [isDoorstepDeliveryAllowed, setIsDoorstepDeliveryAllowed] = useState(initialData?.isDoorstepDeliveryAllowed ?? false);


  // Protection Packages
  const [packages, setPackages] = useState<ProtectionPackage[]>(
    initialData?.protectionPackages?.length ? initialData.protectionPackages : DEFAULT_PACKAGES
  );




  const handlePriceChange = (idx: number, field: 'original' | 'percentage', val: string) => {
    const newPkgs = [...packages];
    const pkg = newPkgs[idx];

    let currentPercentage = 0;
    if (pkg.discountText) {
      const match = pkg.discountText.match(/- (\d+)% online discount/);
      if (match) currentPercentage = parseInt(match[1]);
    }

    let newOriginal = pkg.originalPricePerDay || 0;
    let newPercentage = currentPercentage;

    if (field === 'original') {
      newOriginal = val === '' ? 0 : Number(val);
    } else if (field === 'percentage') {
      newPercentage = val === '' ? 0 : Number(val);
    }

    pkg.originalPricePerDay = newOriginal || undefined;

    const finalPrice = newOriginal * (1 - newPercentage / 100);
    pkg.pricePerDay = Number(finalPrice.toFixed(2));

    if (newPercentage > 0) {
      pkg.discountText = `- ${newPercentage}% online discount`;
    } else {
      pkg.discountText = undefined;
    }

    setPackages(newPkgs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name,
        category,
        registrationNo,
        year: String(year),
        transmission,
        fuelType,
        seats: Number(seats),
        engineCapacityCc: engineCapacityCc ? Number(engineCapacityCc) : undefined,
        mileage: mileage ? Number(mileage) : undefined,
                pricePerDay: Number(pricePerDay),
                isSelfPickupAllowed,
        isSupplierDeliveryAllowed,
        isDoorstepDeliveryAllowed,
        images: imageUrl ? [imageUrl] : [],
        protectionPackages: packages
          .filter(pkg => pkg.originalPricePerDay && Number(pkg.originalPricePerDay) > 0)
          .map(pkg => ({
            ...pkg,
            pricePerDay: Number(pkg.pricePerDay) || 0,
            originalPricePerDay: pkg.originalPricePerDay ? Number(pkg.originalPricePerDay) : undefined,
          })),
        mileagePackages: [],
        mileagePackages: [],
      };

      if (initialData?.id) {
        await bikeRentalsService.updateBike(initialData.id, data);
      } else {
        await bikeRentalsService.createBike(data);
      }

      useBikeRentalsStore.getState().clearFleetCache();
      router.push('/bike-rentals/fleet');
      router.refresh();
      toast.success('Bike rental saved successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to save bike rental. Please check all fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePackage = (index: number, field: keyof ProtectionPackage, value: any) => {
    const newPkgs = [...packages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setPackages(newPkgs);
  };


  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Basic Info */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <h2 className="text-lg font-bold text-white mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Bike Name<span className="text-red-500">*</span></label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. Yamaha R1" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Category<span className="text-red-500">*</span></label>
            <select required value={category} onChange={e => setCategory(e.target.value)} className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none appearance-none ${!category ? 'text-[#52525B]' : 'text-white'}`}>
              <option value="" disabled>Select Category</option>
              <option value="COMMUTER_BIKE">Commuter Bike</option>
              <option value="SPORTS_BIKE">Sports Bike</option>
              <option value="CRUISER_BIKE">Cruiser Bike</option>
              <option value="ADVENTURE_BIKE">Adventure Bike</option>
              <option value="PREMIUM_BIKE">Premium Bike</option>
              <option value="ELECTRIC_BIKE">Electric Bike</option>
              <option value="STANDARD_SCOOTER">Standard Scooter</option>
              <option value="ELECTRIC_SCOOTER">Electric Scooter</option>
              <option value="PREMIUM_SCOOTER">Premium Scooter</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Number Plate / Registration<span className="text-red-500">*</span></label>
            <input required type="text" value={registrationNo} onChange={e => setRegistrationNo(e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. ABC 123" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Make Year<span className="text-red-500">*</span></label>
            <input required type="text" value={year} onChange={e => setYear(e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 2024" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Transmission<span className="text-red-500">*</span></label>
            <select required value={transmission} onChange={e => setTransmission(e.target.value)} className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none appearance-none ${!transmission ? 'text-[#52525B]' : 'text-white'}`}>
              <option value="" disabled>Select Transmission</option>
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Fuel Type<span className="text-red-500">*</span></label>
            <select required value={fuelType} onChange={e => setFuelType(e.target.value)} className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none appearance-none ${!fuelType ? 'text-[#52525B]' : 'text-white'}`}>
              <option value="" disabled>Select Fuel Type</option>
              <option value="PETROL">Petrol</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Seats<span className="text-red-500">*</span></label>
            <input required type="number" min="1" max="3" value={seats} onChange={e => setSeats(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 2" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Engine (CC)</label>
            <input type="number" min="0" value={engineCapacityCc} onChange={e => setEngineCapacityCc(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 250" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Mileage (km/l)</label>
            <input type="number" min="0" step="0.1" value={mileage} onChange={e => setMileage(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 35.5" />
          </div>
                    <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Base Price Per Day (€)<span className="text-red-500">*</span></label>
            <input required type="number" min="0" step="0.01" value={pricePerDay} onChange={e => setPricePerDay(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 45.00" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Image URL<span className="text-red-500">*</span></label>
            <input required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="https://..." />
          </div>
        </div>
      </div>


      {/* Features & Delivery Options */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-6">Features & Delivery Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#D4D4D8]">Delivery Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isSelfPickupAllowed} onChange={e => setIsSelfPickupAllowed(e.target.checked)} className="w-4 h-4 rounded border-[#3F3F46] bg-[#0A0A0A] checked:bg-[#FACC15] focus:ring-[#FACC15]" />
              <span className="text-sm text-white">Self Pickup Allowed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isSupplierDeliveryAllowed} onChange={e => setIsSupplierDeliveryAllowed(e.target.checked)} className="w-4 h-4 rounded border-[#3F3F46] bg-[#0A0A0A] checked:bg-[#FACC15] focus:ring-[#FACC15]" />
              <span className="text-sm text-white">Supplier Delivery Allowed</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isDoorstepDeliveryAllowed} onChange={e => setIsDoorstepDeliveryAllowed(e.target.checked)} className="w-4 h-4 rounded border-[#3F3F46] bg-[#0A0A0A] checked:bg-[#FACC15] focus:ring-[#FACC15]" />
              <span className="text-sm text-white">Doorstep Delivery Allowed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Protection Packages</h2>
        </div>
        <div className="space-y-4">
          {packages.map((pkg, idx) => (
            <div key={idx} className="p-4 bg-[#0A0A0A] border border-[#27272A] rounded-lg">

              <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#27272A]">
                <div>
                  <h3 className="text-sm font-bold text-white">{pkg.title}</h3>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3].map((star) => (
                      <span key={star} className={`text-base ${star <= pkg.stars ? 'text-[#FACC15]' : 'text-[#3F3F46]'}`}>★</span>
                    ))}
                    <span className="text-xs text-[#A1A1AA] ml-2">({pkg.stars} Stars)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mt-4">
                {/* Left Side: Inputs */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs text-[#D4D4D8]">Original Price / Day (€)</label>
                      <input type="number" min="0" step="0.01" value={pkg.originalPricePerDay === undefined ? '' : pkg.originalPricePerDay} onChange={e => handlePriceChange(idx, 'original', e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 24.00" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-[#D4D4D8]">Discount Percentage (%)</label>
                      <input type="number" min="0" max="100" value={(() => {
                        let currentPercentage = '';
                        if (pkg.discountText) {
                          const match = pkg.discountText.match(/- (\d+)% online discount/);
                          if (match) currentPercentage = match[1];
                        }
                        return currentPercentage;
                      })()} onChange={e => handlePriceChange(idx, 'percentage', e.target.value)} className="w-full rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none" placeholder="e.g. 25" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs text-[#D4D4D8]">Final Price Per Day (€) (Auto-calculated)</label>
                      <input type="number" step="0.01" value={pkg.pricePerDay || ''} disabled className="w-full rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA] cursor-not-allowed focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Features */}
                <div className="flex-1 md:border-l border-[#27272A] pt-4 md:pt-0 md:pl-6">
                  <h3 className="text-xs font-semibold text-[#D4D4D8] mb-3">Included Features</h3>
                  {Object.keys(pkg.features || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.keys(pkg.features).map((featureName) => (
                        <div key={featureName} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                          <Check className="h-4 w-4 text-[#FACC15] flex-shrink-0" />
                          <span>{featureName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#52525B]">No features included.</div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 pb-10">
        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Bike Rental'}
        </button>
      </div>
    </form>
  );
}
