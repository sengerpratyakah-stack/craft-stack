import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactForm,
  filterPortfolioProjects,
  isSafeWebhookUrl,
  sanitizeText,
} from './validation';

test('validateContactForm accepts complete valid inquiry', () => {
  const result = validateContactForm({
    name: '  Aarav Mehta ',
    email: 'Aarav@Example.COM ',
    phone: '+91 89790-71924',
    service: 'Website Design',
    plan: 'Platinum',
    description: 'We need a responsive corporate website for our Noida logistics startup.',
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.name, 'Aarav Mehta');
  assert.equal(result.sanitized.email, 'aarav@example.com');
  assert.equal(result.sanitized.plan, 'Platinum');
});

test('validateContactForm defaults empty plan and rejects unknown plan values', () => {
  const defaulted = validateContactForm({
    name: 'Aarav Mehta',
    email: 'aarav@example.com',
    phone: '8979071924',
    service: 'Website Design',
    description: 'Need a crisp responsive agency website for our team.',
  });
  assert.equal(defaulted.isValid, true);
  assert.equal(defaulted.sanitized.plan, 'Custom / Not Sure');

  const invalid = validateContactForm({
    name: 'Aarav Mehta',
    email: 'aarav@example.com',
    phone: '8979071924',
    service: 'Website Design',
    plan: 'Diamond',
    couponCode: '!!',
    description: 'Need a crisp responsive agency website for our team.',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.plan);
  assert.ok(invalid.errors.couponCode);
});

test('validateContactForm rejects empty submission with field-level errors', () => {
  const result = validateContactForm({
    name: '',
    email: '',
    phone: '',
    service: '',
    description: '',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.service);
  assert.ok(result.errors.description);
});

test('validateContactForm rejects malformed email, short phone, invalid service, and brief description', () => {
  const result = validateContactForm({
    name: 'Priya',
    email: 'invalid-email',
    phone: '12345',
    service: 'Unknown Service',
    description: 'Too short',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.name, undefined);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.service);
  assert.ok(result.errors.description);
});

test('sanitizeText strips control characters and caps length', () => {
  const cleaned = sanitizeText('  Hello\u0000World\u0007  ', 8);
  assert.equal(cleaned, 'HelloWor');
});

test('filterPortfolioProjects filters by category and returns all when All is active', () => {
  const sample = [
    {id: '1', category: 'Business Websites' as const},
    {id: '2', category: 'E-Commerce Websites' as const},
    {id: '3', category: 'Landing Pages' as const},
  ];

  assert.equal(filterPortfolioProjects(sample, 'All').length, 3);
  assert.deepEqual(
    filterPortfolioProjects(sample, 'E-Commerce Websites').map((item) => item.id),
    ['2']
  );
});

test('isSafeWebhookUrl blocks non-https and private network targets', () => {
  assert.equal(isSafeWebhookUrl('https://hooks.slack.com/services/T00/B00/XXX'), true);
  assert.equal(isSafeWebhookUrl('http://hooks.slack.com/services/T00/B00/XXX'), false);
  assert.equal(isSafeWebhookUrl('https://127.0.0.1:8080/hook'), false);
  assert.equal(isSafeWebhookUrl('https://169.254.169.254/latest'), false);
  assert.equal(isSafeWebhookUrl('https://192.168.1.50/hook'), false);
  assert.equal(isSafeWebhookUrl('not-a-url'), false);
});
