'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Save, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { settingsService } from '@/services/settings/settings.service';
import { QUICK_SERVICES_CATALOG } from '@/lib/quick-services-catalog';

export function QuickServicesTab() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State to hold selected services. Key is category ID, value is array of child IDs.
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>({});
  const [initialServices, setInitialServices] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      if (user?.quickServicesOffered) {
        const parsed = typeof user.quickServicesOffered === 'string'
          ? JSON.parse(user.quickServicesOffered)
          : user.quickServicesOffered;

        if (Array.isArray(parsed)) {
          const initialSelection: Record<string, string[]> = {};
          parsed.forEach((s: any) => {
            initialSelection[s.category] = s.services || [];
          });
          setSelectedServices(initialSelection);
          setInitialServices(initialSelection);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.quickServicesOffered]);

  const handleCategoryToggle = (categoryId: string, hasChildren: boolean, childrenIds: string[]) => {
    if (initialServices[categoryId] !== undefined) {
      // Already an existing service, cannot uncheck the whole category
      return;
    }

    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[categoryId]) {
        // Deselect
        delete next[categoryId];
      } else {
        // Select all children if it has children, else empty array
        next[categoryId] = hasChildren ? [...childrenIds] : [];
      }
      return next;
    });
  };

  const handleChildToggle = (categoryId: string, childId: string) => {
    const initialCategory = initialServices[categoryId];
    const wasChildInitiallySelected = 
      initialCategory && (initialCategory.length === 0 || initialCategory.includes(childId));

    if (wasChildInitiallySelected) {
      return;
    }

    setSelectedServices(prev => {
      const next = { ...prev };
      
      if (!next[categoryId]) {
        // If category was not selected, select it and add this child
        next[categoryId] = [childId];
      } else {
        const children = next[categoryId];
        if (children.includes(childId)) {
          // Remove child
          next[categoryId] = children.filter(id => id !== childId);
          // If no children left, remove category entirely if it wasn't initially selected
          if (next[categoryId].length === 0 && initialServices[categoryId] === undefined) {
            delete next[categoryId];
          }
        } else {
          // Add child
          next[categoryId] = [...children, childId];
        }
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Format to array of { category, services }
      const quickServicesOffered = Object.entries(selectedServices).map(([category, services]) => {
        // Find category in catalog
        const catalogEntry = QUICK_SERVICES_CATALOG.find(c => c.id === category);
        const hasChildren = catalogEntry?.children && catalogEntry.children.length > 0;
        
        let finalServices = services;
        // If all children are selected, we can send an empty array or all IDs.
        // We will send all IDs to match registration flow format, except for categories with no children.
        if (!hasChildren) {
          finalServices = [];
        }

        return {
          category,
          services: finalServices
        };
      });

      const updated = await settingsService.updateCompanyProfile({
        quickServicesOffered
      } as any);

      // Update local auth store
      if (user) {
        setUser({
          ...user,
          quickServicesOffered: updated.quickServicesOffered,
        });
      }

      toast.success('Quick Services updated successfully');
      setInitialServices(selectedServices); // update initial state after save
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update Quick Services');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#FCD223]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quick Services Selection</h2>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Select the quick services and sub-services you offer. You can add new services but cannot remove existing ones.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FCD223] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#FCD223]/90 disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_SERVICES_CATALOG.map((service) => {
          const isCategorySelected = !!selectedServices[service.id];
          const hasChildren = service.children.length > 0;
          const childrenIds = service.children.map(c => c.id);
          const isCategoryInitiallySelected = initialServices[service.id] !== undefined;

          const selectedChildren = selectedServices[service.id] || [];

          return (
            <article
              key={service.id}
              className={`rounded-2xl border p-5 transition-all ${isCategorySelected
                  ? 'border-[#FCD223] bg-[#FCD223]/10 shadow-lg shadow-[#FCD223]/5'
                  : 'border-[#27272A] bg-[#111111] hover:border-[#FCD223]/50'
                } ${isCategoryInitiallySelected ? 'opacity-80' : ''}`}
            >
              <button
                type="button"
                onClick={() => handleCategoryToggle(service.id, hasChildren, childrenIds)}
                className={`flex w-full items-start gap-4 text-left ${isCategoryInitiallySelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#27272A] bg-[#04213C]">
                  <Image
                    src={service.icon}
                    alt={`${service.name} icon`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {service.name}
                    </h2>

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isCategorySelected
                          ? 'border-[#FCD223] bg-[#FCD223]'
                          : 'border-[#52525B]'
                        }`}
                    >
                      {isCategorySelected && (
                        <Check className="h-4 w-4 text-black" />
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                    {service.description}
                  </p>
                </div>
              </button>

              {hasChildren && (
                <div className="mt-5 border-t border-[#27272A] pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    Select services
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {service.children.map(
                      (child) => {
                        const childSelected = isCategorySelected && (selectedChildren.length === 0 || selectedChildren.includes(child.id));
                        const initialCategory = initialServices[service.id];
                        const wasChildInitiallySelected = initialCategory && (initialCategory.length === 0 || initialCategory.includes(child.id));

                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleChildToggle(service.id, child.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                              childSelected
                                ? 'border-[#FCD223] bg-[#FCD223] text-black'
                                : 'border-[#3F3F46] bg-[#18181B] text-[#D4D4D8] hover:border-[#FCD223]/60'
                            } ${wasChildInitiallySelected ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            {childSelected && '✓ '}
                            {child.name}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
