'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

import { SUPPLIER_QUICK_SERVICE_CATEGORIES } from '@/lib/supplier-quick-services';

export default function QuickServicesBookingManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#27272A] bg-[#111111]">
          <Image
            src="/quick-services-icon.png"
            alt="Quick Services"
            width={64}
            height={64}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Quick Services Booking Management
          </h1>

          <p className="mt-1 text-sm text-[#8793B2]">
            Select a Quick Service category to review
            bookings, customer requirements, schedules and
            assigned workers.
          </p>
        </div>
      </div>

      {/* Yellow instruction banner */}
      <div className="flex items-center gap-3 rounded-xl border border-[#FCD223]/30 bg-[#FCD223]/5 px-5 py-4">
        <ClipboardList className="h-5 w-5 shrink-0 text-[#FCD223]" />

        <p className="text-sm text-white">
          Select one of the 12 categories below to open its
          Booking Management page.
        </p>
      </div>

      {/* Twelve service cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {SUPPLIER_QUICK_SERVICE_CATEGORIES.map(
          (service) => (
            <Link
              key={service.id}
              href={`/quick-services/booking-management/${service.slug}`}
              className="group flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-[#27272A] bg-[#111111] p-6 text-center transition-all hover:-translate-y-1 hover:border-[#FCD223] hover:shadow-[0_0_25px_rgba(252,210,35,0.12)]"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#27272A] bg-[#04213C]">
                <Image
                  src={service.icon}
                  alt={service.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="mt-5 text-lg font-bold text-white">
                {service.name}
              </h2>

              <p className="mt-2 min-h-10 text-xs leading-relaxed text-[#8793B2]">
                {service.childServices.length > 0
                  ? service.childServices.join(' • ')
                  : 'View service bookings'}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FCD223]">
                View Bookings

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}