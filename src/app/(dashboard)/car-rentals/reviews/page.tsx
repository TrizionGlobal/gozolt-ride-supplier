'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function RentalReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/car-rentals/supplier/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/car-rentals/supplier/reviews/${id}/reply`, {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reviews & Ratings</h1>
        <p className="text-sm text-[#A1A1AA]">Manage customer feedback on your rental vehicles.</p>
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#111111] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#A1A1AA]">
            <thead className="bg-[#1A1A1A] text-[#71717A]">
              <tr>
                <th className="px-4 py-3 font-medium">Customer & Vehicle</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-white">{review.user?.firstName} {review.user?.lastName}</p>
                      <p className="text-xs">{review.vehicle?.name}</p>
                      <p className="text-[10px] text-[#71717A] mt-1">{format(new Date(review.createdAt), 'dd-MMM-yyyy')}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex text-[#FACC15]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-[#27272A] fill-none'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top max-w-md">
                      <p className="text-white italic">"{review.review || 'No written feedback'}"</p>
                      {review.supplierReply && (
                        <div className="mt-3 rounded-lg border border-[#27272A] bg-[#1A1A1A] p-3 text-xs">
                          <span className="font-semibold text-[#FACC15]">Your Reply: </span>
                          <span className="text-[#A1A1AA]">{review.supplierReply}</span>
                        </div>
                      )}
                      
                      {replyingTo === review.id && (
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
                              onClick={() => handleReplySubmit(review.id)}
                              className="rounded bg-[#FACC15] px-3 py-1 text-xs font-semibold text-black hover:bg-[#EAB308] disabled:opacity-50"
                            >
                              Submit Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      {!review.supplierReply && replyingTo !== review.id && (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-400"
                        >
                          Reply
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
