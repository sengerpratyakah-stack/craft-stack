import { PlanOption } from './validation';

export type TierName = Exclude<PlanOption, 'Custom / Not Sure'>;

export const TIER_NAMES: readonly TierName[] = ['Standard', 'Platinum', 'Premium'] as const;

export type DiscountType = 'percent' | 'fixed';

export interface CouponRecord {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountUsd?: number;
  applicablePlans: TierName[];
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  note: string;
  active: boolean;
  createdAt: string;
}

export interface PublicCouponSummary {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountUsd?: number;
  applicablePlans: TierName[];
  expiresAt: string | null;
  note: string;
}

export interface CouponCreateInput {
  code: string;
  discountType: DiscountType;
  discountValue: number | string;
  discountUsd?: number | string;
  applicablePlans: TierName[];
  maxUses?: number | string | null;
  expiresAt?: string | null;
  note?: string;
}

export interface CouponValidationErrors {
  code?: string;
  discountType?: string;
  discountValue?: string;
  discountUsd?: string;
  applicablePlans?: string;
  maxUses?: string;
  expiresAt?: string;
  note?: string;
}

const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,22}[A-Z0-9]$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeCouponCode(raw: unknown): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isValidCouponCodeFormat(code: string): boolean {
  return COUPON_CODE_PATTERN.test(code);
}

export function parseNumericPrice(formatted: string): number {
  const digits = formatted.replace(/[^\d]/g, '');
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyPrice(amount: number, currency: 'INR' | 'USD'): string {
  const rounded = Math.max(0, Math.round(amount));
  if (currency === 'INR') {
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
  return `$${rounded.toLocaleString('en-US')}`;
}

export function validateCouponCreateInput(input: Partial<CouponCreateInput>): {
  isValid: boolean;
  errors: CouponValidationErrors;
  sanitized: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    discountUsd?: number;
    applicablePlans: TierName[];
    maxUses: number | null;
    expiresAt: string | null;
    note: string;
  };
} {
  const errors: CouponValidationErrors = {};
  const code = normalizeCouponCode(input.code);
  const discountType: DiscountType = input.discountType === 'fixed' ? 'fixed' : 'percent';

  if (!code) {
    errors.code = 'Please enter a coupon code (e.g., LAUNCH20).';
  } else if (!isValidCouponCodeFormat(code)) {
    errors.code = 'Use 3–24 letters, numbers, hyphens, or underscores.';
  }

  const rawValue =
    typeof input.discountValue === 'number'
      ? input.discountValue
      : Number.parseFloat(String(input.discountValue ?? '').trim());

  let discountValue = Number.isFinite(rawValue) ? Math.round(rawValue) : 0;

  if (!Number.isFinite(rawValue) || discountValue <= 0) {
    errors.discountValue = 'Discount value must be greater than zero.';
  } else if (discountType === 'percent' && discountValue > 90) {
    errors.discountValue = 'Percentage discount cannot exceed 90%.';
  } else if (discountType === 'fixed' && discountValue > 50000) {
    errors.discountValue = 'Flat discount cannot exceed ₹50,000.';
  }

  let discountUsd: number | undefined;
  if (discountType === 'fixed') {
    const rawUsd =
      input.discountUsd === undefined || input.discountUsd === null || String(input.discountUsd).trim() === ''
        ? Math.max(1, Math.round(discountValue / 50))
        : Number.parseFloat(String(input.discountUsd).trim());

    if (!Number.isFinite(rawUsd) || rawUsd <= 0 || rawUsd > 1000) {
      errors.discountUsd = 'USD discount must be between $1 and $1,000.';
    } else {
      discountUsd = Math.round(rawUsd);
    }
  }

  const rawPlans = Array.isArray(input.applicablePlans) ? input.applicablePlans : [];
  const applicablePlans = TIER_NAMES.filter((tier) => rawPlans.includes(tier));
  if (applicablePlans.length === 0) {
    errors.applicablePlans = 'Select at least one package tier.';
  }

  let maxUses: number | null = null;
  if (input.maxUses !== undefined && input.maxUses !== null && String(input.maxUses).trim() !== '') {
    const parsedMax = Number.parseInt(String(input.maxUses).trim(), 10);
    if (!Number.isFinite(parsedMax) || parsedMax < 1 || parsedMax > 100000) {
      errors.maxUses = 'Usage limit must be between 1 and 100,000.';
    } else {
      maxUses = parsedMax;
    }
  }

  let expiresAt: string | null = null;
  if (input.expiresAt && String(input.expiresAt).trim() !== '') {
    const rawDate = String(input.expiresAt).trim();
    if (!DATE_PATTERN.test(rawDate)) {
      errors.expiresAt = 'Use YYYY-MM-DD format for expiry date.';
    } else {
      expiresAt = rawDate;
    }
  }

  const note =
    typeof input.note === 'string'
      ? input.note
          .replace(/[\u0000-\u001F\u007F]/g, '')
          .trim()
          .slice(0, 120)
      : '';

  if (discountValue <= 0) {
    discountValue = 0;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      code,
      discountType,
      discountValue,
      ...(discountUsd !== undefined ? { discountUsd } : {}),
      applicablePlans,
      maxUses,
      expiresAt,
      note,
    },
  };
}

