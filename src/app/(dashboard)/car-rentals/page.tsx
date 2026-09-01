'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';

import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { useCarRentalsStore } from '@/stores/car-rentals.store';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

const TABS = [
  { id: 'completed', label: 'Completed Rentals', statuses: ['COMPLETED'] },
  { id: 'cancelled', label: 'Cancelled / Rejected', statuses: ['CANCELLED'] },
];

export default function CarRentalsHistoryPage() {
  const {
    historyBookings,
    historyTotal,
    historyPage,
    historyLimit,
    historyTab,
    setHistoryCache,
  } = useCarRentalsStore();

  const [activeTab, setActiveTab] = useState(historyTab || TABS[0].id);
  const [bookings, setBookings] = useState<any[]>(historyBookings);
  const [isLoading, setIsLoading] = useState(historyBookings.length === 0);
  const [page, setPage] = useState(historyPage || 1);
  const [limit, setLimit] = useState(historyLimit || 20);
  const [total, setTotal] = useState(historyTotal || 0);

  const fetchBookings = useCallback(async (forceRefresh = false) => {
    // Skip fetch if we already have cached data for the same filters
    if (!forceRefresh && historyBookings.length > 0 && historyTab === activeTab && historyPage === page && historyLimit === limit) {
      return;
    }
    setIsLoading(true);
    try {
      const currentTab = TABS.find((t) => t.id === activeTab);
      const res = await carRentalsService.getBookings({
        page,
        limit,
        statuses: currentTab?.statuses
      });
      const items = res.items || res.data || [];
      const newTotal = res.meta?.total || 0;
      setBookings(items);
      setTotal(newTotal);
      setHistoryCache(items, newTotal, page, limit, activeTab);
    } catch (err) {
      console.error(err);
      setBookings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getRentalStatus = (b: any) => {
    if (b.status === 'CANCELLED') {
      if (b.return?.vehicleCondition === 'SUPPLIER_REJECTED') return 'Supplier Rejected';
      if (b.return?.vehicleCondition === 'USER_CANCELLED') return 'User Cancelled';
      return 'Cancelled';
    }
    switch (b.status) {
      case 'PENDING_APPROVAL': return 'Pending';
      case 'CONFIRMED': return 'Upcoming';
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Completed';
      default: return b.status;
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle Info',
      className: 'w-[15%]',
      render: (b) => (
        <div>
          <div className="text-white font-medium">{b.vehicle?.name || 'Unknown'}</div>
          <div className="inline-block mt-1 px-1.5 py-0.5 bg-[#27272A] rounded border border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA]">
            {b.vehicle?.registrationNo || 'No Plate'}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Customer Details',
      className: 'w-[20%] text-center',
      render: (b) => (
        <div className="flex flex-col items-center">
          <div className="text-white font-medium">{b.user?.firstName} {b.user?.lastName}</div>
          <div className="text-xs text-[#71717A] mt-1">{b.user?.phone || 'No phone'}</div>
          <div className="text-xs text-[#71717A]">{b.user?.email || 'No email'}</div>
        </div>
      )
    },
    {
      key: 'locations',
      title: 'Locations & Delivery',
      className: 'w-[25%] text-center',
      render: (b) => (
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-emerald-400 mb-1">
            {b.deliveryType ? b.deliveryType.replace('_', ' ') : 'SELF PICKUP'}
          </div>
          <div className="text-xs text-center">
            <span className="text-[#71717A]">Pickup: </span>
            <span className="text-white max-w-[150px] truncate inline-block align-bottom" title={b.pickupLocation || b.deliveryAddress}>
              {b.pickupLocation || b.deliveryAddress || 'N/A'}
            </span>
          </div>
          <div className="text-xs mt-1 text-center">
            <span className="text-[#71717A]">Return: </span>
            <span className="text-white max-w-[150px] truncate inline-block align-bottom" title={b.dropoffLocation}>
              {b.dropoffLocation || 'N/A'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      title: 'Dates & Times',
      className: 'w-[20%] whitespace-nowrap text-center',
      render: (b) => (
        <div className="flex flex-col items-center">
          <div className="text-xs text-center">
            <span className="text-[#71717A]">Pickup: </span>
            <span className="text-white">{format(new Date(b.startDate), 'dd-MMM-yyyy hh:mm a')}</span>
          </div>
          <div className="text-xs mt-1 text-center">
            <span className="text-[#71717A]">Return: </span>
            <span className="text-white">{format(new Date(b.endDate), 'dd-MMM-yyyy hh:mm a')}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Rental Status',
      className: 'text-center w-[120px]',
      render: (b) => (
        <div className="flex justify-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${b.status === 'COMPLETED' ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' :
              b.status === 'CANCELLED' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                'text-blue-500 bg-blue-500/10 border-blue-500/20'
            }`}>
            {getRentalStatus(b)}
          </span>
        </div>
      )
    },
    {
      key: 'amountPaid',
      title: 'Amount Paid',
      className: 'w-[100px] text-center',
      render: (b) => (
        <div className="text-sm font-medium text-emerald-400 text-center">
          €{Number(b.grandTotal || 0).toFixed(2)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-center w-[120px]',
      render: (b) => (
        <div className="flex justify-center">
          <Link
            href={`/car-rentals/${b.id}/details?source=history`}
            className="rounded border border-[#3F3F46] bg-[#18181B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#27272A] hover:border-[#52525B] transition-colors"
          >
            View Details
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Car Rentals History</h1>
        <p className="text-sm text-[#A1A1AA]">Complete all-time history of your fleet's rentals.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-1 rounded-xl bg-[#141414] p-1 border border-[#27272A] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-[#27272A] text-white shadow'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
        <ServerSideTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          tableClassName="table-fixed"
          emptyText="No rental history found."
        />
      </div>
    </div>
  );
}
