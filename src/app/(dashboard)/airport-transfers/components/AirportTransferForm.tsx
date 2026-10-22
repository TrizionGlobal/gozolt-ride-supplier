'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  X,
  UploadCloud,
  ChevronDown,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  airportTransfersService,
  AirportTransferVehicle,
} from '@/services/airport-transfers/airport-transfers.service';
import { useAirportTransfersStore } from '@/stores/airport-transfers.store';

interface Props {
  initialData?: AirportTransferVehicle;
}

const CATEGORY_OPTIONS = [
  { value: 'GO_5P', label: 'Go - 5P' },
  { value: 'PREMIUM_5P', label: 'Premium - 5P' },
  { value: 'SUV_7P', label: 'SUV - 7P' },
  { value: 'MINI_VAN_8P', label: 'Mini Van - 8P & Above' },
  { value: 'VAN_8P', label: 'Van - 8P & Above' },
  { value: 'ELECTRIC_5P', label: 'Electric - 5P' },
];


export function AirportTransferForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPlate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

  // Form states matching CarRentalForm
  const [brand, setBrand] = useState(initialData?.make?.toUpperCase() || '');
  const [name, setName] = useState(initialData?.model?.toUpperCase() || '');
  const [category, setCategory] = useState(initialData?.vehicleType || '');
  const [registrationNo, setRegistrationNo] = useState(initialData?.registrationNo || '');
  const [year, setYear] = useState(initialData?.year ? String(initialData.year) : '');
  const [transmission, setTransmission] = useState(
    (initialData as any)?.transmission || 'AUTOMATIC'
  );
  const [fuelType, setFuelType] = useState((initialData as any)?.fuelType || 'DIESEL');
  const [seats, setSeats] = useState<number | ''>(initialData?.passengerCapacity || '');
  const [luggageCapacity, setLuggageCapacity] = useState<number | ''>(
    initialData?.luggageCapacity || ''
  );
  const [pricePerKm, setPricePerKm] = useState<number | ''>(
    initialData?.pricePerKm !== undefined
      ? Number(initialData.pricePerKm)
      : initialData?.fixedPrice !== undefined && Number(initialData.fixedPrice) <= 10
      ? Number(initialData.fixedPrice)
      : 2.50
  );
  const [minPrice, setMinPrice] = useState<number | ''>(
    initialData?.minPrice !== undefined
      ? Number(initialData.minPrice)
      : initialData?.fixedPrice !== undefined && Number(initialData.fixedPrice) > 10
      ? Number(initialData.fixedPrice)
      : 20.00
  );

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [localImages, setLocalImages] = useState<{ file: File; preview: string }[]>([]);

  // Meet & Greet service option (dynamic choice for supplier)
  const [isMeetAndGreetIncluded, setIsMeetAndGreetIncluded] = useState<boolean>(
    initialData?.isMeetAndGreetIncluded ?? true
  );



  const handleSeatsChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 2);
    if (!digits) {
      setSeats('');
      return;
    }
    const num = parseInt(digits, 10);
    if (num > 60) setSeats(60);
    else if (num < 1) setSeats(1);
    else setSeats(num);
  };

  const handleLuggageChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 2);
    if (!digits) {
      setLuggageCapacity('');
      return;
    }
    const num = parseInt(digits, 10);
    if (num > 60) setLuggageCapacity(60);
    else setLuggageCapacity(num);
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

  const handlePricePerKmChange = (val: string) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0] && parts[0].length > 3) {
      cleaned = parts[0].slice(0, 3) + (parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '');
    } else if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }
    if (!cleaned || cleaned === '.') {
      setPricePerKm('');
      return;
    }
    const num = parseFloat(cleaned);
    if (num > 50) {
      setPricePerKm(50);
    } else {
      setPricePerKm(cleaned as any);
    }
  };

  const handleMinPriceChange = (val: string) => {
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
      setMinPrice('');
      return;
    }
    const num = parseFloat(cleaned);
    if (num > 500) {
      setMinPrice(500);
    } else {
      setMinPrice(cleaned as any);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const hasAllowedExt =
      fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

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
    setLocalImages((prev) => [...prev, { file, preview }]);
    e.target.value = '';
  };

  const removeImageUrl = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeLocalImage = (indexToRemove: number) => {
    setLocalImages((prev) => {
      const removed = prev[indexToRemove];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim()) {
      toast.error('Please enter vehicle brand');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter vehicle model');
      return;
    }
    if (!category) {
      toast.error('Please select a vehicle category');
      return;
    }
    if (!registrationNo.trim()) {
      toast.error('Please enter registration plate');
      return;
    }
    if (!year) {
      toast.error('Please enter make year');
      return;
    }
    if (!seats) {
      toast.error('Please enter passenger seat capacity');
      return;
    }
    if (!pricePerKm) {
      toast.error('Please enter rate per kilometer');
      return;
    }
    if (!minPrice) {
      toast.error('Please enter minimum base fare');
      return;
    }
    if (imageUrls.length === 0 && localImages.length === 0) {
      toast.error('Please upload or select at least one vehicle image');
      return;
    }

    try {
      setIsSubmitting(true);

      const dataPayload = {
        make: brand.trim(),
        model: name.trim(),
        vehicleType: category,
        registrationNo: registrationNo.trim().toUpperCase(),
        year: Number(year),
        transmission,
        fuelType,
        passengerCapacity: Number(seats),
        luggageCapacity: Number(luggageCapacity || 0),
        pricePerKm: Number(pricePerKm),
        minPrice: Number(minPrice),
        fixedPrice: Number(minPrice),
        currency: 'EUR',
        freeWaitingMinutes: 60,
        isMeetAndGreetIncluded,
        features: isMeetAndGreetIncluded
          ? ['Meet & Greet', 'Flight Tracking', 'Air Conditioning']
          : ['Flight Tracking', 'Air Conditioning'],
        images: imageUrls,
        status: initialData?.status || 'AVAILABLE',
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(dataPayload));

      if (localImages.length > 0) {
        for (const localImage of localImages) {
          formData.append('images', localImage.file);
        }
      }

      if (initialData?.id) {
        await airportTransfersService.updateVehicle(initialData.id, formData);
        toast.success('Airport transfer vehicle updated successfully');
      } else {
        await airportTransfersService.createVehicle(formData);
        toast.success('Airport transfer vehicle created successfully');
      }

      useAirportTransfersStore.getState().clearFleetCache();
      router.push('/airport-transfers/fleet');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to save vehicle. Please check all fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Basic Information Card */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <h2 className="text-lg font-bold text-white mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Row 1 */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Brand<span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              maxLength={50}
              value={brand}
              onChange={(e) => setBrand(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase transition-colors"
              placeholder="e.g. KIA"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Car Name<span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase transition-colors"
              placeholder="e.g. SPORTAGE"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Category<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${
                  !category ? 'text-[#71717A]' : 'text-white'
                }`}
              >
                <option value="" disabled className="bg-[#18181B] text-[#71717A]">
                  Select Category
                </option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#18181B] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Number Plate / Registration<span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              maxLength={12}
              value={registrationNo}
              onChange={(e) => setRegistrationNo(formatPlate(e.target.value))}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none uppercase font-mono tracking-wider transition-colors"
              placeholder="e.g. GZK707"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Make Year<span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              onBlur={handleYearBlur}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 2023"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Transmission<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${
                  !transmission ? 'text-[#71717A]' : 'text-white'
                }`}
              >
                <option value="AUTOMATIC" className="bg-[#18181B] text-white">
                  Automatic
                </option>
                <option value="MANUAL" className="bg-[#18181B] text-white">
                  Manual
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">
              Fuel Type<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className={`w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 pr-9 text-xs focus:border-[#FACC15] focus:outline-none appearance-none cursor-pointer transition-colors ${
                  !fuelType ? 'text-[#71717A]' : 'text-white'
                }`}
              >
                <option value="DIESEL" className="bg-[#18181B] text-white">
                  Diesel
                </option>
                <option value="PETROL" className="bg-[#18181B] text-white">
                  Petrol
                </option>
                <option value="ELECTRIC" className="bg-[#18181B] text-white">
                  Electric
                </option>
                <option value="HYBRID" className="bg-[#18181B] text-white">
                  Hybrid
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">
                Seats<span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#71717A]">1 - 60 seats</span>
            </div>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={seats}
              onChange={(e) => handleSeatsChange(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[#D4D4D8]">
                Luggage Capacity (Bags)<span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#71717A]">Max 60 bags</span>
            </div>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={luggageCapacity}
              onChange={(e) => handleLuggageChange(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
              placeholder="e.g. 3"
            />
          </div>

          {/* Row 4: Distance Tariff Rate & Minimum Base Fare */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 border-t border-[#27272A]/40">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-[#D4D4D8]">
                  Rate Per KM (€/km)<span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#71717A]">
                  Route distance tariff (e.g. €2.50)
                </span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#FACC15] font-semibold">
                  €
                </span>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  maxLength={6}
                  value={pricePerKm}
                  onChange={(e) => handlePricePerKmChange(e.target.value)}
                  className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] pl-8 pr-14 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
                  placeholder="2.50"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#71717A] font-medium">
                  / km
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-[#D4D4D8]">
                  Minimum Base Fare (€)<span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#71717A]">
                  Trip minimum price floor (e.g. €20.00)
                </span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#FACC15] font-semibold">
                  €
                </span>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  maxLength={6}
                  value={minPrice}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] pl-8 pr-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none transition-colors"
                  placeholder="20.00"
                />
              </div>
            </div>

            <div className="md:col-span-2 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                Formula:{' '}
                <strong className="text-white">
                  max(Min Fare, Distance × Rate/km)
                </strong>
              </span>
              <span className="text-yellow-400 font-medium">
                Example 15 km trip = €
                {Math.max(
                  Number(minPrice || 20),
                  Math.round(15 * Number(pricePerKm || 2.5) * 100) / 100
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Images - Dedicated Gallery matching Car Rental */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Vehicle Images
              <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Upload up to 5 clear photos of your car (JPG, JPEG, PNG up to 15MB each).
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#18181B] border border-[#27272A] px-3 py-1 text-xs font-medium text-[#D4D4D8]">
            <span className="text-[#FACC15] font-semibold">
              {imageUrls.length + localImages.length}
            </span>{' '}
            / 5 images
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-4">
          {/* Existing Remote Images */}
          {imageUrls.map((url, idx) => (
            <div
              key={`remote-${idx}`}
              className="group relative aspect-[4/3] rounded-lg border border-[#27272A] overflow-hidden bg-black/60 flex items-center justify-center"
            >
              <img
                src={url}
                alt={`Vehicle image ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
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
            <div
              key={`local-${idx}`}
              className="group relative aspect-[4/3] rounded-lg border border-[#27272A] overflow-hidden bg-black/60 flex items-center justify-center"
            >
              <img
                src={local.preview}
                alt={`New image ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
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
                disabled={isSubmitting}
              />
            </label>
          )}
        </div>
      </div>

      {/* Transfer Benefits & Meet & Greet Option */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-bold text-white">Transfer Benefits & Services</h2>
          <span className="inline-flex items-center text-[11px] text-[#A1A1AA] bg-[#1A1A1A] border border-[#27272A] px-2.5 py-1 rounded-full w-fit">
            Standard: 60 min waiting & flight monitoring included
          </span>
        </div>
        <p className="text-xs text-[#A1A1AA] mb-4">
          All Gozolt airport transfers automatically include 60 minutes free flight waiting time, live flight delay monitoring, and free 24h cancellation by default. Choose whether this vehicle offers Meet & Greet service.
        </p>

        <label className="flex items-start sm:items-center gap-3 cursor-pointer p-4 rounded-lg border border-[#27272A] bg-[#0A0A0A] hover:border-[#FACC15]/40 transition-colors">
          <input
            type="checkbox"
            checked={isMeetAndGreetIncluded}
            onChange={(e) => setIsMeetAndGreetIncluded(e.target.checked)}
            className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-[#3F3F46] bg-[#0A0A0A] checked:bg-[#FACC15] focus:ring-[#FACC15] accent-[#FACC15]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Include Meet & Greet Service
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Arrival Placard
              </span>
            </div>
            <span className="text-[11px] text-[#71717A] mt-0.5 block">
              Chauffeur waits inside the airport terminal arrival hall with a guest nameboard.
            </span>
          </div>
        </label>
      </div>


      {/* Bottom Save Action Button */}
      <div className="flex justify-end pt-2 pb-10">
        <button
          disabled={isSubmitting}
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50 shadow-lg shadow-[#FACC15]/10"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Save Transfer Vehicle' : 'Add Transfer Vehicle'}
        </button>
      </div>
    </form>
  );
}
