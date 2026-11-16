'use client';

import { useState } from 'react';
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  Check,
  Clock,
  Search,
  Filter,
  Eye,
  User,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Award,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface GroceryCustomerReview {
  id: string;
  customerName: string;
  isVerifiedBuyer: boolean;
  orderNumber: string;
  orderItems: string[];
  orderTotal: number;
  rating: number; // 1 to 5
  reviewTitle?: string;
  reviewComment: string;
  reviewDate: string;
}

const INITIAL_GROCERY_REVIEWS: GroceryCustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Gianluca Borg',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4192',
    orderItems: ['2x Fresh Organic Whole Milk 1L', '1x Hass Avocados (Pack of 4)', '1x Country Sourdough'],
    orderTotal: 38.40,
    rating: 5,
    reviewTitle: 'Fresh produce and nicely packed chilled items!',
    reviewComment:
      'The milk and butter arrived in an insulated chilled bag with ice packs. The sourdough was still warm and crisp. Best supermarket delivery service in Valletta!',
    reviewDate: '2026-11-15 18:24',
  },
  {
    id: 'rev-2',
    customerName: 'Clara Camilleri',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4191',
    orderItems: ['1x Olive Oil 750ml', '4x Penne Rigate 500g', '2x Mineral Water 6pk'],
    orderTotal: 62.80,
    rating: 5,
    reviewTitle: 'Very prompt courier delivery and undamaged heavy bottles',
    reviewComment:
      'Ordered two cases of sparkling water and olive oil glass bottles. Everything arrived packed in sturdy double-walled cardboard without any breakages.',
    reviewDate: '2026-11-14 14:10',
  },
  {
    id: 'rev-3',
    customerName: 'Michael Abone',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4188',
    orderItems: ['2x Free-Range Eggs (10pk)', '2x Farmhouse Butter 250g', '1x Orange Juice 1L'],
    orderTotal: 23.40,
    rating: 5,
    reviewTitle: 'Super fresh farm eggs',
    reviewComment:
      'None of the eggs were cracked and expiry date was two weeks out. Great quality check by the store pickers.',
    reviewDate: '2026-11-13 11:35',
  },
  {
    id: 'rev-4',
    customerName: 'Kirsten Vella',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4172',
    orderItems: ['1x Roasted Almonds 200g', '2x Dark Chocolate Bars', '1x Sea Salt Crackers'],
    orderTotal: 18.20,
    rating: 4,
    reviewTitle: 'Good pantry selection, slightly late courier',
    reviewComment:
      'All snacks and chocolates were in great condition. Courier took about 35 minutes instead of the estimated 25, but otherwise wonderful.',
    reviewDate: '2026-11-12 20:50',
  },
  {
    id: 'rev-5',
    customerName: 'Mark Galea',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4160',
    orderItems: ['1x Eco Paper Towels (4pk)', '1x Biodegradable Dish Soap', '2x Trash Bags (20L)'],
    orderTotal: 16.90,
    rating: 5,
    reviewTitle: 'Great eco-friendly cleaning supplies',
    reviewComment:
      'Love that they stock biodegradable household items and plastic-free packaging. Will definitely order our monthly essentials here.',
    reviewDate: '2026-11-11 16:15',
  },
  {
    id: 'rev-6',
    customerName: 'Elena Vassallo',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-GR-4145',
    orderItems: ['1x Greek Yogurt 1kg', '1x Wildflower Honey 500g', '1x Granola 400g'],
    orderTotal: 21.60,
    rating: 5,
    reviewTitle: 'Perfect breakfast grocery restock',
    reviewComment:
      'Placed order at 08:00 AM and had breakfast groceries at my door by 08:35 AM. Flawless service!',
    reviewDate: '2026-11-10 08:45',
  },
];

