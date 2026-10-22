'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AirportTransferForm } from '../components/AirportTransferForm';

export default function NewAirportTransferVehiclePage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/airport-transfers/fleet"
          className="text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-white">Add New Transfer Vehicle</h1>
      </div>
      <AirportTransferForm />
    </div>
  );
}
