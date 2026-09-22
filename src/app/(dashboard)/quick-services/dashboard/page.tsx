'use client';

import { BriefcaseBusiness, CalendarCheck, Users, Wrench } from 'lucide-react';

const dashboardCards = [
  {
    title: 'Total Service Requests',
    value: '0',
    description: 'All customer requests',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Active Bookings',
    value: '0',
    description: 'Services currently in progress',
    icon: CalendarCheck,
  },
  {
    title: 'Service Professionals',
    value: '0',
    description: 'Registered professionals',
    icon: Users,
  },
  {
    title: 'Completed Services',
    value: '0',
    description: 'Successfully completed jobs',
    icon: Wrench,
  },
];

export default function sServicesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Quick Services Dashboard
        </h1>

        <p className="mt-1 text-sm text-[#A1A1AA]">
          Manage service requests, professionals and bookings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-[#27272A] bg-[#111111] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/10">
                  <Icon className="h-5 w-5 text-[#FACC15]" />
                </div>
              </div>

              <p className="text-2xl font-bold text-white">
                {card.value}
              </p>

              <h2 className="mt-1 text-sm font-semibold text-white">
                {card.title}
              </h2>

              <p className="mt-1 text-xs text-[#71717A]">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#111111] p-8 text-center">
        <Wrench className="mx-auto h-10 w-10 text-[#FACC15]" />

        <h2 className="mt-4 text-lg font-bold text-white">
          Quick Services Management
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm text-[#A1A1AA]">
          Service-request management, professional assignment and booking
          operations will be added here.
        </p>
      </div>
    </div>
  );
}
