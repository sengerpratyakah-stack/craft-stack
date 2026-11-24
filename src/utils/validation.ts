export interface ContactFormInput {
  name: string;
  email: string;
  phone: string;
  service: string;
  plan?: string;
  couponCode?: string;
  description: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>;

export interface ValidationResult {
  isValid: boolean;
  sanitized: ContactFormInput;
  errors: ContactFormErrors;
}

export const SERVICE_OPTIONS = [
  'Website Design',
  'Website Development',
  'E-Commerce Website Development',
  'Business Website Development',
  'Landing Page Design',
  'UI/UX Design',
  'Portfolio Website Development',
  'Website Redesign & Optimization',
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export const PLAN_OPTIONS = [
  'Standard',
  'Platinum',
  'Premium',
  'Custom / Not Sure',
] as const;

export type PlanOption = (typeof PLAN_OPTIONS)[number];

export type PortfolioCategory =
  | 'All'
  | 'Business Websites'
  | 'E-Commerce Websites'
  | 'Portfolio Websites'
  | 'Landing Pages'
  | 'Creative Websites';

export interface PortfolioFilterable {
  id: string;
  category: Exclude<PortfolioCategory, 'All'>;
}

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function validateContactForm(input: Partial<ContactFormInput>): ValidationResult {
  const rawPlan = sanitizeText(input.plan, 40);
  const rawCoupon = sanitizeText(input.couponCode, 24)
    .toUpperCase()
    .replace(/\s+/g, '');
  const sanitized: ContactFormInput = {
    name: sanitizeText(input.name, 120),
    email: sanitizeText(input.email, 160).toLowerCase(),
    phone: sanitizeText(input.phone, 24),
    service: sanitizeText(input.service, 100),
    plan: rawPlan || 'Custom / Not Sure',
    ...(rawCoupon ? { couponCode: rawCoupon } : {}),
    description: sanitizeText(input.description, 2000),
  };

  const errors: ContactFormErrors = {};

  if (!sanitized.name) {
    errors.name = 'Please enter your full name.';
  } else if (sanitized.name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!sanitized.email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(sanitized.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const digits = normalizePhoneDigits(sanitized.phone);
  if (!sanitized.phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (digits.length < 10 || digits.length > 15) {
    errors.phone = 'Please enter a valid 10 to 15 digit phone number.';
  }

  if (!sanitized.service) {
    errors.service = 'Please select the service you need.';
  } else if (!SERVICE_OPTIONS.includes(sanitized.service as ServiceOption)) {
    errors.service = 'Please choose a valid service from the list.';
  }

  if (sanitized.plan && !PLAN_OPTIONS.includes(sanitized.plan as PlanOption)) {
    errors.plan = 'Please choose a valid package tier.';
  }

  if (sanitized.couponCode && !/^[A-Z0-9][A-Z0-9_-]{1,22}[A-Z0-9]$/.test(sanitized.couponCode)) {
    errors.couponCode = 'Coupon code must be 3–24 letters, numbers, hyphens, or underscores.';
  }

  if (!sanitized.description) {
    errors.description = 'Please describe your project goals and requirements.';
  } else if (sanitized.description.length < 15) {
    errors.description = 'Please share at least 15 characters about your project.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    sanitized,
    errors,
  };
}

export function filterPortfolioProjects<T extends PortfolioFilterable>(
  projects: readonly T[],
  category: PortfolioCategory
): T[] {
  if (category === 'All') {
    return [...projects];
  }
  return projects.filter((project) => project.category === category);
}

export function isSafeWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