export default function GroceryReviewsPage() {
  const [reviews] = useState<GroceryCustomerReview[]>(INITIAL_GROCERY_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL');
  const [viewingReview, setViewingReview] = useState<GroceryCustomerReview | null>(null);

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.reviewComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.reviewTitle && rev.reviewTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedRating === 'ALL' || rev.rating === selectedRating;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP HEADER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
            <span>Home</span>
            <span>&gt;</span>
            <span className="text-[#FCD223]">Ratings & Reviews</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white md:text-3xl tracking-tight">
              Customer Ratings & Shopper Reviews
            </h1>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5">
              100% Verified Shoppers
            </Badge>
          </div>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            Verified feedback submitted by customer app users after supermarket order delivery.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          RATINGS BREAKDOWN CARD
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Supermarket Average Rating
            </p>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-5xl font-black text-white">4.9</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#FCD223] text-[#FCD223]" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Based on 248 verified orders</span>
            <span className="text-emerald-400 font-bold">Top 5% Supermarket</span>
          </div>
        </div>

        {/* Star Distribution */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-lg space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
            Rating Distribution
          </p>
          {[
            { stars: 5, pct: 92, count: 228 },
            { stars: 4, pct: 6, count: 15 },
            { stars: 3, pct: 1, count: 3 },
            { stars: 2, pct: 1, count: 2 },
            { stars: 1, pct: 0, count: 0 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-xs">
              <span className="w-10 font-bold text-white flex items-center gap-1">
                {row.stars} <Star className="h-3 w-3 fill-[#FCD223] text-[#FCD223]" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  style={{ width: `${row.pct}%` }}
                  className="h-full bg-[#FCD223] rounded-full transition-all duration-500"
                />
              </div>
              <span className="w-12 text-right font-mono text-[#A1A1AA]">{row.count} ({row.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER STRIP: SEARCH & STAR RATING TABS
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, order #, or feedback keywords..."
            maxLength={60}
            className="pl-10 bg-[#121214] border-white/10 text-white rounded-xl focus:border-[#FCD223]"
          />
        </div>

        {/* Rating Filter Tabs */}
        <div className="flex items-center rounded-xl border border-white/10 bg-[#121214] p-1 shadow-sm self-start sm:self-center">
          <button
            onClick={() => setSelectedRating('ALL')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              selectedRating === 'ALL'
                ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                : 'text-[#A1A1AA] hover:text-white'
            )}
          >
            All Stars ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRating(r)}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                selectedRating === r
                  ? 'bg-[#FCD223] text-black shadow-sm font-bold'
                  : 'text-[#A1A1AA] hover:text-white'
              )}
            >
              <span>{r}</span>
              <Star className={cn('h-3 w-3', selectedRating === r ? 'fill-black' : 'fill-[#FCD223] text-[#FCD223]')} />
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          REVIEWS TABLE (VIEW ONLY ACTION)
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-16 text-center text-[#71717A]">
          <Star className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
          <p className="text-base font-bold text-white">No reviews found</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Try adjusting your search query or selecting a different star filter.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#121214] overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[#A1A1AA] uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Shopper</th>
                <th className="py-3.5">Order ID & Items</th>
                <th className="py-3.5">Rating</th>
                <th className="py-3.5">Feedback</th>
                <th className="py-3.5">Date</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Shopper */}
                  <td className="py-4 pl-4 align-top">
                    <div>
                      <p className="font-bold text-white text-sm">{rev.customerName}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Verified Shopper
                      </span>
                    </div>
                  </td>

                  {/* Order */}
                  <td className="py-4 align-top">
                    <div>
                      <span className="font-mono font-bold text-[#FCD223] text-xs">
                        {rev.orderNumber}
                      </span>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5 line-clamp-1 max-w-[200px]">
                        {rev.orderItems.join(', ')}
                      </p>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4 align-top">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-sm mr-1">{rev.rating}.0</span>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-[#FCD223] text-[#FCD223]" />
                      ))}
                    </div>
                  </td>

                  {/* Review Text */}
                  <td className="py-4 align-top max-w-md">
                    <div>
                      {rev.reviewTitle && (
                        <p className="font-bold text-white text-xs mb-1">
                          &quot;{rev.reviewTitle}&quot;
                        </p>
                      )}
                      <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">
                        {rev.reviewComment}
                      </p>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 align-top text-[#71717A] font-mono text-[11px] whitespace-nowrap">
                    {rev.reviewDate}
                  </td>

                  {/* View Action Only */}
                  <td className="py-4 align-top text-right pr-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingReview(rev)}
                      className="rounded-xl border-white/10 bg-[#18181B] text-white hover:bg-white/10 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-[#FCD223]" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: VIEW REVIEW & ORDER RECEIPT (VIEW ONLY)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={!!viewingReview} onOpenChange={() => setViewingReview(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#121214] text-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
              <span>Shopper Review Details</span>
              <div className="flex items-center gap-1">
                {[...Array(viewingReview?.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#FCD223] text-[#FCD223]" />
                ))}
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A1A1AA]">
              Verified mobile app grocery purchase review
            </DialogDescription>
          </DialogHeader>

          {viewingReview && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white text-sm">{viewingReview.customerName}</p>
                  <span className="font-mono text-[#FCD223] font-bold">{viewingReview.orderNumber}</span>
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Delivered Order
                </p>
                <p className="text-[11px] text-[#71717A]">{viewingReview.reviewDate}</p>
              </div>

              {viewingReview.reviewTitle && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Headline</p>
                  <p className="text-sm font-bold text-white italic">&quot;{viewingReview.reviewTitle}&quot;</p>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Customer Comments</p>
                <p className="text-xs text-[#A1A1AA] leading-relaxed p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  {viewingReview.reviewComment}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#71717A] font-bold mb-1.5">
                  Order Items ({viewingReview.orderItems.length})
                </p>
                <div className="p-3 rounded-xl bg-[#18181B] border border-white/5 space-y-1">
                  {viewingReview.orderItems.map((item, idx) => (
                    <p key={idx} className="text-white flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FCD223]" />
                      {item}
                    </p>
                  ))}
                  <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-white">
                    <span>Order Total</span>
                    <span className="text-emerald-400 font-mono">€{viewingReview.orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
