'use client';

import { useState } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  ShieldCheck,
  Flag,
  Check,
  Clock,
  Reply,
  Search,
  Filter,
  Eye,
  ChevronRight,
  User,
  ShoppingBag,
  CornerDownRight,
  CheckCircle2,
  Sparkles,
  Award,
  Send,
  Info,
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
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────────

export type ResponseStatus = 'NEEDS_REPLY' | 'RESPONDED' | 'UNDER_MODERATION';

export interface CustomerReview {
  id: string;
  customerName: string;
  customerAvatar?: string;
  isVerifiedBuyer: boolean;
  orderNumber: string;
  orderItems: string[];
  orderTotal: number;
  rating: number; // 1 to 5
  reviewTitle?: string;
  reviewComment: string;
  reviewDate: string;
  responseStatus: ResponseStatus;
  restaurantResponse?: {
    text: string;
    respondedAt: string;
    authorRole: string;
    isModerated: boolean;
  };
  reportedReason?: string;
}

// ── Mock Initial Data ────────────────────────────────────────────────────────

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Gianluca Borg',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-9204',
    orderItems: ['2x Diavola Pizza', '1x Truffle Fries', '2x Coca Cola Zero'],
    orderTotal: 32.5,
    rating: 5,
    reviewTitle: 'Best woodfired pizza in Valletta!',
    reviewComment:
      'The crust had the perfect char and the spicy salami was top notch. Piping hot upon delivery. Will definitely order again next week!',
    reviewDate: '2026-11-12 19:42',
    responseStatus: 'RESPONDED',
    restaurantResponse: {
      text: 'Grazie mille Gianluca! Our pizza masters ferment the dough for 48 hours for that exact char. Glad you loved the Diavola!',
      respondedAt: '2026-11-12 20:15',
      authorRole: 'Head Chef Marco',
      isModerated: true,
    },
  },
  {
    id: 'rev-2',
    customerName: 'Clara Camilleri',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-9192',
    orderItems: ['1x Quattro Formaggi', '1x Truffle Tagliatelle', '1x Tiramisu'],
    orderTotal: 38.0,
    rating: 4,
    reviewTitle: 'Delicious pasta, pizza could have had more gorgonzola',
    reviewComment:
      'Truffle tagliatelle was restaurant quality! The 4-cheese pizza was tasty but slightly mild on the blue cheese notes. Fast packaging though.',
    reviewDate: '2026-11-11 21:10',
    responseStatus: 'NEEDS_REPLY',
  },
  {
    id: 'rev-3',
    customerName: 'Michael Tabone',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-9174',
    orderItems: ['1x Margherita D.O.P.', '1x Garlic Bread with Mozzarella'],
    orderTotal: 18.5,
    rating: 5,
    reviewTitle: 'Authentic San Marzano sauce',
    reviewComment:
      'Fresh basil, real buffalo mozzarella, and crisp crust. A rare find in Sliema that gets delivery right without soggy dough.',
    reviewDate: '2026-11-10 13:25',
    responseStatus: 'RESPONDED',
    restaurantResponse: {
      text: 'Thanks Michael! We import our D.O.P. buffalo mozzarella twice a week straight from Campania. See you on your next order!',
      respondedAt: '2026-11-10 14:02',
      authorRole: 'General Manager',
      isModerated: true,
    },
  },
  {
    id: 'rev-4',
    customerName: 'Kirsten Vella',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-9150',
    orderItems: ['1x Calzone Classico', '1x Sparkling Water'],
    orderTotal: 16.0,
    rating: 2,
    reviewTitle: 'Cold on arrival, took 55 minutes',
    reviewComment:
      'The calzone was lukewarm by the time the scooter driver handed it over. The food itself seemed good, but delivery took much longer than estimated.',
    reviewDate: '2026-11-09 20:50',
    responseStatus: 'NEEDS_REPLY',
  },
  {
    id: 'rev-5',
    customerName: 'Mark Galea',
    isVerifiedBuyer: true,
    orderNumber: '#GZ-9133',
    orderItems: ['1x Spaghetti Carbonara', '1x Tiramisu'],
    orderTotal: 22.0,
    rating: 5,
    reviewTitle: 'Real guanciale, NO cream! Pure Roman recipe',
    reviewComment:
      'Hard to find authentic carbonara in Malta that respects the eggs, pecorino, and crispy guanciale without ruining it with heavy cream. Absolute perfection.',
    reviewDate: '2026-11-08 14:15',
    responseStatus: 'RESPONDED',
    restaurantResponse: {
      text: 'Tradition is everything to us Mark! Never cream, only egg yolks and aged Pecorino Romano D.O.P. We salute you!',
      respondedAt: '2026-11-08 15:30',
      authorRole: 'Head Chef Marco',
      isModerated: true,
    },
  },
  {
    id: 'rev-6',
    customerName: 'Anonymous Foodie',
    isVerifiedBuyer: false,
    orderNumber: '#GZ-9088',
    orderItems: ['1x Burger Special'],
    orderTotal: 15.0,
    rating: 1,
    reviewTitle: 'Spam / competitor hate review',
    reviewComment:
      'Terrible food go to Restaurant XYZ across the street instead they are 100 times better call 99887766 for discount.',
    reviewDate: '2026-11-06 18:20',
    responseStatus: 'UNDER_MODERATION',
    reportedReason: 'Suspected competitor spam & external advertising.',
  },
];

