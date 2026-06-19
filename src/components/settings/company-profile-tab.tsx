'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';
import type { CompanyProfile } from '@/types';
import { ImageCropperModal } from '@/components/ui/image-cropper-modal';
import { Camera } from 'lucide-react';
import { Upload, Image } from 'antd';
import type { UploadFile } from 'antd';
import { useAuthStore } from '@/stores/auth.store';

export function CompanyProfileTab() {
  const [form, setForm] = useState<CompanyProfile>({
    companyName: '',
    registrationNumber: '',
    vatNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    defaultDriverCommission: 0,
    logoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      setForm({
        companyName: user.companyName || '',
        registrationNumber: user.registrationNo || '',
        vatNumber: user.vatNumber || '',
        email: user.email || '',
        phone: user.contactPhone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        defaultDriverCommission: user.defaultDriverCommission || 0,
        logoUrl: user.logoUrl || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    for (const field of fields) {
      if (field.key === 'phone') {
        const match = form.phone?.match(/^(\+\d{1,4})\s?(.*)$/);
        const number = match ? match[2] : form.phone;
        if (!number || number.trim() === '') {
          toast.error(`${field.label} is required`);
          return;
        }
      } else if (!form[field.key]) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    if (!form.logoUrl) {
      toast.error('Company Logo is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        companyName: form.companyName,
        contactPhone: form.phone,
        vatNumber: form.vatNumber,
        registrationNo: form.registrationNumber,
        address: form.address,
        city: form.city,
        country: form.country,
        postalCode: form.postalCode,
        logoUrl: form.logoUrl,
      };
      const response = await settingsService.updateCompanyProfile(payload as any) as any;
      if (user && response) {
        setUser({ ...user, ...response });
      }
      toast.success('Company profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropperImageSrc(reader.result?.toString() || null);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBase64: string) => {
    handleChange('logoUrl', croppedImageBase64);
    setIsCropperOpen(false);
    setCropperImageSrc(null);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-start justify-between mb-8 border-b border-[#27272A] pb-6">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-[#27272A] animate-pulse" />
            <div className="h-4 w-72 rounded bg-[#27272A] animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-[104px] w-[104px] rounded-full bg-[#27272A] animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1.5 h-4 w-24 rounded bg-[#27272A] animate-pulse" />
              <div className="h-[42px] w-full rounded-lg bg-[#27272A] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <div className="h-10 w-32 rounded-lg bg-[#27272A] animate-pulse" />
        </div>
      </div>
    );
  }

  const fields: { label: string; key: keyof CompanyProfile; type?: string }[] = [
    { label: 'Company Name', key: 'companyName' },
    { label: 'Registration Number', key: 'registrationNumber' },
    { label: 'VAT Number', key: 'vatNumber' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city' },
    { label: 'Country', key: 'country' },
    { label: 'Postal Code', key: 'postalCode' },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-8 border-b border-[#27272A] pb-6">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-white">Company Profile</h3>
          <p className="text-sm text-[#71717A]">Manage your company details and contact information</p>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <Upload
            listType="picture-circle"
            accept="image/*"
            fileList={form.logoUrl ? [{ uid: '-1', name: 'logo.png', status: 'done', url: form.logoUrl }] : []}
            onPreview={(file) => {
              setPreviewImage(file.url || file.preview as string);
              setPreviewOpen(true);
            }}
            onRemove={() => {
              handleChange('logoUrl', '');
            }}
            beforeUpload={(file) => {
              if (!file.type.startsWith('image/')) {
                toast.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
              }
              const reader = new FileReader();
              reader.addEventListener('load', () => {
                setCropperImageSrc(reader.result?.toString() || null);
                setIsCropperOpen(true);
              });
              reader.readAsDataURL(file);
              return false; // Prevent auto upload
            }}
          >
            {!form.logoUrl && (
              <div className="flex flex-col items-center justify-center text-[#A1A1AA] hover:text-[#FACC15] transition-colors">
                <Camera className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">Upload</span>
              </div>
            )}
          </Upload>
          
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
              alt="Preview"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map(({ label, key, type }) => {
          if (key === 'phone') {
            const match = form.phone?.match(/^(\+\d{1,4})\s?(.*)$/);
            const code = match ? match[1] : '+356';
            const number = match ? match[2] : (form.phone || '');

            return (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
                  {label}
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-1/3 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-2 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
                    value={code}
                    onChange={(e) => {
                      handleChange('phone', `${e.target.value} ${number}`.trim());
                    }}
                  >
                    <option value="+356">🇲🇹 +356</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+34">🇪🇸 +34</option>
                  </select>
                  <input
                    type="tel"
                    value={number}
                    placeholder="Enter Phone number"
                    onChange={(e) => {
                      handleChange('phone', `${code} ${e.target.value}`.trim());
                    }}
                    className="w-2/3 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
                  />
                </div>
              </div>
            );
          }

          return (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
                {label}
              </label>
              <input
                type={type || 'text'}
                value={form[key] as string}
                placeholder={`Enter ${label}`}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
                disabled={key === 'email'}
              />
            </div>
          );
        })}
      </div>



      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {isCropperOpen && cropperImageSrc && (
        <ImageCropperModal
          imageSrc={cropperImageSrc}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
