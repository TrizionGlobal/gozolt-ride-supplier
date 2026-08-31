'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

export default function RentalReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let url = `/api/bike-rentals/supplier/reviews?page=${page}&limit=${pageSize}`;
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize, ratingFilter]);

  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bike-rentals/supplier/reviews/${id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        setReplyingTo(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'customer',
      title: 'Customer & Bike',
      dataIndex: 'user',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-white">{row.user?.firstName} {row.user?.lastName}</p>
          <p className="text-xs text-[#A1A1AA]">{row.bike?.name}</p>
          <p className="text-[10px] text-[#71717A] mt-1">{format(new Date(row.createdAt), 'dd-MMM-yyyy')}</p>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      dataIndex: 'rating',
      className: 'w-[120px]',
      render: (row) => (
        <div className="flex text-[#FACC15]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < row.rating ? 'fill-current' : 'text-[#27272A] fill-none'}`} />
          ))}
        </div>
      )
    },
    {
      key: 'review',
      title: 'Review',
      dataIndex: 'review',
      render: (row) => (
        <div className="max-w-md">
          <p className="text-white italic">"{row.review || 'No written feedback'}"</p>
          {row.supplierReply && (
            <div className="mt-3 rounded-lg border border-[#27272A] bg-[#1A1A1A] p-3 text-xs">
              <span className="font-semibold text-[#FACC15]">Your Reply: </span>
              <span className="text-[#A1A1AA]">{row.supplierReply}</span>
            </div>
          )}
          
          {replyingTo === row.id && (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded-lg border border-[#27272A] bg-black px-3 py-2 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                placeholder="Write your response..."
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="text-xs text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleReplySubmit(row.id)}
                  className="rounded bg-[#FACC15] px-3 py-1 text-xs font-semibold text-black hover:bg-[#EAB308] disabled:opacity-50"
                >
                  Submit Reply
                </button>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          {!row.supplierReply && replyingTo !== row.id && (
            <button
              onClick={() => setReplyingTo(row.id)}
              className="text-xs font-medium text-blue-500 hover:text-blue-400"
            >
              Reply
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reviews & Ratings</h1>
          <p className="text-sm text-[#A1A1AA]">Manage customer feedback on your rental bikes.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="bg-[#111] border border-[#27272A] rounded-lg p-3 flex gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#71717A] mb-1">Average</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-[#FACC15] fill-current" />
                <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#71717A] mb-1">Total</p>
              <p className="text-white font-bold">{total} Reviews</p>
            </div>
          </div>
          
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="bg-[#111111] border border-[#27272A] text-white text-sm rounded-lg p-2.5 focus:border-[#FACC15] focus:outline-none h-[42px]"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
        <ServerSideTable
          columns={columns}
          data={reviews}
          isLoading={isLoading}
          page={page}
          limit={pageSize}
          total={total}
          onPageChange={setPage}
          onLimitChange={setPageSize}
          emptyText="No reviews found."
        />
      </div>
    </div>
  );
}
