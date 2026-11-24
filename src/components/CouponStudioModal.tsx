import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  Pause,
  Play,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  CouponRecord,
  CouponValidationErrors,
  DiscountType,
  PublicCouponSummary,
  TIER_NAMES,
  TierName,
  formatCurrencyPrice,
  toPublicCouponSummary,
  validateCouponCreateInput,
} from '../utils/coupons';

interface CouponStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerToken: string | null;
  onAuthenticated: (token: string) => void;
  onSignOut: () => void;
  onApplyCouponPreview: (coupon: PublicCouponSummary) => void;
  onCouponMutated: (changedCode?: string, removedOrPaused?: boolean) => void;
}

type AdminStatusSource = 'env' | 'claimed' | 'unclaimed';

export const CouponStudioModal: React.FC<CouponStudioModalProps> = ({
  isOpen,
  onClose,
  ownerToken,
  onAuthenticated,
  onSignOut,
  onApplyCouponPreview,
  onCouponMutated,
}) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusSource, setStatusSource] = useState<AdminStatusSource>('claimed');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [discountUsd, setDiscountUsd] = useState('');
  const [applicablePlans, setApplicablePlans] = useState<TierName[]>([...TIER_NAMES]);
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [formErrors, setFormErrors] = useState<CouponValidationErrors>({});
  const [creating, setCreating] = useState(false);
  const [busyCouponId, setBusyCouponId] = useState<string | null>(null);

  const fetchAdminStatus = useCallback(async () => {
    setStatusLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/coupons/admin/status');
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok) {
        setStatusSource(data.source as AdminStatusSource);
      }
    } catch {
      setAuthError('Unable to reach the Craft Stack server.');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchCoupons = useCallback(
    async (token: string) => {
      setCouponsLoading(true);
      setStudioError(null);
      try {
        const response = await fetch('/api/coupons', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => null);
        if (response.status === 401) {
          onSignOut();
          setAuthError('Your session expired. Please unlock Coupon Studio again.');
          return;
        }
        if (!response.ok || !data?.ok) {
          setStudioError(data?.message || 'Unable to load your coupons.');
          return;
        }
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      } catch {
        setStudioError('Network error while loading your coupons.');
      } finally {
        setCouponsLoading(false);
      }
    },
    [onSignOut]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!ownerToken) {
      void fetchAdminStatus();
    } else {
      void fetchCoupons(ownerToken);
    }
  }, [isOpen, ownerToken, fetchAdminStatus, fetchCoupons]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSetupPasscode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const trimmed = passcode.trim();
    if (trimmed.length < 6) {
      setAuthError('Passcode must be at least 6 characters.');
      return;
    }
    if (trimmed !== confirmPasscode.trim()) {
      setAuthError('Passcodes do not match.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const response = await fetch('/api/coupons/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.token) {
        setAuthError(data?.message || 'Unable to save owner passcode.');
        if (response.status === 409) {
          void fetchAdminStatus();
        }
        return;
      }
      setPasscode('');
      setConfirmPasscode('');
      onAuthenticated(data.token);
    } catch {
      setAuthError('Network error while setting up your passcode.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    if (!passcode.trim()) {
      setAuthError('Please enter your owner passcode.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const response = await fetch('/api/coupons/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.token) {
        setAuthError(data?.message || 'Incorrect passcode.');
        return;
      }
      setPasscode('');
      onAuthenticated(data.token);
    } catch {
      setAuthError('Network error while signing in.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const toggleTier = (tier: TierName) => {
    setApplicablePlans((prev) =>
      prev.includes(tier) ? prev.filter((item) => item !== tier) : [...prev, tier]
    );
    if (formErrors.applicablePlans) {
      setFormErrors((prev) => ({ ...prev, applicablePlans: undefined }));
    }
  };

  const handleCreateCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerToken) return;
    setStudioError(null);

    const check = validateCouponCreateInput({
      code,
      discountType,
      discountValue,
      discountUsd: discountType === 'fixed' ? discountUsd : undefined,
      applicablePlans,
      maxUses,
      expiresAt,
      note,
    });

    if (!check.isValid) {
      setFormErrors(check.errors);
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify(check.sanitized),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        onSignOut();
        return;
      }
      if (!response.ok || !data?.ok || !data?.coupon) {
        if (data?.errors) {
          setFormErrors(data.errors);
        }
        setStudioError(data?.message || 'Could not create coupon.');
        return;
      }

      setCoupons((prev) => [data.coupon as CouponRecord, ...prev]);
      setCode('');
      setDiscountValue('');
      setDiscountUsd('');
      setApplicablePlans([...TIER_NAMES]);
      setMaxUses('');
      setExpiresAt('');
      setNote('');
      setFormErrors({});
    } catch {
      setStudioError('Network error while saving coupon.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (coupon: CouponRecord) => {
    if (!ownerToken) return;
    setBusyCouponId(coupon.id);
    setStudioError(null);
    try {
      const response = await fetch(`/api/coupons/${encodeURIComponent(coupon.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        onSignOut();
        return;
      }
      if (!response.ok || !data?.ok || !data?.coupon) {
        setStudioError(data?.message || 'Unable to update coupon status.');
        return;
      }
      const updated = data.coupon as CouponRecord;
      setCoupons((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      onCouponMutated(updated.code, !updated.active);
    } catch {
      setStudioError('Network error while updating coupon.');
    } finally {
      setBusyCouponId(null);
    }
  };

  const handleDeleteCoupon = async (coupon: CouponRecord) => {
    if (!ownerToken) return;
    setBusyCouponId(coupon.id);
    setStudioError(null);
    try {
      const response = await fetch(`/api/coupons/${encodeURIComponent(coupon.id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        onSignOut();
        return;
      }
      if (!response.ok || !data?.ok) {
        setStudioError(data?.message || 'Unable to delete coupon.');
        return;
      }
      setCoupons((prev) => prev.filter((item) => item.id !== coupon.id));
      onCouponMutated(coupon.code, true);
    } catch {
      setStudioError('Network error while deleting coupon.');
    } finally {
      setBusyCouponId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#04060E]/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0C1022] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0C1022]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7957FF]/40 bg-[#7957FF]/15 text-[#00D4FF]">
              <Tag className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="coupon-studio-title" className="font-display text-lg font-bold text-white">
                Owner Coupon Studio
              </h2>
              <p className="text-xs text-[#AAB2C5]">
                Create and manage your own discount codes for Standard, Platinum &amp; Premium plans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ownerToken && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#AAB2C5] transition-colors hover:border-white/30 hover:text-white whitespace-nowrap cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Lock Studio</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Owner Coupon Studio"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#AAB2C5] transition-colors hover:border-white/30 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!ownerToken ? (
            <div className="mx-auto max-w-md py-4">
              {statusLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#AAB2C5]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#00D4FF]" aria-hidden="true" />
                  <span>Checking studio security...</span>
                </div>
              ) : statusSource === 'unclaimed' ? (
                <form onSubmit={handleSetupPasscode} className="space-y-4">
                  <div className="rounded-xl border border-[#00D4FF]/25 bg-[#00D4FF]/5 p-4 text-xs leading-relaxed text-[#AAB2C5]">
                    <p className="font-semibold text-white">First-Time Owner Setup</p>
                    <p className="mt-1">
                      Set a private passcode so only you can create, pause, or delete coupon codes.
                      You can also configure <code className="font-mono text-[#00D4FF]">COUPON_ADMIN_PASSCODE</code> in environment secrets.
                    </p>
                  </div>

                  {authError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="setup-passcode" className="block text-xs font-medium text-white">
                      Choose Owner Passcode (min. 6 characters)
                    </label>
                    <input
                      id="setup-passcode"
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter a secure passcode"
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#101525] px-4 py-2.5 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-passcode" className="block text-xs font-medium text-white">
                      Confirm Owner Passcode
                    </label>
                    <input
                      id="confirm-passcode"
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Re-enter passcode"
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#101525] px-4 py-2.5 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(121,87,255,0.4)] hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  >
                    {authSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>Set Passcode &amp; Open Studio</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-[#101525] p-4 text-xs leading-relaxed text-[#AAB2C5]">
                    <p className="font-semibold text-white">Unlock Owner Coupon Studio</p>
                    <p className="mt-1">
                      Enter your owner passcode to create new discount codes or update active offers.
                    </p>
                  </div>

                  {authError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="owner-passcode" className="block text-xs font-medium text-white">
                      Owner Passcode
                    </label>
                    <input
                      id="owner-passcode"
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter your owner passcode"
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#101525] px-4 py-2.5 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(121,87,255,0.4)] hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  >
                    {authSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>Unlock Coupon Studio</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <form
                onSubmit={handleCreateCoupon}
                noValidate
                className="space-y-4 rounded-2xl border border-white/10 bg-[#101525]/80 p-5 lg:col-span-5"
              >
                <h3 className="font-display text-base font-bold text-white">Create New Coupon</h3>

                {studioError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                    <span>{studioError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="coupon-code-input" className="block text-xs font-medium text-white">
                    Coupon Code
                  </label>
                  <input
                    id="coupon-code-input"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }));
                    }}
                    placeholder="e.g., LAUNCH20"
                    className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3.5 py-2.5 font-mono text-sm uppercase text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-xs text-rose-300">{formErrors.code}</p>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-white">Discount Type</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#080B18] p-1">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        discountType === 'percent'
                          ? 'bg-[#7957FF] text-white'
                          : 'text-[#AAB2C5] hover:text-white'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        discountType === 'fixed'
                          ? 'bg-[#7957FF] text-white'
                          : 'text-[#AAB2C5] hover:text-white'
                      }`}
                    >
                      Flat Amount (₹ / $)
                    </button>
                  </div>
                </div>

                <div className={discountType === 'fixed' ? 'grid grid-cols-2 gap-3' : ''}>
                  <div>
                    <label
                      htmlFor="coupon-value-input"
                      className="block text-xs font-medium text-white"
                    >
                      {discountType === 'percent' ? 'Discount Percentage (%)' : 'Flat Off (INR ₹)'}
                    </label>
                    <input
                      id="coupon-value-input"
                      type="number"
                      min={1}
                      max={discountType === 'percent' ? 90 : 50000}
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(e.target.value);
                        if (formErrors.discountValue) {
                          setFormErrors((prev) => ({ ...prev, discountValue: undefined }));
                        }
                      }}
                      placeholder={discountType === 'percent' ? '20' : '1500'}
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3.5 py-2.5 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none tabular-nums"
                    />
                    {formErrors.discountValue && (
                      <p className="mt-1 text-xs text-rose-300">{formErrors.discountValue}</p>
                    )}
                  </div>

                  {discountType === 'fixed' && (
                    <div>
                      <label
                        htmlFor="coupon-usd-input"
                        className="block text-xs font-medium text-white"
                      >
                        Flat Off (USD $)
                      </label>
                      <input
                        id="coupon-usd-input"
                        type="number"
                        min={1}
                        max={1000}
                        value={discountUsd}
                        onChange={(e) => {
                          setDiscountUsd(e.target.value);
                          if (formErrors.discountUsd) {
                            setFormErrors((prev) => ({ ...prev, discountUsd: undefined }));
                          }
                        }}
                        placeholder="Auto"
                        className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3.5 py-2.5 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none tabular-nums"
                      />
                      {formErrors.discountUsd && (
                        <p className="mt-1 text-xs text-rose-300">{formErrors.discountUsd}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-medium text-white">Eligible Packages</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {TIER_NAMES.map((tier) => {
                      const checked = applicablePlans.includes(tier);
                      return (
                        <button
                          key={tier}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleTier(tier)}
                          className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                            checked
                              ? 'border-[#00D4FF]/60 bg-[#00D4FF]/15 text-white'
                              : 'border-white/15 bg-[#080B18] text-[#AAB2C5] hover:text-white'
                          }`}
                        >
                          {checked && <Check className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />}
                          <span>{tier}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.applicablePlans && (
                    <p className="mt-1 text-xs text-rose-300">{formErrors.applicablePlans}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="coupon-max-uses" className="block text-xs font-medium text-white">
                      Max Uses (Optional)
                    </label>
                    <input
                      id="coupon-max-uses"
                      type="number"
                      min={1}
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      placeholder="Unlimited"
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3.5 py-2 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="coupon-expiry" className="block text-xs font-medium text-white">
                      Expiry Date (Optional)
                    </label>
                    <input
                      id="coupon-expiry"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3 py-2 text-sm text-white focus:border-[#7957FF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="coupon-note" className="block text-xs font-medium text-white">
                    Offer Label / Note (Optional)
                  </label>
                  <input
                    id="coupon-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Startup Launch Offer"
                    className="mt-1.5 block w-full rounded-xl border border-white/15 bg-[#080B18] px-3.5 py-2 text-sm text-white placeholder-[#AAB2C5]/60 focus:border-[#7957FF] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(121,87,255,0.4)] hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>Create Coupon</span>
                </button>
              </form>

              <div className="space-y-4 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-white">
                    Your Coupon Codes ({coupons.length})
                  </h3>
                </div>

                {couponsLoading ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#101525]/50 py-12 text-sm text-[#AAB2C5]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#00D4FF]" aria-hidden="true" />
                    <span>Loading coupons...</span>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-[#101525]/40 p-8 text-center">
                    <Tag className="mx-auto h-7 w-7 text-[#7957FF]" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-white">No coupons created yet</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#AAB2C5]">
                      Create your first discount code using the form. Only coupons you create here
                      can be redeemed on the price list and quote form.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {coupons.map((coupon) => {
                      const isBusy = busyCouponId === coupon.id;
                      const discountLabel =
                        coupon.discountType === 'percent'
                          ? `${coupon.discountValue}% OFF`
                          : `${formatCurrencyPrice(coupon.discountValue, 'INR')} / ${formatCurrencyPrice(
                              coupon.discountUsd ?? Math.max(1, Math.round(coupon.discountValue / 50)),
                              'USD'
                            )} OFF`;

                      return (
                        <div
                          key={coupon.id}
                          className="rounded-2xl border border-white/10 bg-[#101525]/85 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-base font-bold tracking-wide text-white">
                                  {coupon.code}
                                </span>
                                <span className="text-xs font-semibold text-[#00D4FF]">
                                  {discountLabel}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    coupon.active ? 'text-emerald-300' : 'text-[#AAB2C5]'
                                  }`}
                                >
                                  · {coupon.active ? 'Active' : 'Paused'}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-[#AAB2C5]">
                                Tiers: {coupon.applicablePlans.join(', ')} · Uses:{' '}
                                <span className="font-mono tabular-nums text-white/90">
                                  {coupon.usedCount}
                                  {coupon.maxUses !== null ? `/${coupon.maxUses}` : ' (unlimited)'}
                                </span>
                                {coupon.expiresAt ? ` · Expires ${coupon.expiresAt}` : ''}
                              </p>
                              {coupon.note && (
                                <p className="mt-1 text-xs text-white/80">{coupon.note}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {coupon.active && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    onApplyCouponPreview(toPublicCouponSummary(coupon));
                                    onClose();
                                  }}
                                  className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-2.5 py-1 text-xs font-medium text-[#00D4FF] transition-colors hover:bg-[#00D4FF]/20 whitespace-nowrap cursor-pointer"
                                >
                                  <span>Apply to Price List</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleToggleActive(coupon)}
                                aria-label={`${coupon.active ? 'Pause' : 'Activate'} coupon ${coupon.code}`}
                                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-white/30 whitespace-nowrap cursor-pointer"
                              >
                                {coupon.active ? (
                                  <>
                                    <Pause className="h-3 w-3" aria-hidden="true" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3" aria-hidden="true" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleDeleteCoupon(coupon)}
                                aria-label={`Delete coupon ${coupon.code}`}
                                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/20 whitespace-nowrap cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
