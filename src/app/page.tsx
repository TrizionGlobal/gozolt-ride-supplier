/*import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}*/


'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

type SupplierService =
  | 'CAB'
  | 'CAR_RENTAL'
  | 'BIKE_RENTAL'
  | 'QUICK_SERVICES';

const services = [
  {
    type: 'CAB' as SupplierService,
    title: 'Cab Booking',
    description:
      'Manage fleet operations, drivers and passenger ride bookings.',
    image: '/cab-booking-icon.png',
  },
  {
    type: 'CAR_RENTAL' as SupplierService,
    title: 'Car Rentals',
    description:
      'Manage rental vehicles, reservations and customer handovers.',
    image: '/car-rental-icon.png',
  },
  {
    type: 'BIKE_RENTAL' as SupplierService,
    title: 'Bike Rentals',
    description:
      'Manage bike inventory, rental bookings and vehicle operations.',
    image: '/bike-rental-icon.png',
  },
  {
    type: 'QUICK_SERVICES' as SupplierService,
    title: 'Quick Services',
    description:
      'Manage local professionals, customer requests and service bookings.',
    image: '/quick-services-icon.png',
  },
];

export default function HomePage() {
  const router = useRouter();

  const selectService = (service: SupplierService) => {
    if (service === 'QUICK_SERVICES') {
      localStorage.removeItem('gozolt-selected-quick-services');
      localStorage.setItem('gozolt-selected-service', 'QUICK_SERVICES');
      router.push('/quick-services-selection');
    return;
    }
    localStorage.removeItem('gozolt-selected-quick-services');
    localStorage.removeItem('quick-services-access-mode');
    localStorage.setItem('gozolt-selected-service', service);
    router.push(`/login?service=${service}`);
  };

  return (
    <main className="min-h-screen bg-black px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <Image
            src="/logo.png"
            alt="GOZOLT"
            width={180}
            height={80}
            className="mx-auto h-auto object-contain"
            priority
          />

          <h1 className="mt-8 text-3xl font-black text-white md:text-5xl">
            Welcome to GOZOLT <span className="text-[#FCD223]">Supplier Portal</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#A1A1AA]">
            Select the service you want to provide and manage through GOZOLT.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <button
              key={service.type}
              type="button"
              onClick={() => selectService(service.type)}
              className="group relative rounded-3xl border border-[#27272A] bg-[#111111] p-7 text-center transition-all hover:-translate-y-1 hover:border-[#FCD223] hover:shadow-[0_0_30px_rgba(252,210,35,0.15)]"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#27272A] bg-white">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                {service.title}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                {service.description}
              </p>

              <div className="mt-6 rounded-full bg-[#FCD223] px-5 py-2.5 text-sm font-bold text-black">
                Continue
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#71717A]">
          Powered by Primooo Global Ltd
        </p>
      </div>
    </main>
  );
}