import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, KeyRound, Loader2, Tag, X } from 'lucide-react';
import { PRICING_PLANS, PricingPlan } from '../data/agencyData';
import { PlanOption, ServiceOption } from '../utils/validation';
import {
  PublicCouponSummary,
  calculateDiscountedPrice,
  formatCurrencyPrice,
  normalizeCouponCode,
  parseNumericPrice,
} from '../utils/coupons';

interface PricingSectionProps {
  onSelectPlan: (plan: PlanOption, service: ServiceOption) => void;
  appliedCoupon: PublicCouponSummary | null;
  onApplyCoupon: (coupon: PublicCouponSummary | null) => void;
  onOpenCouponStudio: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  appliedCoupon,
  onApplyCoupon,
  onOpenCouponStudio,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleChoose = (plan: PricingPlan) => {
    onSelectPlan(plan.name, plan.recommendedService);
  };

  const handleApplyCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeCouponCode(couponInput);
    if (!normalized) {
      setCouponError('Enter a coupon code to apply.');
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.coupon) {
        setCouponError(data?.message || 'Invalid or inactive coupon code.');
        return;
      }
      onApplyCoupon(data.coupon as PublicCouponSummary);
      setCouponInput('');
    } catch {
      setCouponError('Unable to verify coupon right now.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  return (
    <section
      id="pricing"
      className="relative border-t border-white/5 bg-[#080B18] py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[75%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(121,87,255,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#00D4FF]">Transparent Price List</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              Website Packages Built for Every Stage of Growth
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#AAB2C5] sm:text-base">
              Choose between Standard, Platinum, and Premium builds—with accessible minimum
              starting rates, clear deliverables, and zero hidden agency fees.
            </p>
          </div>

          <div
            role="group"
            aria-label="Select pricing currency"
            className="inline-flex self-start rounded-xl border border-white/10 bg-[#101525] p-1 md:self-auto"
          >
            <button
              type="button"
              aria-pressed={currency === 'INR'}
              onClick={() => setCurrency('INR')}
              className={`min-h-9 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currency === 'INR'
                  ? 'bg-[#7957FF] text-white shadow-sm'
                  : 'text-[#AAB2C5] hover:text-white'
              }`}
            >
              INR (₹)
            </button>
            <button
              type="button"
              aria-pressed={currency === 'USD'}
              onClick={() => setCurrency('USD')}
              className={`min-h-9 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#7957FF] text-white shadow-sm'
                  : 'text-[#AAB2C5] hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Coupon Discount Bar + Owner Studio Access */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101525]/75 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          {appliedCoupon ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-sm text-white">
                <Tag className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                <span>
                  Coupon{' '}
                  <strong className="font-mono text-[#00D4FF]">{appliedCoupon.code}</strong>{' '}
                  applied
                </span>
              </div>
              <span className="text-xs text-[#AAB2C5]">
                {appliedCoupon.discountType === 'percent'
                  ? `${appliedCoupon.discountValue}% off`
                  : `${formatCurrencyPrice(appliedCoupon.discountValue, 'INR')} / ${formatCurrencyPrice(
                      appliedCoupon.discountUsd ?? Math.max(1, Math.round(appliedCoupon.discountValue / 50)),
                      'USD'
                    )} off`}{' '}
                · Valid on {appliedCoupon.applicablePlans.join(', ')}
                {appliedCoupon.note ? ` · ${appliedCoupon.note}` : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  onApplyCoupon(null);
                  setCouponError(null);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#AAB2C5] transition-colors hover:border-white/30 hover:text-white whitespace-nowrap cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleApplyCoupon}
              className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
            >
              <label
                htmlFor="pricing-coupon-input"
                className="inline-flex items-center gap-2 text-xs font-medium text-white whitespace-nowrap"
              >
                <Tag className="h-4 w-4 text-[#00D4FF]" aria-hidden="true" />
                <span>Have a coupon code?</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="pricing-coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="Enter your code"
                  className="min-h-9 w-44 rounded-lg border border-white/15 bg-[#080B18] px-3 py-1.5 font-mono text-xs uppercase text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#7957FF] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6A46F5] disabled:opacity-60 whitespace-nowrap cursor-pointer"
                >
                  {validatingCoupon && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  )}
                  <span>Apply</span>
                </button>
              </div>
              {couponError && (
                <p role="alert" className="text-xs text-rose-300">
                  {couponError}
                </p>
              )}
            </form>
          )}

          <button
            type="button"
            onClick={onOpenCouponStudio}
            className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-[#AAB2C5] transition-colors hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap shrink-0 cursor-pointer lg:self-auto"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#7957FF]" aria-hidden="true" />
            <span>Owner: Manage Coupons</span>
          </button>
        </div>

        {/* Three-Part Tier Grid: Standard, Platinum, Premium */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => {
            const baseInr = parseNumericPrice(plan.priceInr);
            const baseUsd = parseNumericPrice(plan.priceUsd);
            const breakdown = calculateDiscountedPrice(baseInr, baseUsd, plan.name, appliedCoupon);
            const originalPrice = currency === 'INR' ? plan.priceInr : plan.priceUsd;
            const displayedPrice = breakdown.isApplicable
              ? formatCurrencyPrice(
                  currency === 'INR' ? breakdown.finalInr : breakdown.finalUsd,
                  currency
                )
              : originalPrice;
            const savingsFormatted = breakdown.isApplicable
              ? formatCurrencyPrice(
                  currency === 'INR' ? breakdown.savingsInr : breakdown.savingsUsd,
                  currency
                )
              : '';
            const isFeatured = plan.featured;

            return (
              <motion.article
                key={plan.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative flex flex-col justify-between rounded-2xl border p-7 transition-all duration-200 ${
                  isFeatured
                    ? 'border-[#7957FF]/80 bg-gradient-to-b from-[#171236] via-[#101525] to-[#0E1324] shadow-[0_20px_60px_rgba(121,87,255,0.24)]'
                    : 'border-white/10 bg-[#101525]/85 hover:border-[#7957FF]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-[#00D4FF] tabular-nums">
                      {plan.tierNumber}
                    </span>
                    <span
                      className={
                        isFeatured ? 'font-medium text-[#C4B5FD]' : 'text-[#AAB2C5]'
                      }
                    >
                      {plan.billingNote}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-white">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-[#AAB2C5]">
                    {plan.tagline}
                  </p>

                  <div className="mt-6 border-y border-white/10 py-5">
                    {breakdown.isApplicable && (
                      <div className="mb-1 flex items-center gap-2 text-xs">
                        <span className="font-mono text-[#AAB2C5] line-through tabular-nums">
                          {originalPrice}
                        </span>
                        <span className="font-medium text-emerald-300">
                          Save {savingsFormatted} ({breakdown.label})
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl font-bold tracking-tight text-white tabular-nums">
                        {displayedPrice}
                      </span>
                      <span className="text-xs text-[#AAB2C5]">min. onwards</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#00D4FF]">
                      Estimated Turnaround · {plan.deliveryTime}
                    </p>
                    {appliedCoupon && !breakdown.isApplicable && (
                      <p className="mt-1 text-xs text-[#AAB2C5]">
                        Coupon applies to {appliedCoupon.applicablePlans.join(' & ')}
                      </p>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-[#AAB2C5]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#00D4FF]"
                          aria-hidden="true"
                        />
                        <span className="text-white/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-2">
                  <button
                    type="button"
                    onClick={() => handleChoose(plan)}
                    className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isFeatured
                        ? 'bg-gradient-to-r from-[#7957FF] to-[#5636E8] text-white shadow-[0_0_28px_rgba(121,87,255,0.45)] hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(121,87,255,0.65)]'
                        : 'border border-white/15 bg-white/[0.04] text-white hover:border-[#00D4FF]/60 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#101525]/70 px-6 py-5 sm:flex-row sm:items-center">
          <p className="text-sm text-[#AAB2C5]">
            Need a custom web application, website redesign, or tailored milestone pricing? Every
            package can be customized during discovery.
          </p>
          <button
            type="button"
            onClick={() => onSelectPlan('Custom / Not Sure', 'Website Redesign & Optimization')}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#00D4FF] transition-colors hover:text-white whitespace-nowrap cursor-pointer"
          >
            <span>Request Custom Quote</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
