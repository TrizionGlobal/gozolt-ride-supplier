'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  QUICK_SERVICES_CATALOG,
} from '@/lib/quick-services-catalog';

import type {
  QuickServiceId,
  QuickServiceSelection,
} from '@/types/quick-service-selection';

type SelectionState = Partial<
  Record<QuickServiceId, string[]>
>;

export default function QuickServicesSelectionPage() {
  const router = useRouter();

  const [selected, setSelected] =
    useState<SelectionState>({});

  const isParentSelected = (
    serviceId: QuickServiceId
  ) => {
    return Object.prototype.hasOwnProperty.call(
      selected,
      serviceId
    );
  };

  const toggleParent = (
    serviceId: QuickServiceId,
    childIds: string[]
  ) => {
    setSelected((current) => {
      const next = { ...current };

      if (
        Object.prototype.hasOwnProperty.call(
          next,
          serviceId
        )
      ) {
        delete next[serviceId];
      } else {
        next[serviceId] = childIds;
      }

      return next;
    });
  };

  const toggleChild = (
    serviceId: QuickServiceId,
    childId: string
  ) => {
    setSelected((current) => {
      const next = { ...current };

      const currentChildren =
        next[serviceId] || [];

      const childAlreadySelected =
        currentChildren.includes(childId);

      const updatedChildren =
        childAlreadySelected
          ? currentChildren.filter(
              (id) => id !== childId
            )
          : [
              ...currentChildren,
              childId,
            ];

      if (updatedChildren.length === 0) {
        delete next[serviceId];
      } else {
        next[serviceId] =
          updatedChildren;
      }

      return next;
    });
  };

  const selectedParentCount =
    Object.keys(selected).length;

  const selectedChildCount =
    Object.values(selected).reduce(
      (total, children) =>
        total + (children?.length || 0),
      0
    );

  const handleContinue = () => {
    if (selectedParentCount === 0) {
      toast.error(
        'Please select at least one Quick Service.'
      );

      return;
    }

    const selection:
      QuickServiceSelection = {
      services: Object.entries(
        selected
      ).map(
        ([
          serviceId,
          childServiceIds,
        ]) => ({
          serviceId:
            serviceId as QuickServiceId,
          childServiceIds:
            childServiceIds || [],
        })
      ),
    };

    localStorage.setItem(
      'gozolt-selected-service',
      'QUICK_SERVICES'
    );

    localStorage.setItem(
      'gozolt-selected-quick-services',
      JSON.stringify(selection)
    );

    router.push(
      '/login?service=QUICK_SERVICES'
    );
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FCD223]">
            GOZOLT Quick Services
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Select Your Services
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
            Select one or multiple services
            that your company can provide.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_SERVICES_CATALOG.map(
            (service) => {
              const parentSelected =
                isParentSelected(
                  service.id
                );

              const selectedChildren =
                selected[service.id] ||
                [];

              return (
                <article
                  key={service.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    parentSelected
                      ? 'border-[#FCD223] bg-[#FCD223]/10 shadow-lg shadow-[#FCD223]/5'
                      : 'border-[#27272A] bg-[#111111] hover:border-[#FCD223]/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleParent(
                        service.id,
                        service.children.map(
                          (child) =>
                            child.id
                        )
                      )
                    }
                    className="flex w-full items-start gap-4 text-left"
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
                        <h2 className="text-lg font-bold">
                          {service.name}
                        </h2>

                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            parentSelected
                              ? 'border-[#FCD223] bg-[#FCD223]'
                              : 'border-[#52525B]'
                          }`}
                        >
                          {parentSelected && (
                            <Check className="h-4 w-4 text-black" />
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                        {service.description}
                      </p>
                    </div>
                  </button>

                  {service.children.length >
                    0 && (
                    <div className="mt-5 border-t border-[#27272A] pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                        Select services
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {service.children.map(
                          (child) => {
                            const childSelected =
                              selectedChildren.includes(
                                child.id
                              );

                            return (
                              <button
                                key={
                                  child.id
                                }
                                type="button"
                                onClick={() =>
                                  toggleChild(
                                    service.id,
                                    child.id
                                  )
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  childSelected
                                    ? 'border-[#FCD223] bg-[#FCD223] text-black'
                                    : 'border-[#3F3F46] bg-[#18181B] text-[#D4D4D8] hover:border-[#FCD223]/60'
                                }`}
                              >
                                {childSelected &&
                                  '✓ '}
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
            }
          )}
        </div>

        <div className="sticky bottom-4 mt-10 rounded-2xl border border-[#27272A] bg-[#0A0A0A]/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="font-semibold text-white">
                {selectedParentCount}{' '}
                service group
                {selectedParentCount === 1
                  ? ''
                  : 's'}{' '}
                selected
              </p>

              <p className="text-xs text-[#A1A1AA]">
                {selectedChildCount}{' '}
                child service
                {selectedChildCount === 1
                  ? ''
                  : 's'}{' '}
                selected
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={
                selectedParentCount === 0
              }
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FCD223] px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-[#EAB308] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Continue to Login

              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}