export function checkCouponEligibility(
  coupon: CouponRecord,
  planName?: TierName,
  nowDate: Date = new Date()
): { valid: boolean; reason?: string } {
  if (!coupon.active) {
    return { valid: false, reason: 'This coupon code is currently paused.' };
  }

  if (coupon.expiresAt) {
    const todayIso = nowDate.toISOString().slice(0, 10);
    if (todayIso > coupon.expiresAt) {
      return { valid: false, reason: `This coupon expired on ${coupon.expiresAt}.` };
    }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: 'This coupon has reached its redemption limit.' };
  }

  if (planName && !coupon.applicablePlans.includes(planName)) {
    return {
      valid: false,
      reason: `Valid only for ${coupon.applicablePlans.join(' & ')} packages.`,
    };
  }

  return { valid: true };
}

export function toPublicCouponSummary(coupon: CouponRecord): PublicCouponSummary {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    ...(coupon.discountUsd !== undefined ? { discountUsd: coupon.discountUsd } : {}),
    applicablePlans: [...coupon.applicablePlans],
    expiresAt: coupon.expiresAt,
    note: coupon.note,
  };
}

export interface DiscountedPriceBreakdown {
  isApplicable: boolean;
  baseInr: number;
  baseUsd: number;
  finalInr: number;
  finalUsd: number;
  savingsInr: number;
  savingsUsd: number;
  label: string;
}

export function calculateDiscountedPrice(
  baseInr: number,
  baseUsd: number,
  planName: TierName,
  coupon: PublicCouponSummary | null
): DiscountedPriceBreakdown {
  if (!coupon || !coupon.applicablePlans.includes(planName)) {
    return {
      isApplicable: false,
      baseInr,
      baseUsd,
      finalInr: baseInr,
      finalUsd: baseUsd,
      savingsInr: 0,
      savingsUsd: 0,
      label: '',
    };
  }

  if (coupon.discountType === 'percent') {
    const pct = Math.min(90, Math.max(1, coupon.discountValue));
    const savingsInr = Math.round((baseInr * pct) / 100);
    const savingsUsd = Math.round((baseUsd * pct) / 100);
    const finalInr = Math.max(1, baseInr - savingsInr);
    const finalUsd = Math.max(1, baseUsd - savingsUsd);

    return {
      isApplicable: true,
      baseInr,
      baseUsd,
      finalInr,
      finalUsd,
      savingsInr: baseInr - finalInr,
      savingsUsd: baseUsd - finalUsd,
      label: `${pct}% OFF`,
    };
  }

  const fixedInr = Math.max(0, coupon.discountValue);
  const fixedUsd =
    coupon.discountUsd !== undefined
      ? Math.max(0, coupon.discountUsd)
      : Math.max(1, Math.round(fixedInr / 50));

  const finalInr = Math.max(1, baseInr - fixedInr);
  const finalUsd = Math.max(1, baseUsd - fixedUsd);

  return {
    isApplicable: true,
    baseInr,
    baseUsd,
    finalInr,
    finalUsd,
    savingsInr: baseInr - finalInr,
    savingsUsd: baseUsd - finalUsd,
    label: `${formatCurrencyPrice(fixedInr, 'INR')} / ${formatCurrencyPrice(fixedUsd, 'USD')} OFF`,
  };
}
