'use client';

import { VehiclesTab } from '../components/VehiclesTab';

export default function RentalFleetPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Rental Fleet Management</h1>
        <div id="car-rentals-actions" />
      </div>
      <VehiclesTab />
    </div>
  );
}