const STAR_DISTRIBUTION = [
  { star: 5, percentage: 78, count: 973 },
  { star: 4, percentage: 14, count: 175 },
  { star: 3, percentage: 5, count: 62 },
  { star: 2, percentage: 2, count: 25 },
  { star: 1, percentage: 1, count: 13 },
];

const TOTAL_REVIEWS_COUNT = 1248;
const AVERAGE_RATING = 4.8;

export default function RestaurantReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REPLY' | 'RESPONDED' | 'UNDER_MODERATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Modals State ──
  const [selectedReviewForView, setSelectedReviewForView] = useState<CustomerReview | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedReviewForReply, setSelectedReviewForReply] = useState<CustomerReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const [selectedReviewForReport, setSelectedReviewForReport] = useState<CustomerReview | null>(null);
  const [reportReason, setReportReason] = useState('COURIER_ISSUE');
  const [reportDetails, setReportDetails] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // ── Actions ──

  // Open View Details
  const handleOpenView = (review: CustomerReview) => {
    setSelectedReviewForView(review);
    setIsViewModalOpen(true);
  };

  // Open Reply Modal
  const handleOpenReply = (review: CustomerReview) => {
    setSelectedReviewForReply(review);
    setReplyText(review.restaurantResponse ? review.restaurantResponse.text : '');
    setIsReplyModalOpen(true);
  };

  // Submit Reply (One response allowed per review)
  const handleSubmitReply = () => {
    if (!selectedReviewForReply) return;
    if (!replyText.trim()) {
      toast.error('Please enter your response message');
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReviewForReply.id
          ? {
              ...r,
              responseStatus: 'RESPONDED',
              restaurantResponse: {
                text: replyText.trim(),
                respondedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                authorRole: 'Restaurant Manager',
                isModerated: true,
              },
            }
          : r
      )
    );

    toast.success('Official Response Published', {
      description:
        'Your response will be visible publicly on the Gozolt customer mobile app after automated safety checks.',
    });
    setIsReplyModalOpen(false);
  };

  // Open Report Modal
  const handleOpenReport = (review: CustomerReview) => {
    setSelectedReviewForReport(review);
    setReportReason('COURIER_ISSUE');
    setReportDetails('');
    setIsReportModalOpen(true);
  };

  // Submit Report
  const handleSubmitReport = () => {
    if (!selectedReviewForReport) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReviewForReport.id
          ? {
              ...r,
              responseStatus: 'UNDER_MODERATION',
              reportedReason: `Reported: ${reportReason}. ${reportDetails}`,
            }
          : r
      )
    );

    toast.success('Review Escalated to Gozolt Trust & Safety', {
      description:
        'Our merchant compliance team will inspect order telematics and delivery timestamps within 24 hours.',
    });
    setIsReportModalOpen(false);
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reviewComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reviewTitle && r.reviewTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.orderItems.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (starFilter !== 'ALL' && r.rating !== starFilter) return false;

    if (statusFilter !== 'ALL' && r.responseStatus !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* ──────────────────────────────────────────────────────────────────────────
          HEADER & CONTEXT
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FCD223]/10 p-2 text-[#FCD223]">
              <Star className="h-6 w-6 fill-[#FCD223]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Ratings &amp; Reviews
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Customer food ratings, satisfaction breakdowns, and official restaurant reply management subject to Gozolt moderation standards.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 33: RATINGS OVERVIEW
          Average Rating, Total Reviews, 5-Star down to 1-Star Percentages
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-[#FCD223]" />
              Ratings Overview
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cumulative score and star distribution from verified Gozolt food delivery orders
            </p>
          </div>

          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold py-1 px-3">
            Top Rated Restaurant (Top 5% in Malta)
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Average Rating Big Display */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-[#18181B] text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Average Rating
            </span>
            <div className="text-6xl font-black text-white font-mono tracking-tight flex items-baseline justify-center gap-1">
              <span>{AVERAGE_RATING}</span>
              <span className="text-xl text-zinc-500 font-normal">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1.5 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-[#FCD223] text-[#FCD223] drop-shadow-[0_0_8px_rgba(252,210,35,0.4)]"
                />
              ))}
            </div>

            <div className="pt-1">
              <p className="text-sm font-bold text-white">
                {TOTAL_REVIEWS_COUNT.toLocaleString()} Total Reviews
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                98.4% of reviewers recommend this restaurant
              </p>
            </div>
          </div>

          {/* Star Distribution Percentages (Screen 33 Core Requirement) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Star Rating Breakdown
            </h3>

            <div className="space-y-2.5">
              {STAR_DISTRIBUTION.map((item) => (
                <div key={item.star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-16 text-zinc-300 font-bold shrink-0">
                    <span>{item.star}</span>
                    <Star className="h-3.5 w-3.5 fill-[#FCD223] text-[#FCD223]" />
                    <span className="text-zinc-500 font-normal font-mono">({item.percentage}%)</span>
                  </div>

                  <div className="h-2.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.star === 5
                          ? 'bg-[#FCD223]'
                          : item.star === 4
                          ? 'bg-amber-400'
                          : item.star === 3
                          ? 'bg-amber-600'
                          : item.star === 2
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <span className="w-16 text-right font-mono text-[11px] text-zinc-400 shrink-0">
                    {item.count} reviews
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Sub-Scores */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            <div className="rounded-xl border border-white/5 bg-[#18181B] p-3">
              <span className="text-[11px] text-zinc-400 font-medium">Food Taste &amp; Flavor</span>
              <p className="text-base font-black text-white font-mono mt-0.5 flex items-center justify-between">
                <span>4.9 / 5.0</span>
                <span className="text-[11px] text-emerald-400 font-bold">Excellent</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#18181B] p-3">
              <span className="text-[11px] text-zinc-400 font-medium">Packaging &amp; Temp</span>
              <p className="text-base font-black text-white font-mono mt-0.5 flex items-center justify-between">
                <span>4.8 / 5.0</span>
                <span className="text-[11px] text-emerald-400 font-bold">Hot &amp; Sealed</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#18181B] p-3">
              <span className="text-[11px] text-zinc-400 font-medium">Response Rate</span>
              <p className="text-base font-black text-white font-mono mt-0.5 flex items-center justify-between">
                <span>94.2%</span>
                <span className="text-[11px] text-[#FCD223] font-bold">&lt; 4h Reply</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          SCREEN 34: CUSTOMER REVIEWS (TABLE & ACTIONS)
          Columns: Customer, Order ID, Rating, Review, Date, Response Status, Actions
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#FCD223]" />
              Customer Reviews
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified customer feedback with 1 official restaurant response per review
            </p>
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStarFilter('ALL')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer',
                starFilter === 'ALL'
                  ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                  : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
              )}
            >
              All Stars ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer',
                  starFilter === s
                    ? 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223]'
                    : 'border-white/10 bg-[#18181B] text-zinc-400 hover:text-white'
                )}
              >
                <span>{s}</span>
                <Star className="h-3 w-3 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              placeholder="Search customer, order #, review text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs border-white/10 bg-[#18181B] text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Status:</span>
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'NEEDS_REPLY', label: 'Needs Reply' },
                { id: 'RESPONDED', label: 'Responded' },
                { id: 'UNDER_MODERATION', label: 'Reported' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all border cursor-pointer',
                  statusFilter === st.id
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOMER REVIEWS TABLE */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#18181B]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Response Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No reviews found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#FCD223]/10 border border-[#FCD223]/20 flex items-center justify-center text-[#FCD223] font-bold text-xs">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{rev.customerName}</p>
                          {rev.isVerifiedBuyer && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified Eater
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Order ID */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-[#FCD223]">{rev.orderNumber}</span>
                      <p className="text-[10px] text-zinc-500 font-sans truncate max-w-[120px]">
                        {rev.orderItems[0]}
                      </p>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="font-black text-white text-xs">{rev.rating}.0</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-3.5 w-3.5',
                                i < rev.rating
                                  ? 'fill-[#FCD223] text-[#FCD223]'
                                  : 'text-zinc-600'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Review text */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="space-y-1">
                        {rev.reviewTitle && (
                          <p className="font-bold text-white text-xs truncate">
                            &quot;{rev.reviewTitle}&quot;
                          </p>
                        )}
                        <p className="text-[11px] text-zinc-300 line-clamp-2">
                          {rev.reviewComment}
                        </p>

                        {/* Restaurant Response Preview */}
                        {rev.restaurantResponse && (
                          <div className="mt-1 rounded-lg border border-white/5 bg-black/40 p-2 text-[10px] text-zinc-400 flex items-start gap-1.5">
                            <CornerDownRight className="h-3 w-3 text-[#FCD223] shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white">
                                {rev.restaurantResponse.authorRole}:
                              </strong>{' '}
                              <span className="italic line-clamp-1">
                                &quot;{rev.restaurantResponse.text}&quot;
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {rev.reviewDate}
                    </td>

                    {/* Response Status */}
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          'text-[10px] font-bold border font-mono',
                          rev.responseStatus === 'RESPONDED' &&
                            'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                          rev.responseStatus === 'NEEDS_REPLY' &&
                            'border-amber-500/30 bg-amber-500/10 text-amber-400',
                          rev.responseStatus === 'UNDER_MODERATION' &&
                            'border-purple-500/30 bg-purple-500/10 text-purple-400'
                        )}
                      >
                        {rev.responseStatus === 'RESPONDED'
                          ? 'Responded'
                          : rev.responseStatus === 'NEEDS_REPLY'
                          ? 'Needs Reply'
                          : 'In Moderation'}
                      </Badge>
                    </td>

                    {/* Actions: View Review, Reply, Report Review */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Review */}
                        <button
                          onClick={() => handleOpenView(rev)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="View Review & Order Receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Reply */}
                        <button
                          onClick={() => handleOpenReply(rev)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer',
                            rev.responseStatus === 'RESPONDED'
                              ? 'border-white/10 bg-white/5 text-zinc-300 hover:text-white'
                              : 'border-[#FCD223] bg-[#FCD223]/10 text-[#FCD223] hover:bg-[#FCD223]/20'
                          )}
                          title="Post Official Response"
                        >
                          <Reply className="h-3 w-3" />
                          <span>{rev.responseStatus === 'RESPONDED' ? 'Edit Reply' : 'Reply'}</span>
                        </button>

                        {/* Report Review */}
                        <button
                          onClick={() => handleOpenReport(rev)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                          title="Report Review (Violations, Courier Blame, Spam)"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 1: VIEW REVIEW & ORDER RECEIPT DETAILS
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#FCD223]" />
              Customer Review Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Complete review audit and customer order receipt.
            </DialogDescription>
          </DialogHeader>

          {selectedReviewForView && (
            <div className="space-y-4 py-2">
              {/* Header card with rating */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {selectedReviewForView.customerName}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Order {selectedReviewForView.orderNumber} • {selectedReviewForView.reviewDate}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <span className="font-black text-base text-[#FCD223]">
                      {selectedReviewForView.rating}.0
                    </span>
                    <Star className="h-4 w-4 fill-[#FCD223] text-[#FCD223]" />
                  </div>
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] mt-1">
                    Verified Purchase
                  </Badge>
                </div>
              </div>

              {/* Review Text */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-2">
                {selectedReviewForView.reviewTitle && (
                  <h4 className="font-bold text-white text-xs">
                    &quot;{selectedReviewForView.reviewTitle}&quot;
                  </h4>
                )}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedReviewForView.reviewComment}
                </p>
              </div>

              {/* Order Receipt Breakdown */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-[#FCD223]" />
                  Ordered Items
                </span>

                <div className="space-y-1 divide-y divide-white/5 pt-1">
                  {selectedReviewForView.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs pt-1">
                      <span className="text-white">{item}</span>
                      <span className="text-zinc-400 font-mono">Prepared</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs pt-2 font-bold">
                    <span className="text-zinc-300">Total Bill</span>
                    <span className="text-[#FCD223] font-mono">
                      €{selectedReviewForView.orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Restaurant Response if exists */}
              {selectedReviewForView.restaurantResponse && (
                <div className="rounded-xl border border-[#FCD223]/20 bg-[#FCD223]/5 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FCD223] flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Official Restaurant Response
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {selectedReviewForView.restaurantResponse.respondedAt}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 italic">
                    &quot;{selectedReviewForView.restaurantResponse.text}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 2: REPLY TO REVIEW (ONE RESPONSE PER REVIEW SUBJECT TO MODERATION)
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Reply className="h-5 w-5 text-[#FCD223]" />
              Official Restaurant Response
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Post an official public response to {selectedReviewForReply?.customerName}'s review.
            </DialogDescription>
          </DialogHeader>

          {selectedReviewForReply && (
            <div className="space-y-4 py-2">
              {/* Customer Review Quote */}
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-bold text-white">{selectedReviewForReply.customerName}</span>
                  <span className="text-[#FCD223] font-mono">
                    ★ {selectedReviewForReply.rating}.0
                  </span>
                </div>
                <p className="text-zinc-300 italic">
                  &quot;{selectedReviewForReply.reviewComment}&quot;
                </p>
              </div>

              {/* Reply Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200">
                    Your Response (Published Publicly) *
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {replyText.length} / 500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer, address feedback professionally, and invite them back..."
                  className="w-full rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FCD223]/50"
                />
              </div>

              {/* Policy Alert Notice (Required: One restaurant response per review, subject to moderation) */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Moderation &amp; Single-Response Policy</p>
                  <p className="text-[11px] text-zinc-400">
                    Restaurants are permitted <strong>one official response per review</strong>. All replies undergo automated filtering for vulgarity, privacy disclosures (phone numbers/emails), and platform policy compliance before being published on Gozolt app.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsReplyModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReply}
              className="bg-[#FCD223] text-black font-bold text-xs hover:bg-[#FCD223]/90 shadow-md shadow-[#FCD223]/10"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Publish Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL 3: REPORT REVIEW TO GOZOLT MODERATION
          ────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0E0E10] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-400" />
              Report Review to Moderation
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Flag reviews that breach Gozolt Merchant Community Guidelines for Trust &amp; Safety audit.
            </DialogDescription>
          </DialogHeader>

          {selectedReviewForReport && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-white/10 bg-[#18181B] p-3 text-xs space-y-1">
                <span className="font-bold text-white">
                  Flagging Review for Order {selectedReviewForReport.orderNumber}
                </span>
                <p className="text-zinc-400 italic line-clamp-2">
                  &quot;{selectedReviewForReport.reviewComment}&quot;
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">Reason for Report *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="COURIER_ISSUE">Courier / Delivery Transit Delay (Not Food Quality)</option>
                  <option value="SPAM_ADVERTISING">Spam, Phishing, or Competitor Advertising</option>
                  <option value="ABUSIVE_LANGUAGE">Harassment, Hate Speech, or Defamation</option>
                  <option value="WRONG_MERCHANT">Mistaken Restaurant or Fraudulent Ticket</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-200">Additional Context</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide kitchen prep timestamps, handover logs, or photographic proof..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#18181B] p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-400/50"
                />
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-300">
                Gozolt Trust &amp; Safety reviews telematics data. If an order was delayed by courier road congestion rather than kitchen cooking, the rating is sanitized from your public merchant score.
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
              className="border-white/10 bg-white/5 text-xs text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
