'use client';

import { BookingsTab } from '../components/BookingsTab';

export default function BookingsManagementPage() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Management</h1>
          <p className="text-sm text-[#A1A1AA]">Manage all your car rental bookings.</p>
        </div>
      </div>

      <div className="mt-4">
        <BookingsTab />
      </div>
    </div>
  );
}
