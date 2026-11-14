'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
  foodGrocerySupplierService,
  type SupplierProfileResponse,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export default function GroceryReviewsPage() {
  const [data, setData] = useState<SupplierProfileResponse | null>(null);

  useEffect(() => {
    foodGrocerySupplierService.getProfile().then(setData).catch(console.error);
  }, []);

  const rating = data?.business?.rating ? Number(data.business.rating).toFixed(1) : '5.0';
  const count = data?.business?.ratingCount ?? 0;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
          <Star className="h-7 w-7 text-emerald-400 fill-emerald-400" />
          Store Ratings & Feedback
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Customer reviews on product quality, packing, and freshness
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-5xl font-black text-white">{rating}</p>
            <div className="mt-2 flex items-center gap-1 justify-center sm:justify-start">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-emerald-400 text-emerald-400" />
              ))}
            </div>
            <p className="mt-2 text-xs text-[#A1A1AA]">{count} customer ratings</p>
          </div>

          <div className="flex-1 w-full border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 text-xs text-[#A1A1AA] space-y-2">
            <p className="font-semibold text-white">Store Packing Best Practices</p>
            <p>• Separate chilled items from pantry goods in insulated bags.</p>
            <p>• Check product expiration dates before bagging.</p>
            <p>• Promptly suggest replacement items if an original product is out of stock.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

