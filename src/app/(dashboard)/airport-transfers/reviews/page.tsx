'use client';

import { useState, useEffect } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

function getRatingBadge(rating: number) {
  if (rating >= 5) return { label: 'Excellent', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (rating === 4) return { label: 'Good', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (rating === 3) return { label: 'Average', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (rating === 2) return { label: 'Poor', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
  return { label: 'Very Poor', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
}

export default function AirportTransferReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/airport-transfers/supplier/reviews?page=${page}&limit=${pageSize}`;
      if (ratingFilter !== 'all') {
        url += `&rating=${ratingFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
        setTotal(data.total || 0);
        setAverageRating(data.averageRating || 0);
      }
    } catch (err) {
      console.error('Failed to fetch airport transfer reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize, ratingFilter]);

  const columns: ColumnDef<any>[] = [
    // 1. Customer
    {
      key: 'customer',
      title: 'Customer',
      className: 'min-w-[160px]',
      render: (row) => {
        const first = row.user?.firstName || '';
        const last = row.user?.lastName || '';
        const fullName = `${first} ${last}`.trim() || 'Valued Customer';
        const initials = `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'U';

        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FACC15]/20 to-[#EAB308]/5 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] font-semibold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{fullName}</p>
              <p className="text-xs text-[#71717A] truncate">
                {row.user?.phone || row.user?.email || 'Registered User'}
              </p>
            </div>
          </div>
        );
      },
    },

    // 2. Vehicle (No car icon)
    {
      key: 'vehicle',
      title: 'Vehicle',
      className: 'min-w-[170px]',
      render: (row) => {
        const vehicleName = [row.vehicle?.make, row.vehicle?.model].filter(Boolean).join(' ') || 'Transfer Vehicle';
        const type = row.vehicle?.vehicleType || 'Standard';
        const plate = row.vehicle?.registrationNo;

        return (
          <div className="flex flex-col gap-1">
            <p className="text-white font-medium text-sm truncate">{vehicleName}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-[#27272A] border border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA]">
                {type}
              </span>
              {plate && (
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-[#27272A] text-[10px] font-mono text-[#71717A]">
                  {plate}
                </span>
              )}
            </div>
          </div>
        );
      },
    },

    // 3. Trip Details
    {
      key: 'trip',
      title: 'Trip Details',
      className: 'min-w-[200px]',
      render: (row) => {
        const pickup = row.booking?.pickupLocation || 'Pickup';
        const dropoff = row.booking?.dropoffLocation || 'Destination';
        const isRound = row.booking?.transferType === 'ROUND_TRIP';
        const refCode = row.booking?.bookingReference;

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[#E4E4E7]">
              <span className="truncate max-w-[95px] text-[#A1A1AA]">{pickup}</span>
              <ArrowRight className="h-3 w-3 text-[#FACC15] shrink-0" />
              <span className="truncate max-w-[95px] text-white font-medium">{dropoff}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${isRound
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
              >
                {isRound ? 'Round Trip' : 'One Way'}
              </span>
              {refCode && (
                <span className="text-[10px] font-mono text-[#71717A]">
                  {refCode}
                </span>
              )}
            </div>
          </div>
        );
      },
    },

    // 4. Assigned Self Supplier / Worker
    {
      key: 'assignedStaff',
      title: 'Assigned Handler',
      className: 'min-w-[160px]',
      render: (row) => {
        const tasks = row.booking?.tasks as any[] | undefined;
        const workerTask = tasks?.find((t) => !t.selfAssigned && (t.assignedToName || t.assignedToEmail));
        const selfTask = tasks?.find((t) => t.selfAssigned === true);
        const task = workerTask || selfTask || (tasks && tasks.length > 0 ? tasks[0] : null);
        const isSelf = task ? task.selfAssigned === true : true;
        const workerName = isSelf ? null : (task?.assignedToName || 'Assigned Driver');
        const workerEmail = isSelf ? null : task?.assignedToEmail;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isSelf
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
              >
                {isSelf ? 'Self (Supplier)' : 'Assigned Worker'}
              </span>
            </div>
            {!isSelf && workerName && (
              <p className="text-white text-xs font-medium truncate max-w-[140px]">
                {workerName}
              </p>
            )}
            {!isSelf && workerEmail && (
              <p className="text-[10px] text-[#71717A] truncate max-w-[140px]">
                {workerEmail}
              </p>
            )}
          </div>
        );
      },
    },

    // 5. Rating
    {
      key: 'rating',
      title: 'Rating',
      className: 'min-w-[140px]',
      render: (row) => {
        const badge = getRatingBadge(row.rating || 0);

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 text-[#FACC15]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < row.rating ? 'fill-current' : 'text-[#27272A] fill-none'
                    }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                {row.rating}.0 • {badge.label}
              </span>
            </div>
          </div>
        );
      },
    },

    // 6. Customer Feedback
    {
      key: 'review',
      title: 'Customer Feedback',
      className: 'min-w-[220px]',
      render: (row) => {
        const hasText = row.review && row.review.trim().length > 0;

        return (
          <div className="max-w-md">
            {hasText ? (
              <p className="text-white text-sm leading-relaxed bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#27272A]/80 italic">
                "{row.review}"
              </p>
            ) : (
              <span className="text-xs text-[#71717A] italic">
                No written feedback provided
              </span>
            )}
          </div>
        );
      },
    },

    // 7. Submitted On (Single line, no icon, matches transfer schedule format)
    {
      key: 'createdAt',
      title: 'Submitted On',
      className: 'min-w-[170px] text-right',
      render: (row) => (
        <span className="text-xs text-[#E4E4E7] font-medium whitespace-nowrap">
          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Stats Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reviews & Ratings</h1>
          <p className="text-sm text-[#A1A1AA]">
            Real-time customer feedback, star ratings, and ride reviews on your airport transfers.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {/* Average Rating KPI Badge */}
          <div className="bg-[#111111] border border-[#27272A] rounded-xl px-4 py-2.5 flex items-center gap-6 shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#71717A] mb-0.5 font-medium">
                Overall Average
              </p>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-[#FACC15] fill-current" />
                <span className="text-white font-bold text-base">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-[#71717A]">/ 5.0</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#27272A]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#71717A] mb-0.5 font-medium">
                Total Reviews
              </p>
              <p className="text-white font-bold text-base">{total}</p>
            </div>
          </div>

          {/* Rating Filter Dropdown */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#111111] border border-[#27272A] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-[#FACC15] focus:outline-none h-[44px] cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">★ 5 – Excellent</option>
            <option value="4">★ 4 – Good</option>
            <option value="3">★ 3 – Average</option>
            <option value="2">★ 2 – Poor</option>
            <option value="1">★ 1 – Very Poor</option>
          </select>
        </div>
      </div>

      {/* Structured Table */}
      <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden shadow-sm">
        <ServerSideTable
          columns={columns}
          data={reviews}
          isLoading={isLoading}
          page={page}
          limit={pageSize}
          total={total}
          onPageChange={setPage}
          onLimitChange={setPageSize}
          emptyText="No customer reviews found."
        />
      </div>
    </div>
  );
}
