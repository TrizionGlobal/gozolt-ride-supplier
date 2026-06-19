'use client';

import { useState } from 'react';
import { Lock, ArrowLeft, ChevronRight, ShieldCheck, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CardData {
  paymentMethodId: string;
  cardName: string;
  last4: string;
  brand: string;
}

interface Step5PaymentProps {
  selectedTier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  companyAddress?: string;
  companyCity?: string;
  ownerName?: string;
  initialValues: CardData;
  onNext: (cardData: CardData) => void;
  onPrevious: () => void;
}

const PLAN_INFO = {
  STARTER: { name: 'Starter Fleet', price: 49 },
  GROWTH: { name: 'Growth Fleet', price: 149 },
  PROFESSIONAL: { name: 'Professional Fleet', price: 199 },
  ENTERPRISE: { name: 'Enterprise Fleet', price: 299 },
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function Step5PaymentForm({
  selectedTier,
  companyAddress = '',
  companyCity = '',
  ownerName = '',
  initialValues,
  onNext,
  onPrevious,
}: Step5PaymentProps) {
  const stripe = useStripe();
  const elements = useElements();

  const plan = PLAN_INFO[selectedTier] || PLAN_INFO.PROFESSIONAL;

  const [cardName, setCardName] = useState(initialValues.cardName || ownerName);
  const [billingAddress, setBillingAddress] = useState(companyAddress);
  const [billingCity, setBillingCity] = useState(companyCity);
  const [billingCountry] = useState('Malta');

  const [useSavedToken, setUseSavedToken] = useState(!!initialValues.paymentMethodId);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | undefined>(undefined);
  
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  const isFormValid =
    useSavedToken || (
      cardName.trim().length > 2 &&
      billingAddress.trim().length > 3 &&
      billingCity.trim().length > 1 &&
      cardNumberComplete &&
      cardExpiryComplete &&
      cardCvcComplete
    );

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useSavedToken) {
      onNext(initialValues);
      return;
    }

    if (!isFormValid || !stripe || !elements) return;

    setIsTokenizing(true);
    setTokenError(undefined);

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setIsTokenizing(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
          address: {
            line1: billingAddress,
            city: billingCity,
            country: 'MT', // Malta
          },
        },
      });

      if (error) {
        setTokenError(error.message || 'Failed to verify card. Please try again.');
        setIsTokenizing(false);
        return;
      }

      setIsTokenizing(false);
      onNext({
        paymentMethodId: paymentMethod.id,
        cardName,
        last4: paymentMethod.card?.last4 || 'xxxx',
        brand: paymentMethod.card?.brand || 'card',
      });
    } catch (err: any) {
      setTokenError(err.message || 'Stripe connection failed.');
      setIsTokenizing(false);
    }
  };

  const stripeElementOptions: any = {
    showIcon: true,
    disableLink: true,
    style: {
      base: {
        color: '#fff',
        fontSize: '14px',
        '::placeholder': { color: '#52525B' }
      },
      invalid: { color: '#F87171' }
    }
  };

  return (
    <div className="relative rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6 max-w-[650px] mx-auto">
      {/* Tokenizing Loading Overlay */}
      {isTokenizing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/90 backdrop-blur-sm transition-all duration-300">
          <div className="mb-4 relative animate-pulse">
            <div className="h-14 w-14 rounded-full border-2 border-[#27272A] border-t-[#635BFF] animate-spin" />
            <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-[#635BFF]" />
          </div>
          <p className="text-sm font-medium text-white">Validating Card Securely with Stripe...</p>
          <p className="text-[10px] text-[#52525B] mt-1">Direct tokenization to Stripe servers</p>
        </div>
      )}

      <div className="mb-6 border-b border-[#27272A] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Step 5: Payment Details</h2>
          <p className="text-xs text-[#71717A] mt-0.5">Subscribe to your selected plan</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-[#1A1A1A] text-green-400 font-medium px-2 py-1 rounded-md border border-green-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          SSL Secured
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        {/* Order Summary banner */}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-[#FACC15]/30 bg-[#FACC15]/5 p-4">
          <div>
            <p className="text-[10px] font-semibold text-[#FACC15] uppercase tracking-wider">Selected Plan</p>
            <p className="text-sm font-bold text-white mt-0.5">{plan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#A1A1AA]">Subscription Price</p>
            <p className="text-lg font-bold text-[#FACC15] mt-0.5">
              €{plan.price.toFixed(2)}<span className="text-xs text-[#71717A] font-normal"> /mo</span>
            </p>
          </div>
        </div>

        {/* Token Verification Error Alert */}
        {tokenError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-400 mb-4">
            ⚠ {tokenError}
          </div>
        )}

        {/* Saved Token Badge */}
        {useSavedToken ? (
          <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-5 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Stripe Card Connected</p>
              <p className="text-xs text-[#71717A] mt-1 font-mono uppercase">
                {initialValues.brand} ending in •••• {initialValues.last4}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUseSavedToken(false);
                setCardName(ownerName);
              }}
              className="text-xs text-[#635BFF] hover:underline focus:outline-none"
            >
              Use a different card
            </button>
          </div>
        ) : (
          /* Card Input Fields */
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-[#27272A] pb-1.5">
              Card Details
            </h3>
            
            <div>
              <label className="mb-1.5 block text-xs text-white">Name on Card*</label>
              <input
                type="text"
                required
                autoComplete="new-password"
                placeholder="Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white">Card Number*</label>
              <div className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-3 focus-within:border-[#FACC15] transition-colors">
                <CardNumberElement 
                  options={stripeElementOptions} 
                  onChange={(e) => setCardNumberComplete(e.complete)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-white">Card Expiry*</label>
                <div className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-3 focus-within:border-[#FACC15] transition-colors">
                  <CardExpiryElement 
                    options={stripeElementOptions} 
                    onChange={(e) => setCardExpiryComplete(e.complete)} 
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white">CVV*</label>
                <div className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-3 focus-within:border-[#FACC15] transition-colors">
                  <CardCvcElement 
                    options={stripeElementOptions} 
                    onChange={(e) => setCardCvcComplete(e.complete)} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Information Section (Prefilled Malta) */}
        {!useSavedToken && (
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-[#27272A] pb-1.5">
              Billing Information
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs text-white">Billing Address*</label>
                <input
                  type="text"
                  required
                  placeholder="Billing Address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white">Billing City*</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white">Country</label>
              <select
                disabled
                value={billingCountry}
                className="w-full h-10 rounded-lg border border-[#27272A] bg-[#111111] px-3.5 py-2.5 text-sm text-[#A1A1AA] cursor-not-allowed outline-none"
              >
                <option value="Malta">🇲🇹 Malta</option>
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center gap-1 text-sm text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isTokenizing}
            className="flex items-center gap-1.5 rounded-full bg-[#635BFF] hover:bg-[#5851DB] px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#635BFF]/20"
          >
            {useSavedToken ? 'Continue' : 'Verify & Continue'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export function Step5Payment(props: Step5PaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <Step5PaymentForm {...props} />
    </Elements>
  );
}
