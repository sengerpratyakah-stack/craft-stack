import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDiscountedPrice,
  checkCouponEligibility,
  CouponRecord,
  formatCurrencyPrice,
  normalizeCouponCode,
  parseNumericPrice,
  validateCouponCreateInput,
} from './coupons';

test('normalizeCouponCode trims, strips spaces, and uppercases codes', () => {
  assert.equal(normalizeCouponCode('  craft 20 '), 'CRAFT20');
  assert.equal(normalizeCouponCode('diwali-500'), 'DIWALI-500');
});

test('validateCouponCreateInput validates percent and flat coupons cleanly', () => {
  const validPercent = validateCouponCreateInput({
    code: 'craft25',
    discountType: 'percent',
    discountValue: 25,
    applicablePlans: ['Standard', 'Platinum'],
    maxUses: '50',
    expiresAt: '2027-12-31',
    note: 'Founder promo',
  });

  assert.equal(validPercent.isValid, true);
  assert.equal(validPercent.sanitized.code, 'CRAFT25');
  assert.equal(validPercent.sanitized.discountValue, 25);
  assert.deepEqual(validPercent.sanitized.applicablePlans, ['Standard', 'Platinum']);
  assert.equal(validPercent.sanitized.maxUses, 50);

  const validFixed = validateCouponCreateInput({
    code: 'flat1000',
    discountType: 'fixed',
    discountValue: '1000',
    applicablePlans: ['Platinum', 'Premium'],
  });

  assert.equal(validFixed.isValid, true);
  assert.equal(validFixed.sanitized.discountValue, 1000);
  assert.equal(validFixed.sanitized.discountUsd, 20);

  const invalid = validateCouponCreateInput({
    code: 'x',
    discountType: 'percent',
    discountValue: 99,
    applicablePlans: [],
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.code);
  assert.ok(invalid.errors.discountValue);
  assert.ok(invalid.errors.applicablePlans);
});

test('calculateDiscountedPrice computes percent and fixed discounts accurately across currencies', () => {
  const percentBreakdown = calculateDiscountedPrice(9999, 199, 'Platinum', {
    code: 'SAVE20',
    discountType: 'percent',
    discountValue: 20,
    applicablePlans: ['Standard', 'Platinum', 'Premium'],
    expiresAt: null,
    note: '',
  });

  assert.equal(percentBreakdown.isApplicable, true);
  assert.equal(percentBreakdown.finalInr, 7999);
  assert.equal(percentBreakdown.finalUsd, 159);
  assert.equal(percentBreakdown.savingsInr, 2000);
  assert.equal(percentBreakdown.savingsUsd, 40);

  const excludedTier = calculateDiscountedPrice(4999, 99, 'Standard', {
    code: 'VIPONLY',
    discountType: 'fixed',
    discountValue: 2000,
    discountUsd: 40,
    applicablePlans: ['Platinum', 'Premium'],
    expiresAt: null,
    note: '',
  });

  assert.equal(excludedTier.isApplicable, false);
  assert.equal(excludedTier.finalInr, 4999);
  assert.equal(excludedTier.finalUsd, 99);

  const floorClamped = calculateDiscountedPrice(4999, 99, 'Standard', {
    code: 'MEGA10000',
    discountType: 'fixed',
    discountValue: 10000,
    discountUsd: 200,
    applicablePlans: ['Standard'],
    expiresAt: null,
    note: '',
  });
  assert.equal(floorClamped.finalInr, 1);
  assert.equal(floorClamped.finalUsd, 1);
});

test('checkCouponEligibility enforces active status, expiry date, usage limit, and tier', () => {
  const baseCoupon: CouponRecord = {
    id: 'cpn_1',
    code: 'OWNER15',
    discountType: 'percent',
    discountValue: 15,
    applicablePlans: ['Platinum', 'Premium'],
    maxUses: 5,
    usedCount: 2,
    expiresAt: '2026-12-31',
    note: '',
    active: true,
    createdAt: '2026-11-24T00:00:00.000Z',
  };

  assert.equal(
    checkCouponEligibility(baseCoupon, 'Platinum', new Date('2026-11-24T12:00:00Z')).valid,
    true
  );
  assert.equal(
    checkCouponEligibility(baseCoupon, 'Standard', new Date('2026-11-24T12:00:00Z')).valid,
    false
  );
  assert.equal(
    checkCouponEligibility(baseCoupon, 'Platinum', new Date('2027-01-02T12:00:00Z')).valid,
    false
  );
  assert.equal(
    checkCouponEligibility({ ...baseCoupon, usedCount: 5 }, 'Platinum').valid,
    false
  );
  assert.equal(
    checkCouponEligibility({ ...baseCoupon, active: false }, 'Platinum').valid,
    false
  );
});

test('parseNumericPrice and formatCurrencyPrice round-trip INR and USD strings', () => {
  assert.equal(parseNumericPrice('₹19,999'), 19999);
  assert.equal(parseNumericPrice('$399'), 399);
  assert.equal(formatCurrencyPrice(15999, 'INR'), '₹15,999');
  assert.equal(formatCurrencyPrice(319, 'USD'), '$319');
});
