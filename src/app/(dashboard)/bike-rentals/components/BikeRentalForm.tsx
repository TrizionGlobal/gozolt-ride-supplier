'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, X, Check, Loader2, ChevronDown, UploadCloud, Star, AlertCircle } from 'lucide-react';
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

  const capitalizeWords = (s: string) => s.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
  const formatPlate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  const formatDigits = (s: string) => s.replace(/[^0-9]/g, '').slice(0, 4);

  // Sanitizing numeric handlers to prevent absurd inputs
  const handleEngineCapacityChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (!digits) {
      setEngineCapacityCc('');
      return;
    }
    const num = parseInt(digits, 10);
    setEngineCapacityCc(num > 2500 ? 2500 : num);
  };

  const handleMileageChange = (val: string) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0] && parts[0].length > 3) {
      cleaned = parts[0].slice(0, 3) + (parts[1] !== undefined ? '.' + parts[1].slice(0, 1) : '');
    } else if (parts[1] && parts[1].length > 1) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 1);
    }
    if (!cleaned || cleaned === '.') {
      setMileage('');
      return;
    }
    const num = parseFloat(cleaned);
    if (num > 150) {
      setMileage(150);
    } else {
      setMileage(cleaned as any);
    }
  };

  const handlePricePerDayChange = (val: string) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0] && parts[0].length > 4) {
      cleaned = parts[0].slice(0, 4) + (parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '');
    } else if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }
    if (!cleaned || cleaned === '.') {
      setPricePerDay('');
      return;
    }
    const num = parseFloat(cleaned);
    if (num > 5000) {
      setPricePerDay(5000);
    } else {
      setPricePerDay(cleaned as any);
    }
  };

  const handleSeatsChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 1);
    if (!digits) {
      setSeats('');
      return;
    }
    const num = parseInt(digits, 10);
    if (num > 3) setSeats(3);
    else if (num < 1) setSeats(1);
    else setSeats(num);
  };

  const handleYearChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(digits);
  };

  const handleYearBlur = () => {
    if (year) {
      const currentYear = new Date().getFullYear();
      const num = parseInt(String(year), 10);
      if (num > currentYear + 1) {
        setYear(String(currentYear + 1));
        toast.info(`Year adjusted to maximum allowed (${currentYear + 1})`);
      }
    }
  };

  // Basic Details
  const [name, setName] = useState(initialData?.name?.toUpperCase() || '');
  const [brand, setBrand] = useState(initialData?.brand?.toUpperCase() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [registrationNo, setRegistrationNo] = useState(initialData?.registrationNo || '');
  const [year, setYear] = useState(initialData?.year || '');
  const [transmission, setTransmission] = useState(initialData?.transmission || '');
  const [fuelType, setFuelType] = useState(initialData?.fuelType || '');
  const [seats, setSeats] = useState<number | ''>(initialData?.seats || '');
  const [engineCapacityCc, setEngineCapacityCc] = useState<number | ''>(initialData?.engineCapacityCc || '');
  const [mileage, setMileage] = useState<number | ''>(initialData?.mileage || '');
  const [pricePerDay, setPricePerDay] = useState<number | ''>(initialData?.pricePerDay || '');
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [localImages, setLocalImages] = useState<{file: File, preview: string}[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const hasAllowedExt = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

    if (!allowedMimeTypes.includes(file.type) || !hasAllowedExt) {
      toast.error('Only JPG, JPEG, and PNG images are allowed');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size must be less than 15MB');
      return;
    }

    if (imageUrls.length + localImages.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalImages(prev => [...prev, { file, preview }]);
    e.target.value = '';
  };

  const removeImageUrl = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeLocalImage = (indexToRemove: number) => {
    setLocalImages(prev => {
      const removed = prev[indexToRemove];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Features & Delivery Options
  const [isSelfPickupAllowed, setIsSelfPickupAllowed] = useState(initialData?.isSelfPickupAllowed ?? true);
  const [isSupplierDeliveryAllowed, setIsSupplierDeliveryAllowed] = useState(initialData?.isSupplierDeliveryAllowed ?? false);
  const [isDoorstepDeliveryAllowed, setIsDoorstepDeliveryAllowed] = useState(initialData?.isDoorstepDeliveryAllowed ?? false);

  // Protection Packages
  const getInitialPackages = (): ProtectionPackage[] => {
    if (!initialData?.protectionPackages?.length) return DEFAULT_PACKAGES;
    return DEFAULT_PACKAGES.map(defPkg => {
      const existing = initialData.protectionPackages?.find(
        p => p.title?.toLowerCase() === defPkg.title?.toLowerCase() || p.valueIdentifier === defPkg.valueIdentifier
      );
      if (!existing) return defPkg;
      const origNum = Number(existing.originalPricePerDay);
      return {
        ...defPkg,
        ...existing,
        originalPricePerDay: !isNaN(origNum) && origNum > 0 ? origNum : undefined,
      };
    });
  };

  const [packages, setPackages] = useState<ProtectionPackage[]>(getInitialPackages);

  interface PackageInputState {
    originalPrice: string;
    discountPercentage: string;
  }

  const [packageInputs, setPackageInputs] = useState<PackageInputState[]>(() => {
    const list = getInitialPackages();
    return list.map(pkg => {
      let disc = '';
      if (pkg.discountText) {
        const match = pkg.discountText.match(/- (\d+(?:\.\d+)?)% online discount/);
        if (match) disc = match[1];
      }
      return {
        originalPrice: pkg.originalPricePerDay !== undefined && pkg.originalPricePerDay !== null ? String(pkg.originalPricePerDay) : '',
        discountPercentage: disc,
      };
    });
  });

  const calculateFinalPrice = (origStr: string, discStr: string): string => {
    if (!origStr || origStr.trim() === '') return '';
    const origNum = parseFloat(origStr);
    if (isNaN(origNum) || origNum < 0 || origNum > 100) return '';

    const discNum = parseFloat(discStr);
    const validDisc = !isNaN(discNum) && discNum >= 0 && discNum <= 100 ? discNum : 0;

    if (validDisc === 100) return '0';

    const finalVal = Number((origNum * (1 - validDisc / 100)).toFixed(2));
    return String(finalVal);
  };

  const getPackagePriceError = (val: string) => {
    if (!val || val.trim() === '') return null;
    const num = parseFloat(val);
    if (isNaN(num)) return 'Please enter a valid price';
    if (num < 0) return 'Price cannot be less than €0.00';
    if (num > 100) return 'Price cannot exceed €100.00';
    return null;
  };

  const getPackageDiscountError = (val: string) => {
    if (!val || val.trim() === '') return null;
    const num = parseFloat(val);
    if (isNaN(num)) return 'Please enter a valid percentage';
    if (num < 0) return 'Discount cannot be less than 0%';
    if (num > 100) return 'Discount cannot exceed 100%';
    return null;
  };

  const handlePackageInputChange = (idx: number, field: 'originalPrice' | 'discountPercentage', rawValue: string) => {
    const updatedInputs = [...packageInputs];
    updatedInputs[idx] = {
      ...updatedInputs[idx],
      [field]: rawValue,
    };
    setPackageInputs(updatedInputs);

    const origStr = updatedInputs[idx].originalPrice.trim();
    const discStr = updatedInputs[idx].discountPercentage.trim();

    const origNum = parseFloat(origStr);
    const discNum = parseFloat(discStr);

    const finalStr = calculateFinalPrice(origStr, discStr);
    const finalPrice = finalStr !== '' ? Number(finalStr) : undefined;

    const updatedPackages = [...packages];
    updatedPackages[idx] = {
      ...updatedPackages[idx],
      originalPricePerDay: origStr !== '' && !isNaN(origNum) ? origNum : undefined,
      pricePerDay: finalPrice !== undefined ? finalPrice : ('' as any),
      discountText: discStr !== '' && !isNaN(discNum) && discNum > 0 && discNum <= 100 ? `- ${discNum}% online discount` : undefined,
    };
    setPackages(updatedPackages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageUrls.length === 0 && localImages.length === 0) {
      toast.error('Please upload at least one vehicle image');
      return;
    }

    for (let i = 0; i < packageInputs.length; i++) {
      const origErr = getPackagePriceError(packageInputs[i].originalPrice);
      if (origErr) {
        toast.error(`${packages[i].title}: ${origErr}`);
        return;
      }
      const discErr = getPackageDiscountError(packageInputs[i].discountPercentage);
      if (discErr) {
        toast.error(`${packages[i].title}: ${discErr}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const data = {
        name,
        brand: brand || undefined,
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
        images: imageUrls,
        protectionPackages: packages
          .filter((_, idx) => {
            const orig = parseFloat(packageInputs[idx]?.originalPrice ?? '');
            return !isNaN(orig) && orig > 0 && orig <= 100;
          })
          .map((pkg, idx) => {
            const finalStr = calculateFinalPrice(packageInputs[idx].originalPrice, packageInputs[idx].discountPercentage);
            const origNum = parseFloat(packageInputs[idx].originalPrice);
            const discNum = parseFloat(packageInputs[idx].discountPercentage);
            return {
              ...pkg,
              originalPricePerDay: origNum,
              pricePerDay: finalStr !== '' ? Number(finalStr) : 0,
              discountText: !isNaN(discNum) && discNum > 0 && discNum <= 100 ? `- ${discNum}% online discount` : undefined,
            };
          }),
        mileagePackages: [],
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      if (localImages.length > 0) {
        for (const localImage of localImages) {
          formData.append('images', localImage.file);
        }
      }

      if (initialData?.id) {
        await bikeRentalsService.updateBike(initialData.id, formData);
      } else {
        await bikeRentalsService.createBike(formData);
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

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Basic Info */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <h2 className="text-lg font-bold text-white mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Row 1 */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Brand<span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              maxLength={50}
              value={brand}
              onChange={e => setBrand(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase transition-colors"
              placeholder="e.g. YAMAHA"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Bike Name<span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              maxLength={50}
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase transition-colors"
              placeholder="e.g. YAMAHA R1"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Category<span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${!category ? 'text-[#71717A]' : 'text-white'}`}
              >
                <option value="" disabled className="bg-[#18181B] text-[#71717A]">Select Category</option>
                <option value="COMMUTER_BIKE" className="bg-[#18181B] text-white">Commuter Bike</option>
                <option value="SPORTS_BIKE" className="bg-[#18181B] text-white">Sports Bike</option>
                <option value="CRUISER_BIKE" className="bg-[#18181B] text-white">Cruiser Bike</option>
                <option value="ADVENTURE_BIKE" className="bg-[#18181B] text-white">Adventure Bike</option>
                <option value="PREMIUM_BIKE" className="bg-[#18181B] text-white">Premium Bike</option>
                <option value="ELECTRIC_BIKE" className="bg-[#18181B] text-white">Electric Bike</option>
                <option value="STANDARD_SCOOTER" className="bg-[#18181B] text-white">Standard Scooter</option>
                <option value="ELECTRIC_SCOOTER" className="bg-[#18181B] text-white">Electric Scooter</option>
                <option value="PREMIUM_SCOOTER" className="bg-[#18181B] text-white">Premium Scooter</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Number Plate / Registration<span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              maxLength={12}
              value={registrationNo}
              onChange={e => setRegistrationNo(formatPlate(e.target.value))}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase font-mono tracking-wider transition-colors"
              placeholder="e.g. ABC 123"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Make Year<span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={year}
              onChange={e => handleYearChange(e.target.value)}
              onBlur={handleYearBlur}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 2024"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Transmission<span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                required
                value={transmission}
                onChange={e => setTransmission(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${!transmission ? 'text-[#71717A]' : 'text-white'}`}
              >
                <option value="" disabled className="bg-[#18181B] text-[#71717A]">Select Transmission</option>
                <option value="AUTOMATIC" className="bg-[#18181B] text-white">Automatic</option>
                <option value="MANUAL" className="bg-[#18181B] text-white">Manual</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>

          {/* Row 3: Performance Specs (3 columns) */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Fuel Type<span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                required
                value={fuelType}
                onChange={e => setFuelType(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${!fuelType ? 'text-[#71717A]' : 'text-white'}`}
              >
                <option value="" disabled className="bg-[#18181B] text-[#71717A]">Select Fuel Type</option>
                <option value="PETROL" className="bg-[#18181B] text-white">Petrol</option>
                <option value="ELECTRIC" className="bg-[#18181B] text-white">Electric</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">Engine Capacity (CC)</label>
              <span className="text-[10px] text-[#71717A]">Max 2,500 cc</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={engineCapacityCc}
              onChange={e => handleEngineCapacityChange(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 125"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">Mileage (km/l)</label>
              <span className="text-[10px] text-[#71717A]">Max 150 km/l</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              maxLength={5}
              value={mileage}
              onChange={e => handleMileageChange(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 35.5"
            />
          </div>

          {/* Row 4: Capacity & Daily Base Rate (3 columns total) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">Seats<span className="text-red-500">*</span></label>
              <span className="text-[10px] text-[#71717A]">1 - 3 seats</span>
            </div>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={seats}
              onChange={e => handleSeatsChange(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 2"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">Base Price Per Day (€)<span className="text-red-500">*</span></label>
              <span className="text-[10px] text-[#71717A]">Standard daily rental rate (Max €5,000.00)</span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#FACC15] font-semibold">€</span>
              <input
                required
                type="text"
                inputMode="decimal"
                maxLength={7}
                value={pricePerDay}
                onChange={e => handlePricePerDayChange(e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] pl-8 pr-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
                placeholder="45.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Images - Dedicated Gallery */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Vehicle Images
              <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Upload up to 5 clear photos of your bike (JPG, JPEG, PNG up to 15MB each).
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#18181B] border border-[#27272A] px-3 py-1 text-xs font-medium text-[#D4D4D8]">
            <span className="text-[#FACC15] font-semibold">{imageUrls.length + localImages.length}</span> / 5 images
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* Existing Remote Images */}
          {imageUrls.map((url, idx) => (
            <div key={`remote-${idx}`} className="group relative aspect-[4/3] rounded-lg border border-[#27272A] overflow-hidden bg-black/60 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Bike image ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <button
                type="button"
                onClick={() => removeImageUrl(idx)}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/75 p-1 text-[#A1A1AA] hover:text-red-400 hover:bg-black transition-colors"
                disabled={isSubmitting}
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Local Newly Selected Images */}
          {localImages.map((local, idx) => (
            <div key={`local-${idx}`} className="group relative aspect-[4/3] rounded-lg border border-[#27272A] overflow-hidden bg-black/60 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={local.preview} alt={`New image ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <button
                type="button"
                onClick={() => removeLocalImage(idx)}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/75 p-1 text-[#A1A1AA] hover:text-red-400 hover:bg-black transition-colors"
                disabled={isSubmitting}
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Upload Button Box if < 5 */}
          {imageUrls.length + localImages.length < 5 && (
            <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-lg border-2 border-dashed border-[#3F3F46] bg-[#0A0A0A] hover:bg-[#18181B] hover:border-[#FACC15] cursor-pointer transition-all p-3 text-center group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181B] group-hover:bg-[#FACC15]/10 mb-2 transition-colors">
                <UploadCloud className="h-4 w-4 text-[#A1A1AA] group-hover:text-[#FACC15] transition-colors" />
              </div>
              <span className="text-xs font-medium text-white group-hover:text-[#FACC15] transition-colors">
                Upload Image
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">JPG, JPEG, PNG up to 15MB</span>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, image/jpeg, image/png"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploadingImage || isSubmitting}
              />
            </label>
          )}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs text-[#D4D4D8]">Original Price / Day (€)</label>
                        <span className="text-[10px] text-[#71717A]">Min €0 - Max €100</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={packageInputs[idx]?.originalPrice ?? ''}
                        onChange={e => handlePackageInputChange(idx, 'originalPrice', e.target.value)}
                        className={`w-full rounded-lg border ${
                          getPackagePriceError(packageInputs[idx]?.originalPrice ?? '')
                            ? 'border-red-500/80 focus:border-red-500 ring-1 ring-red-500/20'
                            : 'border-[#3F3F46] focus:border-[#FACC15]'
                        } bg-[#111111] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:outline-none transition-colors`}
                        placeholder="e.g. 24.00"
                      />
                      {getPackagePriceError(packageInputs[idx]?.originalPrice ?? '') && (
                        <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 inline flex-shrink-0" />
                          {getPackagePriceError(packageInputs[idx]?.originalPrice ?? '')}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs text-[#D4D4D8]">Discount Percentage (%)</label>
                        <span className="text-[10px] text-[#71717A]">0% - 100%</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={packageInputs[idx]?.discountPercentage ?? ''}
                        onChange={e => handlePackageInputChange(idx, 'discountPercentage', e.target.value)}
                        className={`w-full rounded-lg border ${
                          getPackageDiscountError(packageInputs[idx]?.discountPercentage ?? '')
                            ? 'border-red-500/80 focus:border-red-500 ring-1 ring-red-500/20'
                            : 'border-[#3F3F46] focus:border-[#FACC15]'
                        } bg-[#111111] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:outline-none transition-colors`}
                        placeholder="e.g. 25"
                      />
                      {getPackageDiscountError(packageInputs[idx]?.discountPercentage ?? '') && (
                        <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 inline flex-shrink-0" />
                          {getPackageDiscountError(packageInputs[idx]?.discountPercentage ?? '')}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs text-[#D4D4D8]">Final Price Per Day (€) (Auto-calculated)</label>
                      <input
                        type="text"
                        value={calculateFinalPrice(packageInputs[idx]?.originalPrice ?? '', packageInputs[idx]?.discountPercentage ?? '')}
                        disabled
                        className="w-full rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-2 text-xs text-[#A1A1AA] cursor-not-allowed focus:outline-none font-medium"
                        placeholder="Auto-calculated"
                      />
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
