'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Euro,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  RefreshCw,
  FileText,
  Landmark,
  ShieldCheck,
  Upload,
  AlertTriangle,
  Building,
  Check,
  Loader2,
  Tag,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  foodGrocerySupplierService,
  type SupplierProfileResponse,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function GroceryStoreProfilePage() {
  const [activeTab, setActiveTab] = useState<'STORE' | 'DOCUMENTS' | 'BANK' | 'VERIFICATION'>('STORE');
  const [profile, setProfile] = useState<SupplierProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Store Details Form States
  const [name, setName] = useState('Valletta Gourmet Supermarket');
  const [legalName, setLegalName] = useState('Valletta Retail & Provisions Ltd.');
  const [storeType, setStoreType] = useState('SUPERMARKET');
  const [regNumber, setRegNumber] = useState('C-94218');
  const [vatNumber, setVatNumber] = useState('MT 2894-1102');
  const [contactEmail, setContactEmail] = useState('manager@vallettasupermarket.mt');
  const [phone, setPhone] = useState('+356 2122 8400');
  const [address, setAddress] = useState('88 Merchants Street');
  const [city, setCity] = useState('Valletta');
  const [postalCode, setPostalCode] = useState('VLT 1174');
  const [departments, setDepartments] = useState('Fresh Produce, Dairy & Eggs, Artisan Bakery, Pantry & Dry Goods, Beverages, Household');
  const [description, setDescription] = useState(
    'Premier local supermarket stocking Mediterranean organic produce, fresh dairy, artisan bakery items, imported European pantry staples, and everyday home essentials with express courier dispatch.'
  );
  const [storeBannerUrl, setStoreBannerUrl] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80');

  // File upload ref & helper
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const capitalizeFirst = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format', {
        description: 'Please select an image file (PNG, JPG, WEBP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreBannerUrl(reader.result);
        toast.success('Supermarket storefront banner uploaded', { description: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  // Operational Rules
  const [minOrder, setMinOrder] = useState('15.00');
  const [deliveryFee, setDeliveryFee] = useState('2.50');
  const [pickingTime, setPickingTime] = useState('15-25 min');

  // Bank Form States
  const [bankName, setBankName] = useState('Bank of Valletta (BOV)');
  const [accountHolder, setAccountHolder] = useState('Valletta Retail & Provisions Ltd.');
  const [iban, setIban] = useState('MT84BOVM22013000000049281729001');
  const [swiftBic, setSwiftBic] = useState('BOVMMTMTXXX');
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');

  // Documents
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      name: 'Malta Food Safety & Hygiene Certification (Supermarket Retail)',
      file: 'food_safety_supermarket_2026.pdf',
      status: 'VERIFIED',
      expiry: '14 Oct 2027',
      uploadedAt: '10 Jan 2026',
    },
    {
      id: 'doc-2',
      name: 'Malta Commerce Division Commercial Grocery Retail License',
      file: 'trade_license_c94218.pdf',
      status: 'VERIFIED',
      expiry: '20 Sep 2028',
      uploadedAt: '10 Jan 2026',
    },
    {
      id: 'doc-3',
      name: 'MFSA Certificate of Good Standing & VAT Registration',
      file: 'vat_certificate_mt28941102.pdf',
      status: 'VERIFIED',
      expiry: 'Permanent',
      uploadedAt: '10 Jan 2026',
    },
    {
      id: 'doc-4',
      name: 'Commercial Supermarket Premises & Public Liability Insurance (€2.5M)',
      file: 'supermarket_liability_policy.pdf',
      status: 'VERIFIED',
      expiry: '30 Nov 2026',
      uploadedAt: '15 Jan 2026',
    },
  ]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await foodGrocerySupplierService.getProfile();
      setProfile(res);
      if (res?.business) {
        setName(res.business.name || 'Valletta Gourmet Supermarket');
        setAddress(res.business.address || '88 Merchants Street');
        setCity(res.business.city || 'Valletta');
        if (res.business.phone) setPhone(res.business.phone);
      }
    } catch (err) {
      console.error('Failed to load grocery profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await foodGrocerySupplierService.updateProfile({
        name,
        address,
        city,
        phone,
        departments,
        description,
        minOrder: parseFloat(minOrder) || 15,
        pickingTime,
      });

      toast.success('Store profile updated successfully', {
        description: 'Changes have been synchronized across the GOZOLT customer network.',
      });
    } catch (err) {
      console.error('Failed to save store profile:', err);
      toast.error('Failed to update store profile', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-[#FCD223]">Store Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Store Profile & Compliance
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Verified Supermarket Partner
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Manage supermarket identity, department categories, trade licenses, and SEPA banking payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadProfile}
            disabled={isLoading || isSaving}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/10 bg-[#121214] text-[#A1A1AA] hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin text-[#FCD223]')} />
            Refresh
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="rounded-xl bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          NAVIGATION TABS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
        {[
          { key: 'STORE', label: 'Store Details & Operations', icon: Store },
          { key: 'DOCUMENTS', label: 'Trade Licenses & Certificates', icon: FileText },
          { key: 'BANK', label: 'SEPA Banking & Payouts', icon: Landmark },
          { key: 'VERIFICATION', label: 'KYC & Platform Audit', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap rounded-t-lg',
                isActive
                  ? 'border-[#FCD223] text-[#FCD223] bg-white/[0.03]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white hover:bg-white/[0.01]'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: STORE DETAILS & OPERATIONS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'STORE' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Supermarket Brand Identity */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Building className="h-4 w-4 text-[#FCD223]" />
              Supermarket Identity & Public Branding
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Store Display Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(capitalizeFirst(e.target.value))}
                  maxLength={60}
                  placeholder="Enter Store Display Name"
                  className="bg-[#18181B] border-white/10 text-white capitalize rounded-xl focus:border-[#FCD223]"
                  required
                />
                <p className="text-[11px] text-[#71717A] mt-1">Displayed to shoppers on the GOZOLT mobile app ({name.length}/60 chars)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Store Format / Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-sm focus:border-[#FCD223] focus:outline-none"
                >
                  <option value="SUPERMARKET">Supermarket & Fresh Market</option>
                  <option value="ORGANIC_MARKET">Organic & Health Food Store</option>
                  <option value="GOURMET_DELI">Gourmet Grocery & Delicatessen</option>
                  <option value="CONVENIENCE">Express Convenience Store</option>
                  <option value="BAKERY_PANTRY">Artisan Bakery & Pantry</option>
                </select>
                <p className="text-[11px] text-[#71717A] mt-1">Defines marketplace filtering and category sorting</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Registered Legal Entity Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  maxLength={80}
                  placeholder="Enter Registered Legal Entity Name"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  required
                />
                <p className="text-[11px] text-[#71717A] mt-1">Official corporate entity on trade documents</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                    MFSA Company Reg. No.
                  </label>
                  <Input
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    maxLength={20}
                    placeholder="Enter MFSA Reg. No."
                    className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                    Malta VAT Number
                  </label>
                  <Input
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    maxLength={20}
                    placeholder="Enter Malta VAT Number"
                    className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  />
                </div>
              </div>
            </div>

            {/* Storefront Cover Banner Upload */}
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between mb-1.5">
                <span>Storefront Cover Banner & Branding</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP (Max 5MB)</span>
              </label>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleBannerUpload}
              />

              {storeBannerUrl ? (
                <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 space-y-3">
                  <div className="h-44 w-full rounded-lg overflow-hidden border border-white/5 relative bg-black/40">
                    <img src={storeBannerUrl} alt="Store banner preview" className="h-full w-full object-cover" />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-medium border border-white/10">
                      Live Storefront Banner
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bannerInputRef.current?.click()}
                      className="border-white/10 text-xs text-white hover:bg-white/5 h-8 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
                      Change Store Banner
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStoreBannerUrl('')}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#18181B]/60 p-6 text-center hover:border-[#FCD223]/50 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCD223]/10 text-[#FCD223] group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-white group-hover:text-[#FCD223] transition-colors">
                    Click to upload storefront header banner
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    PNG, JPG or WEBP (rec. 1200×400px widescreen, max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Key Departments & Specialty Aisles
              </label>
              <Input
                value={departments}
                onChange={(e) => setDepartments(e.target.value)}
                maxLength={120}
                placeholder="Enter Key Departments"
                className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
              />
              <p className="text-[11px] text-[#71717A] mt-1">Comma-separated tags shown as search badges on your store profile</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Supermarket Bio & Customer Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Enter Store Description, Local Sourcing & Packaging Standards..."
                className="w-full p-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-xs placeholder:text-xs focus:border-[#FCD223] focus:outline-none resize-none"
              />
              <div className="flex justify-between text-[11px] text-[#71717A] mt-1">
                <span>Helps shoppers discover what makes your supermarket special</span>
                <span>{description.length}/300 chars</span>
              </div>
            </div>
          </div>

          {/* Physical Location & Contact */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FCD223]" />
              Physical Store Location & Courier Counter
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Street Address & Unit / Bay <span className="text-red-400">*</span>
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={100}
                  placeholder="Enter Street Address & Unit / Bay"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  required
                />
                <p className="text-[11px] text-[#71717A] mt-1">Where couriers arrive to collect packed grocery bags</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Locality / City <span className="text-red-400">*</span>
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={40}
                  placeholder="Enter City / Locality"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Postal Code
                </label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={12}
                  placeholder="Enter Postal Code"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Store Operations Contact Phone <span className="text-red-400">*</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="Enter Contact Phone Number"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Direct Dispatch Email <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  maxLength={60}
                  placeholder="Enter Direct Dispatch Email"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Operational Ordering Rules */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#FCD223]" />
              Supermarket Basket Rules & Picking SLA
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Minimum Basket Value (€) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#A1A1AA] font-bold">€</span>
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="bg-[#18181B] border-white/10 text-white pl-8 rounded-xl focus:border-[#FCD223]"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#71717A] mt-1">Shoppers must meet this cart total to complete checkout</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Base Delivery Fee (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#A1A1AA] font-bold">€</span>
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    max="20"
                    placeholder="0.00"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="bg-[#18181B] border-white/10 text-white pl-8 rounded-xl focus:border-[#FCD223]"
                  />
                </div>
                <p className="text-[11px] text-[#71717A] mt-1">Automated courier dispatch base allocation</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Standard Picking & Bagging SLA <span className="text-red-400">*</span>
                </label>
                <select
                  value={pickingTime}
                  onChange={(e) => setPickingTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#18181B] border border-white/10 text-white text-sm focus:border-[#FCD223] focus:outline-none"
                >
                  <option value="10-15 min">Express (10–15 mins)</option>
                  <option value="15-25 min">Standard Grocery (15–25 mins)</option>
                  <option value="25-35 min">Large Supermarket Cart (25–35 mins)</option>
                </select>
                <p className="text-[11px] text-[#71717A] mt-1">Calibrates driver dispatch and customer ETA countdown</p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: TRADE LICENSES & CERTIFICATES
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#FCD223]" />
                  Regulatory Trade Documentation & Safety Compliance
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Verified supermarket commercial documents audited by the GOZOLT Compliance Division.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10"
                onClick={() => toast.info('Document upload dialog ready', { description: 'Select PDF certificate from your device.' })}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5 text-[#FCD223]" />
                Upload New Document
              </Button>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-white/10 bg-[#18181B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{doc.name}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        File: <span className="font-mono text-white/80">{doc.file}</span> • Uploaded: {doc.uploadedAt}
                      </p>
                      <p className="text-[11px] text-[#71717A] mt-0.5">Valid through: {doc.expiry}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      {doc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: SEPA BANKING & PAYOUTS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'BANK' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#FCD223]" />
                SEPA Bank Account for Automated Revenue Settlements
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Earnings from mobile customer orders are disbursed directly to your Maltese corporate bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Financial Institution / Bank <span className="text-red-400">*</span>
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  maxLength={60}
                  placeholder="Enter Bank Name"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  Account Beneficiary Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  maxLength={80}
                  placeholder="Enter Account Beneficiary Name"
                  className="bg-[#18181B] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  SEPA IBAN (International Bank Account Number) <span className="text-red-400">*</span>
                </label>
                <Input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  maxLength={34}
                  placeholder="Enter SEPA IBAN"
                  className="bg-[#18181B] border-white/10 text-white font-mono rounded-xl focus:border-[#FCD223]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                  SWIFT / BIC Code <span className="text-red-400">*</span>
                </label>
                <Input
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value)}
                  maxLength={11}
                  placeholder="Enter SWIFT / BIC Code"
                  className="bg-[#18181B] border-white/10 text-white font-mono rounded-xl focus:border-[#FCD223]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Automated Settlement Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  { id: 'WEEKLY', label: 'Weekly SEPA Transfer', desc: 'Disbursed every Monday morning' },
                  { id: 'BIWEEKLY', label: 'Bi-Weekly Transfer', desc: 'Disbursed on 1st & 15th of month' },
                ].map((sched) => (
                  <div
                    key={sched.id}
                    onClick={() => setPayoutSchedule(sched.id)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all',
                      payoutSchedule === sched.id
                        ? 'border-[#FCD223] bg-[#FCD223]/10 text-white'
                        : 'border-white/10 bg-[#18181B] text-[#A1A1AA] hover:border-white/20'
                    )}
                  >
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      {sched.label}
                      {payoutSchedule === sched.id && <Check className="h-3.5 w-3.5 text-[#FCD223]" />}
                    </p>
                    <p className="text-[11px] text-[#71717A] mt-0.5">{sched.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: KYC & PLATFORM AUDIT
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-lg space-y-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Merchant Verification & Regulatory Status
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Overview of your store&apos;s legal standing and consumer protection accreditation on the GOZOLT network.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Account Standing</p>
                <p className="text-lg font-black text-white">Active & Fully Verified</p>
                <p className="text-[11px] text-emerald-400/80">All KYC checks passed</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-1">
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Customer App Status</p>
                <p className="text-lg font-black text-[#FCD223]">Publicly Listed</p>
                <p className="text-[11px] text-[#71717A]">Valletta delivery perimeter active</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-1">
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Next Audit Review</p>
                <p className="text-lg font-black text-white">10 Jan 2027</p>
                <p className="text-[11px] text-[#71717A]">Annual compliance review</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
