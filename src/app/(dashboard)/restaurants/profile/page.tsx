'use client';

import { useState, useEffect } from 'react';
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
  Calendar,
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

export default function RestaurantProfilePage() {
  const [activeTab, setActiveTab] = useState<'BUSINESS' | 'DOCUMENTS' | 'BANK' | 'VERIFICATION'>('BUSINESS');
  const [profile, setProfile] = useState<SupplierProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Business Details Form States
  const [name, setName] = useState('Trattoria Bella Napoli');
  const [legalName, setLegalName] = useState('Bella Napoli Hospitality Ltd.');
  const [regNumber, setRegNumber] = useState('C-89104');
  const [vatNumber, setVatNumber] = useState('MT 2491-0382');
  const [contactEmail, setContactEmail] = useState('kitchen@bellanapoli.mt');
  const [phone, setPhone] = useState('+356 2134 7890');
  const [address, setAddress] = useState('42 Republic Street');
  const [city, setCity] = useState('Valletta');
  const [postalCode, setPostalCode] = useState('VLT 1112');
  const [cuisines, setCuisines] = useState('Italian, Woodfired Pizza, Fresh Durum Pasta, Mediterranean');
  const [description, setDescription] = useState(
    'Authentic Neapolitan woodfired pizzas, bronze-die durum wheat pasta, and classic Italian antipasti crafted using imported Campanian ingredients.'
  );

  // Operational Rules
  const [minOrder, setMinOrder] = useState('15.00');
  const [deliveryFee, setDeliveryFee] = useState('2.50');
  const [prepTime, setPrepTime] = useState('20-30 min');

  // Bank Form States
  const [bankName, setBankName] = useState('Bank of Valletta (BOV)');
  const [accountHolder, setAccountHolder] = useState('Bella Napoli Hospitality Ltd.');
  const [iban, setIban] = useState('MT84BOVM22013000000012345678001');
  const [swiftBic, setSwiftBic] = useState('BOVMMTMTXXX');
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');

  // Documents
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      name: 'Food Hygiene & Safety Certificate (HACCP Level 3)',
      file: 'haccp_certificate_2026.pdf',
      status: 'VERIFIED',
      expiry: '31 Dec 2027',
      uploadedAt: '12 Jan 2026',
    },
    {
      id: 'doc-2',
      name: 'Malta Commerce Division Commercial Trade License',
      file: 'trade_license_c89104.pdf',
      status: 'VERIFIED',
      expiry: '15 Aug 2028',
      uploadedAt: '12 Jan 2026',
    },
    {
      id: 'doc-3',
      name: 'MFSA Certificate of Good Standing & VAT Registration',
      file: 'vat_certificate_mt24910382.pdf',
      status: 'VERIFIED',
      expiry: 'Permanent',
      uploadedAt: '12 Jan 2026',
    },
    {
      id: 'doc-4',
      name: 'Commercial Kitchen Public Liability Insurance (€2M Coverage)',
      file: 'liability_insurance_policy.pdf',
      status: 'UNDER_REVIEW',
      expiry: '01 Nov 2026',
      uploadedAt: '02 Feb 2026',
    },
  ]);

  const loadProfile = async () => {
    try {
      const data = await foodGrocerySupplierService.getProfile();
      setProfile(data);
      if (data?.business) {
        if (data.business.name) setName(data.business.name);
        if (data.business.phone) setPhone(data.business.phone);
        if (data.business.address) setAddress(data.business.address);
        if (data.business.city) setCity(data.business.city);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await foodGrocerySupplierService.updateProfile({
        name,
        phone,
        address,
        city,
        minimumOrder: Number(minOrder),
        deliveryFee: Number(deliveryFee),
        estimatedDeliveryTime: prepTime,
      });
      toast.success('Restaurant profile updated successfully', {
        description: 'Changes have been synchronized across all Gozolt customer apps.',
      });
    } catch {
      toast.error('Failed to update restaurant profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <Store className="h-7 w-7 text-[#FCD223]" />
            Restaurant Profile
          </h1>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            Manage business legal identity, compliance documents, SEPA bank payouts, and audit verification status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FCD223] font-bold text-black hover:bg-[#FCD223]/90 text-xs shadow-md shadow-[#FCD223]/10"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* 4 Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('BUSINESS')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap',
            activeTab === 'BUSINESS'
              ? 'bg-[#FCD223] text-black shadow-md shadow-[#FCD223]/10'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          )}
        >
          <Building className="h-3.5 w-3.5" />
          Business Details
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap',
            activeTab === 'DOCUMENTS'
              ? 'bg-[#FCD223] text-black shadow-md shadow-[#FCD223]/10'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Legal Documents
          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('BANK')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap',
            activeTab === 'BANK'
              ? 'bg-[#FCD223] text-black shadow-md shadow-[#FCD223]/10'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          )}
        >
          <Landmark className="h-3.5 w-3.5" />
          Bank &amp; Payouts
        </button>

        <button
          onClick={() => setActiveTab('VERIFICATION')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap',
            activeTab === 'VERIFICATION'
              ? 'bg-[#FCD223] text-black shadow-md shadow-[#FCD223]/10'
              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Verification Status
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: BUSINESS DETAILS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'BUSINESS' && (
        <div className="space-y-6">
          {/* Identity & Legal Info */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Store className="h-4 w-4 text-[#FCD223]" />
              Brand &amp; Legal Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Public Restaurant Display Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Trattoria Bella Napoli"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Registered Corporate Legal Entity *</label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Bella Napoli Hospitality Ltd."
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">MFSA Business Registration No.</label>
                <Input
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="C-XXXXX"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">VAT Identification Number</label>
                <Input
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="MT XXXXXXXX"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-400">Cuisine Tags (comma separated)</label>
                <Input
                  value={cuisines}
                  onChange={(e) => setCuisines(e.target.value)}
                  placeholder="Italian, Woodfired Pizza, Pasta, Mediterranean"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-400">Restaurant Bio / Customer Story</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0A0A0A] p-3 text-xs text-white placeholder-zinc-500 focus:border-[#FCD223] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact & Headquarters Location */}
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FCD223]" />
              Contact &amp; Headquarters Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Main Kitchen Phone *</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+356 2134 7890"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Official Contact Email *</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="kitchen@bellanapoli.mt"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Postal / Zip Code</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="VLT 1112"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-400">Full Street Address *</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="42 Republic Street"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">City / Locality *</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Valletta"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: LEGAL DOCUMENTS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#FCD223]" />
                  Uploaded Regulatory Compliance Documents
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Malta Food Safety Commission and Gozolt merchant verification requirements
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                onClick={() => toast.info('Document upload dialog opened. Select PDF file.')}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Upload New Document
              </Button>
            </div>

            <div className="divide-y divide-white/5">
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-[#18181B] p-2.5 text-[#FCD223]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                        <span>File: <strong className="text-zinc-300">{doc.file}</strong></span>
                        <span>•</span>
                        <span>Expires: <strong className="text-zinc-300">{doc.expiry}</strong></span>
                        <span>•</span>
                        <span>Uploaded: {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {doc.status === 'VERIFIED' ? (
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Under Review
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-white"
                      onClick={() => toast.success(`Downloading ${doc.file}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: BANK & PAYOUT SETTINGS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'BANK' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[#FCD223]" />
              SEPA Bank Payout Information
            </h2>
            <p className="text-xs text-zinc-400">
              Weekly restaurant settlement payouts are directly transferred to this European IBAN
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Account Beneficiary Name *</label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Bella Napoli Hospitality Ltd."
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Bank Name *</label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank of Valletta (BOV)"
                  className="mt-1 border-white/10 bg-[#0A0A0A] text-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-zinc-400">SEPA International Bank Account Number (IBAN) *</label>
                <Input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="MT84BOVM22013000000012345678001"
                  className="mt-1 border-white/10 bg-[#0A0A0A] font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">SWIFT / BIC Code *</label>
                <Input
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value)}
                  placeholder="BOVMMTMTXXX"
                  className="mt-1 border-white/10 bg-[#0A0A0A] font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Payout Settlement Frequency</label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0A0A0A] py-2 px-3 text-xs text-white focus:border-[#FCD223] focus:outline-none"
                >
                  <option value="WEEKLY">Weekly (Every Monday Morning)</option>
                  <option value="BIWEEKLY">Bi-weekly (1st and 15th)</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3 mt-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Bank Account Verified for Direct Payouts</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Micro-deposit verification was completed on 14 Jan 2026. Settlements automatically transfer with automated invoice receipts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: VERIFICATION STATUS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Merchant Audit &amp; Verification Status
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete operational timeline from registration to verified partner status
                </p>
              </div>

              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 font-bold">
                ✓ PARTNER ACCOUNT ACTIVE
              </Badge>
            </div>

            {/* Verification Timeline */}
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {/* Step 1 */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-1 top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Merchant Application Submitted</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Profile, initial dishes, and corporate registration submitted via the Gozolt Partner Onboarding portal.
                  </p>
                  <span className="text-[10px] text-zinc-500">12 Jan 2026, 10:14 CET</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-1 top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Document Compliance &amp; HACCP Verified</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Gozolt Compliance Team audited Food Safety HACCP Level 3 and Commercial Trading permits with Malta Commerce.
                  </p>
                  <span className="text-[10px] text-zinc-500">13 Jan 2026, 14:30 CET</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-1 top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SEPA Bank Account Validated</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    IBAN MT84BOVM22013000000012345678001 verified for European SEPA Credit Transfers.
                  </p>
                  <span className="text-[10px] text-zinc-500">14 Jan 2026, 09:12 CET</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-1 top-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">Account Approved &amp; Live on Gozolt Customer App</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Kitchen terminals, thermal ticket printing, and dispatch radius of 8.5 km unlocked for active online ordering.
                  </p>
                  <span className="text-[10px] text-zinc-500">15 Jan 2026, 11:00 CET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
