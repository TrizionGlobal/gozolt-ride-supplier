'use client';

import { BikeRentalForm } from '../components/BikeRentalForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewBikeRentalPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/bike-rentals/fleet" className="text-[#A1A1AA] hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Add New Bike Rental</h1>
        </div>
      </div>
      <BikeRentalForm />
    </div>
  );
}
