import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Send,
  Tag,
  X,
} from 'lucide-react';
import { BUSINESS_INFO, PRICING_PLANS } from '../data/agencyData';
import {
  ContactFormErrors,
  ContactFormInput,
  PLAN_OPTIONS,
  PlanOption,
  SERVICE_OPTIONS,
  ServiceOption,
  validateContactForm,
} from '../utils/validation';
import {
  PublicCouponSummary,
  TIER_NAMES,
  TierName,
  calculateDiscountedPrice,
  formatCurrencyPrice,
  normalizeCouponCode,
  parseNumericPrice,
} from '../utils/coupons';

interface ContactSectionProps {
  selectedService: ServiceOption | '';
  selectedPlan: PlanOption | '';
  appliedCoupon: PublicCouponSummary | null;
  onApplyCoupon: (coupon: PublicCouponSummary | null) => void;
  focusTrigger: number;
}

interface SubmissionSuccess {
  referenceId: string;
  deliveryMode: 'email' | 'webhook' | 'stored';
  discountSummary?: string;
  message: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedService,
  selectedPlan,
  appliedCoupon,
  onApplyCoupon,
  focusTrigger,
}) => {
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [formState, setFormState] = useState<ContactFormInput>({
    name: '',
    email: '',
    phone: '',
    service: selectedService || '',
    plan: selectedPlan || 'Custom / Not Sure',
    couponCode: appliedCoupon?.code || '',
    description: '',
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SubmissionSuccess | null>(null);

  useEffect(() => {
    if (selectedService || selectedPlan) {
      setFormState((prev) => ({
        ...prev,
        service: selectedService || prev.service,
        plan: selectedPlan || prev.plan,
      }));
      setErrors((prev) => ({
        ...prev,
        service: selectedService ? undefined : prev.service,
        plan: selectedPlan ? undefined : prev.plan,
      }));
      setSuccessInfo(null);
    }
  }, [selectedService, selectedPlan]);

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      couponCode: appliedCoupon?.code || '',
    }));
    if (appliedCoupon) {
      setErrors((prev) => ({ ...prev, couponCode: undefined }));
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (focusTrigger > 0 && nameInputRef.current) {
      nameInputRef.current.focus({ preventScroll: true });
    }
  }, [focusTrigger]);

  const updateField = <K extends keyof ContactFormInput>(
    field: K,
    value: ContactFormInput[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleValidateFormCoupon = async () => {
    const normalized = normalizeCouponCode(formState.couponCode);
    if (!normalized) {
      setErrors((prev) => ({ ...prev, couponCode: 'Enter a coupon code to apply.' }));
      return;
    }

    setApplyingCoupon(true);
    setErrors((prev) => ({ ...prev, couponCode: undefined }));
    try {
      const selectedTier = TIER_NAMES.includes(formState.plan as TierName)
        ? (formState.plan as TierName)
        : undefined;
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized, plan: selectedTier }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.coupon) {
        onApplyCoupon(null);
        setErrors((prev) => ({
          ...prev,
          couponCode: data?.message || 'Invalid or ineligible coupon code.',
        }));
        return;
      }
      onApplyCoupon(data.coupon as PublicCouponSummary);
    } catch {
      setErrors((prev) => ({
        ...prev,
        couponCode: 'Unable to validate coupon right now.',
      }));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validation = validateContactForm(formState);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        if (payload?.errors && typeof payload.errors === 'object') {
          setErrors(payload.errors);
        }
        setServerError(
          payload?.message ||
            'Your inquiry could not be delivered right now. Please verify your details or call +91 89790 71924.'
        );
        return;
      }

      setSuccessInfo({
        referenceId: payload.referenceId,
        deliveryMode: payload.deliveryMode,
        discountSummary: payload.discountSummary,
        message: payload.message,
      });
      setErrors({});
      setFormState({
        name: '',
        email: '',
        phone: '',
        service: '',
        plan: 'Custom / Not Sure',
        couponCode: '',
        description: '',
      });
      onApplyCoupon(null);
    } catch {
      setServerError(
        'Network connection error while reaching the Craft Stack inquiry server. Please try again or call +91 89790 71924.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setServerError(null);
    setErrors({});
  };

  return (
    <section
      id="contact"
      className="border-t border-white/5 bg-[#101525] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-sm font-medium text-[#00D4FF]">Contact Craft Stack</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
                Let&apos;s Discuss Your Website Project
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#AAB2C5]">
                Share your goals, timeline, and required features. Our Noida team will respond with
                a clear scope and project estimate.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-[#080B18]/80 p-6">
              <div>
                <p className="text-xs font-medium text-[#AAB2C5]">Studio Name</p>
                <p className="mt-1 font-display text-lg font-bold text-white">
                  {BUSINESS_INFO.name}
                </p>
                <p className="text-sm text-[#AAB2C5]">{BUSINESS_INFO.tagline}</p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-[#AAB2C5]">Direct Phone</p>
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="mt-1.5 inline-flex items-center gap-2.5 text-base font-semibold text-white transition-colors hover:text-[#00D4FF]"
                >
                  <Phone className="h-4 w-4 text-[#00D4FF]" aria-hidden="true" />
                  <span className="font-mono tabular-nums">{BUSINESS_INFO.phoneRaw}</span>
                </a>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-[#AAB2C5]">Office Location</p>
                <div className="mt-1.5 flex items-start gap-2.5 text-sm leading-relaxed text-white/90">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7957FF]" aria-hidden="true" />
                  <span>{BUSINESS_INFO.address}</span>
                </div>
                <a
                  href={BUSINESS_INFO.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white"
                >
                  <span>Open Location in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-[#AAB2C5]">Studio Hours</p>
                <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-white/90">
                  <Clock className="h-4 w-4 text-[#7957FF]" aria-hidden="true" />
                  <span>{BUSINESS_INFO.hours}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#080B18]/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              {successInfo ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-6 text-center sm:py-10"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF]">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">
                    Project Inquiry Received
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#AAB2C5]">
                    {successInfo.message}
                  </p>
                  <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-xl border border-white/10 bg-[#101525] px-5 py-3">
                    <span className="text-xs text-[#AAB2C5]">Reference ID</span>
                    <span className="mt-0.5 font-mono text-base font-semibold text-[#00D4FF] tabular-nums">
                      {successInfo.referenceId}
                    </span>
                    {successInfo.discountSummary && (
                      <span className="mt-1 text-xs font-medium text-emerald-300">
                        Coupon Applied · {successInfo.discountSummary}
                      </span>
                    )}
                  </div>
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-11 rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#7957FF] hover:bg-[#7957FF]/15 cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-xl font-bold text-white">
                      Request a Free Project Quote
                    </h3>
                    <p className="text-sm text-[#AAB2C5]">
                      All fields are required so we can prepare an accurate proposal.
                    </p>
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-white"
                      >
                        Full Name
                      </label>
                      <input
                        ref={nameInputRef}
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formState.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g., Rohan Verma"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white placeholder-[#AAB2C5]/60 transition-colors focus:outline-none ${
                          errors.name
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-white/12 focus:border-[#7957FF]'
                        }`}
                      />
                      {errors.name && (
                        <p id="contact-name-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-white"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formState.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@company.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white placeholder-[#AAB2C5]/60 transition-colors focus:outline-none ${
                          errors.email
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-white/12 focus:border-[#7957FF]'
                        }`}
                      />
                      {errors.email && (
                        <p id="contact-email-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-sm font-medium text-white"
                      >
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formState.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                        className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white placeholder-[#AAB2C5]/60 transition-colors focus:outline-none ${
                          errors.phone
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-white/12 focus:border-[#7957FF]'
                        }`}
                      />
                      {errors.phone && (
                        <p id="contact-phone-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-service"
                        className="block text-sm font-medium text-white"
                      >
                        Service Needed
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        value={formState.service}
                        onChange={(e) => updateField('service', e.target.value)}
                        aria-invalid={Boolean(errors.service)}
                        aria-describedby={errors.service ? 'contact-service-error' : undefined}
                        className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white transition-colors focus:outline-none ${
                          errors.service
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-white/12 focus:border-[#7957FF]'
                        }`}
                      >
                        <option value="" className="bg-[#101525] text-[#AAB2C5]">
                          Select a service...
                        </option>
                        {SERVICE_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-[#101525] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <p id="contact-service-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.service}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-plan"
                        className="block text-sm font-medium text-white"
                      >
                        Package Tier
                      </label>
                      <select
                        id="contact-plan"
                        name="plan"
                        value={formState.plan || 'Custom / Not Sure'}
                        onChange={(e) => updateField('plan', e.target.value)}
                        aria-invalid={Boolean(errors.plan)}
                        aria-describedby={errors.plan ? 'contact-plan-error' : undefined}
                        className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white transition-colors focus:outline-none ${
                          errors.plan
                            ? 'border-rose-500/70 focus:border-rose-400'
                            : 'border-white/12 focus:border-[#7957FF]'
                        }`}
                      >
                        {PLAN_OPTIONS.map((planOption) => {
                          const matchedPlan = PRICING_PLANS.find((plan) => plan.name === planOption);
                          const label = matchedPlan
                            ? `${matchedPlan.name} (${matchedPlan.priceInr} / ${matchedPlan.priceUsd} min.)`
                            : planOption;

                          return (
                            <option
                              key={planOption}
                              value={planOption}
                              className="bg-[#101525] text-white"
                            >
                              {label}
                            </option>
                          );
                        })}
                      </select>
                      {errors.plan && (
                        <p id="contact-plan-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.plan}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-coupon"
                        className="block text-sm font-medium text-white"
                      >
                        Coupon Code (Optional)
                      </label>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          id="contact-coupon"
                          name="couponCode"
                          type="text"
                          value={formState.couponCode || ''}
                          onChange={(e) => {
                            const nextVal = e.target.value.toUpperCase();
                            updateField('couponCode', nextVal);
                            if (appliedCoupon && nextVal !== appliedCoupon.code) {
                              onApplyCoupon(null);
                            }
                          }}
                          placeholder="e.g., LAUNCH20"
                          aria-invalid={Boolean(errors.couponCode)}
                          aria-describedby={
                            errors.couponCode ? 'contact-coupon-error' : undefined
                          }
                          className={`block w-full rounded-xl border bg-[#101525] px-4 py-3 font-mono text-sm uppercase text-white placeholder-[#AAB2C5]/60 transition-colors focus:outline-none ${
                            errors.couponCode
                              ? 'border-rose-500/70 focus:border-rose-400'
                              : 'border-white/12 focus:border-[#7957FF]'
                          }`}
                        />
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyCoupon(null);
                              updateField('couponCode', '');
                            }}
                            aria-label="Remove applied coupon"
                            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs font-medium text-[#AAB2C5] hover:text-white cursor-pointer"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            <span>Clear</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={applyingCoupon}
                            onClick={() => void handleValidateFormCoupon()}
                            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#7957FF]/60 bg-[#7957FF]/15 px-4 text-xs font-semibold text-white transition-colors hover:bg-[#7957FF]/30 disabled:opacity-60 cursor-pointer"
                          >
                            {applyingCoupon ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Tag className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />
                            )}
                            <span>Apply</span>
                          </button>
                        )}
                      </div>
                      {errors.couponCode && (
                        <p id="contact-coupon-error" className="mt-1.5 text-xs text-rose-300">
                          {errors.couponCode}
                        </p>
                      )}
                      {appliedCoupon && !errors.couponCode && (() => {
                        const tier = TIER_NAMES.includes(formState.plan as TierName)
                          ? (formState.plan as TierName)
                          : null;
                        const planMeta = tier
                          ? PRICING_PLANS.find((p) => p.name === tier)
                          : null;
                        if (tier && planMeta) {
                          const breakdown = calculateDiscountedPrice(
                            parseNumericPrice(planMeta.priceInr),
                            parseNumericPrice(planMeta.priceUsd),
                            tier,
                            appliedCoupon
                          );
                          return breakdown.isApplicable ? (
                            <p className="mt-1.5 text-xs text-emerald-300">
                              Discounted estimate: {formatCurrencyPrice(breakdown.finalInr, 'INR')} /{' '}
                              {formatCurrencyPrice(breakdown.finalUsd, 'USD')} min. ({breakdown.label})
                            </p>
                          ) : (
                            <p className="mt-1.5 text-xs text-amber-300">
                              Coupon {appliedCoupon.code} applies only to{' '}
                              {appliedCoupon.applicablePlans.join(' & ')}.
                            </p>
                          );
                        }
                        return (
                          <p className="mt-1.5 text-xs text-[#00D4FF]">
                            Coupon {appliedCoupon.code} verified and ready.
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-description"
                      className="block text-sm font-medium text-white"
                    >
                      Project Description
                    </label>
                    <textarea
                      id="contact-description"
                      name="description"
                      rows={4}
                      value={formState.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Tell us about your business, key pages or features needed, and your target launch timeline..."
                      aria-invalid={Boolean(errors.description)}
                      aria-describedby={
                        errors.description ? 'contact-description-error' : undefined
                      }
                      className={`mt-2 block w-full rounded-xl border bg-[#101525] px-4 py-3 text-sm text-white placeholder-[#AAB2C5]/60 transition-colors focus:outline-none ${
                        errors.description
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : 'border-white/12 focus:border-[#7957FF]'
                      }`}
                    />
                    {errors.description && (
                      <p id="contact-description-error" className="mt-1.5 text-xs text-rose-300">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(121,87,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(121,87,255,0.65)] disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer sm:w-auto"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          <span>Submitting Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Project Inquiry</span>
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
