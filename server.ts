import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { validateContactForm, isSafeWebhookUrl } from './src/utils/validation.ts';
import {
  calculateDiscountedPrice,
  checkCouponEligibility,
  CouponRecord,
  formatCurrencyPrice,
  normalizeCouponCode,
  parseNumericPrice,
  TIER_NAMES,
  TierName,
  toPublicCouponSummary,
  validateCouponCreateInput,
} from './src/utils/coupons.ts';
import { PRICING_PLANS } from './src/data/agencyData.ts';

dotenv.config();

interface StoredInquiry {
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  plan?: string;
  couponCode?: string;
  discountSummary?: string;
  description: string;
  createdAt: string;
  deliveryMode: 'email' | 'webhook' | 'stored';
}

interface StoredAdminCredential {
  salt: string;
  hash: string;
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.resolve(DATA_DIR, 'inquiries.json');
const COUPONS_FILE = path.resolve(DATA_DIR, 'coupons.json');
const COUPON_ADMIN_FILE = path.resolve(DATA_DIR, 'coupon-admin.json');
const SESSION_SIGNING_KEY =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

function assertInsideDataDir(targetPath: string): void {
  if (!targetPath.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path outside data directory.');
  }
}

async function persistInquiry(record: StoredInquiry): Promise<void> {
  assertInsideDataDir(INQUIRIES_FILE);
  await fs.mkdir(DATA_DIR, { recursive: true });

  let existing: StoredInquiry[] = [];
  try {
    const raw = await fs.readFile(INQUIRIES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed;
    }
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr?.code !== 'ENOENT') {
      throw err;
    }
  }

  existing.unshift(record);
  const bounded = existing.slice(0, 500);
  const tmpFile = path.resolve(DATA_DIR, `inquiries.${crypto.randomUUID()}.tmp.json`);
  assertInsideDataDir(tmpFile);
  await fs.writeFile(tmpFile, JSON.stringify(bounded, null, 2), 'utf8');
  await fs.rename(tmpFile, INQUIRIES_FILE);
}

async function readCoupons(): Promise<CouponRecord[]> {
  assertInsideDataDir(COUPONS_FILE);
  try {
    const raw = await fs.readFile(COUPONS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CouponRecord[]) : [];
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr?.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writeCoupons(coupons: CouponRecord[]): Promise<void> {
  assertInsideDataDir(COUPONS_FILE);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.resolve(DATA_DIR, `coupons.${crypto.randomUUID()}.tmp.json`);
  assertInsideDataDir(tmpFile);
  await fs.writeFile(tmpFile, JSON.stringify(coupons.slice(0, 200), null, 2), 'utf8');
  await fs.rename(tmpFile, COUPONS_FILE);
}

async function readAdminCredential(): Promise<StoredAdminCredential | null> {
  assertInsideDataDir(COUPON_ADMIN_FILE);
  try {
    const raw = await fs.readFile(COUPON_ADMIN_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAdminCredential>;
    if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      return {
        salt: parsed.salt,
        hash: parsed.hash,
        createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
      };
    }
    return null;
  } catch (err: unknown) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr?.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

async function writeAdminCredential(salt: string, hash: string): Promise<void> {
  assertInsideDataDir(COUPON_ADMIN_FILE);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = path.resolve(DATA_DIR, `coupon-admin.${crypto.randomUUID()}.tmp.json`);
  assertInsideDataDir(tmpFile);
  const payload: StoredAdminCredential = {
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
  await fs.rename(tmpFile, COUPON_ADMIN_FILE);
}

function hashPasscode(passcode: string, salt: string): string {
  return crypto.scryptSync(passcode, salt, 64).toString('hex');
}

function verifyScryptPasscode(passcode: string, cred: StoredAdminCredential): boolean {
  const computed = Buffer.from(hashPasscode(passcode, cred.salt), 'hex');
  const stored = Buffer.from(cred.hash, 'hex');
  if (computed.length !== stored.length) {
    return false;
  }
  return crypto.timingSafeEqual(computed, stored);
}

function verifyEnvPasscode(candidate: string, configured: string): boolean {
  const candidateDigest = crypto.createHash('sha256').update(candidate).digest();
  const configuredDigest = crypto.createHash('sha256').update(configured).digest();
  return crypto.timingSafeEqual(candidateDigest, configuredDigest);
}

function createOwnerToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'owner',
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyOwnerToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) {
    return false;
  }
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_KEY)
    .update(payloadB64)
    .digest('base64url');
  const providedBuf = Buffer.from(sigB64, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'owner' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireOwnerAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!verifyOwnerToken(req.headers.authorization)) {
    res.status(401).json({
      ok: false,
      message: 'Owner authentication required to manage coupons.',
    });
    return;
  }
  next();
}

async function forwardViaResend(record: StoredInquiry): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !fromEmail || !toEmail) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: record.email,
      subject: `[Craft Stack Inquiry ${record.referenceId}] ${record.service} — ${record.name}`,
      text: [
        `Reference ID: ${record.referenceId}`,
        `Name: ${record.name}`,
        `Email: ${record.email}`,
        `Phone: ${record.phone}`,
        `Service: ${record.service}`,
        `Package Tier: ${record.plan || 'Custom / Not Sure'}`,
        ...(record.couponCode
          ? [`Coupon Applied: ${record.couponCode} (${record.discountSummary || 'Valid discount'})`]
          : []),
        `Submitted: ${record.createdAt}`,
        '',
        'Project Description:',
        record.description,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown Resend error');
    throw new Error(`Email relay rejected (${response.status}): ${errText}`);
  }
  return true;
}

async function forwardViaWebhook(record: StoredInquiry): Promise<boolean> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return false;
  }
  if (!isSafeWebhookUrl(webhookUrl)) {
    throw new Error('Configured CONTACT_WEBHOOK_URL must use HTTPS and a public hostname.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'craft-stack-website',
      inquiry: record,
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook delivery returned status ${response.status}`);
  }
  return true;
}

function generateReferenceId(): string {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
    now.getUTCDate()
  ).padStart(2, '0')}`;
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CS-${datePart}-${hex}`;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.get('/api/health', (_req, res) => {
    const hasEmail = Boolean(
      process.env.RESEND_API_KEY?.trim() &&
        process.env.CONTACT_FROM_EMAIL?.trim() &&
        process.env.CONTACT_TO_EMAIL?.trim()
    );
    const hasWebhook = Boolean(process.env.CONTACT_WEBHOOK_URL?.trim());
    res.json({
      status: 'ok',
      service: 'craft-stack',
      integrations: {
        email: hasEmail,
        webhook: hasWebhook,
        localStore: true,
      },
    });
  });

  app.get('/api/coupons/admin/status', async (_req, res) => {
    try {
      const envPasscode = process.env.COUPON_ADMIN_PASSCODE?.trim();
      if (envPasscode) {
        return res.json({ ok: true, configured: true, source: 'env' });
      }
      const cred = await readAdminCredential();
      return res.json({
        ok: true,
        configured: Boolean(cred),
        source: cred ? 'claimed' : 'unclaimed',
      });
    } catch (error) {
      console.error('Coupon admin status error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to check coupon studio status.' });
    }
  });

  app.post('/api/coupons/admin/setup', async (req, res) => {
    try {
      if (process.env.COUPON_ADMIN_PASSCODE?.trim()) {
        return res.status(409).json({
          ok: false,
          message: 'Owner passcode is already configured via environment secrets.',
        });
      }
      const existing = await readAdminCredential();
      if (existing) {
        return res.status(409).json({
          ok: false,
          message: 'Owner passcode has already been set. Please sign in instead.',
        });
      }

      const rawPasscode =
        req.body && typeof req.body === 'object' && typeof req.body.passcode === 'string'
          ? req.body.passcode.trim()
          : '';
      if (rawPasscode.length < 6 || rawPasscode.length > 128) {
        return res.status(400).json({
          ok: false,
          message: 'Passcode must be between 6 and 128 characters.',
        });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPasscode(rawPasscode, salt);
      await writeAdminCredential(salt, hash);

      return res.status(201).json({
        ok: true,
        token: createOwnerToken(),
      });
    } catch (error) {
      console.error('Coupon admin setup error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to complete owner passcode setup.' });
    }
  });

  app.post('/api/coupons/admin/login', async (req, res) => {
    try {
      const rawPasscode =
        req.body && typeof req.body === 'object' && typeof req.body.passcode === 'string'
          ? req.body.passcode.trim()
          : '';

      if (!rawPasscode) {
        return res.status(400).json({ ok: false, message: 'Please enter your owner passcode.' });
      }

      const envPasscode = process.env.COUPON_ADMIN_PASSCODE?.trim();
      if (envPasscode) {
        if (!verifyEnvPasscode(rawPasscode, envPasscode)) {
          return res.status(401).json({ ok: false, message: 'Incorrect owner passcode.' });
        }
        return res.json({ ok: true, token: createOwnerToken() });
      }

      const cred = await readAdminCredential();
      if (!cred) {
        return res.status(409).json({
          ok: false,
          message: 'No owner passcode has been set yet. Complete first-time setup first.',
        });
      }

      if (!verifyScryptPasscode(rawPasscode, cred)) {
        return res.status(401).json({ ok: false, message: 'Incorrect owner passcode.' });
      }

      return res.json({ ok: true, token: createOwnerToken() });
    } catch (error) {
      console.error('Coupon admin login error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to verify owner passcode.' });
    }
  });

  app.get('/api/coupons', requireOwnerAuth, async (_req, res) => {
    try {
      const coupons = await readCoupons();
      return res.json({ ok: true, coupons });
    } catch (error) {
      console.error('List coupons error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to load your coupons.' });
    }
  });

  app.post('/api/coupons', requireOwnerAuth, async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const validation = validateCouponCreateInput(body);
      if (!validation.isValid) {
        return res.status(400).json({
          ok: false,
          message: 'Please review the coupon details and try again.',
          errors: validation.errors,
        });
      }

      const existing = await readCoupons();
      if (existing.some((c) => c.code === validation.sanitized.code)) {
        return res.status(409).json({
          ok: false,
          message: `Coupon code "${validation.sanitized.code}" already exists.`,
          errors: { code: 'This coupon code already exists.' },
        });
      }

      const newCoupon: CouponRecord = {
        id: `cpn_${crypto.randomBytes(6).toString('hex')}`,
        ...validation.sanitized,
        usedCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };

      existing.unshift(newCoupon);
      await writeCoupons(existing);

      return res.status(201).json({ ok: true, coupon: newCoupon });
    } catch (error) {
      console.error('Create coupon error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to save the new coupon.' });
    }
  });

  app.patch('/api/coupons/:id', requireOwnerAuth, async (req, res) => {
    try {
      const targetId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
      const coupons = await readCoupons();
      const idx = coupons.findIndex((c) => c.id === targetId);
      if (idx === -1) {
        return res.status(404).json({ ok: false, message: 'Coupon not found.' });
      }

      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const updated: CouponRecord = { ...coupons[idx] };
      if (typeof body.active === 'boolean') {
        updated.active = body.active;
      }

      coupons[idx] = updated;
      await writeCoupons(coupons);

      return res.json({ ok: true, coupon: updated });
    } catch (error) {
      console.error('Update coupon error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to update coupon.' });
    }
  });

  app.delete('/api/coupons/:id', requireOwnerAuth, async (req, res) => {
    try {
      const targetId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
      const coupons = await readCoupons();
      const filtered = coupons.filter((c) => c.id !== targetId);
      if (filtered.length === coupons.length) {
        return res.status(404).json({ ok: false, message: 'Coupon not found.' });
      }

      await writeCoupons(filtered);
      return res.json({ ok: true });
    } catch (error) {
      console.error('Delete coupon error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to delete coupon.' });
    }
  });

  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const code = normalizeCouponCode(body.code);
      if (!code) {
        return res.status(400).json({ ok: false, message: 'Please enter a coupon code.' });
      }

      const rawPlan = typeof body.plan === 'string' ? body.plan.trim() : '';
      const planTier = TIER_NAMES.includes(rawPlan as TierName) ? (rawPlan as TierName) : undefined;

      const coupons = await readCoupons();
      const match = coupons.find((c) => c.code === code);
      if (!match) {
        return res.status(404).json({ ok: false, message: 'Coupon code not found.' });
      }

      const eligibility = checkCouponEligibility(match, planTier);
      if (!eligibility.valid) {
        return res.status(400).json({
          ok: false,
          message: eligibility.reason || 'This coupon cannot be applied.',
        });
      }

      return res.json({
        ok: true,
        coupon: toPublicCouponSummary(match),
      });
    } catch (error) {
      console.error('Validate coupon error:', error);
      return res.status(500).json({ ok: false, message: 'Unable to validate coupon right now.' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const validation = validateContactForm(body);

      if (!validation.isValid) {
        return res.status(400).json({
          ok: false,
          message: 'Please review the highlighted fields and try again.',
          errors: validation.errors,
        });
      }

      let couponList: CouponRecord[] | null = null;
      let matchedCouponIdx = -1;
      let discountSummary: string | undefined;

      if (validation.sanitized.couponCode) {
        couponList = await readCoupons();
        matchedCouponIdx = couponList.findIndex(
          (c) => c.code === validation.sanitized.couponCode
        );
        if (matchedCouponIdx === -1) {
          return res.status(400).json({
            ok: false,
            message: 'The entered coupon code is not valid.',
            errors: { couponCode: 'Coupon code not found.' },
          });
        }

        const matchedCoupon = couponList[matchedCouponIdx];
        const planTier = TIER_NAMES.includes(validation.sanitized.plan as TierName)
          ? (validation.sanitized.plan as TierName)
          : undefined;

        const eligibility = checkCouponEligibility(matchedCoupon, planTier);
        if (!eligibility.valid) {
          return res.status(400).json({
            ok: false,
            message: eligibility.reason || 'This coupon cannot be applied to your selection.',
            errors: { couponCode: eligibility.reason || 'Coupon is not eligible.' },
          });
        }

        const publicSummary = toPublicCouponSummary(matchedCoupon);
        if (planTier) {
          const planMeta = PRICING_PLANS.find((p) => p.name === planTier);
          if (planMeta) {
            const breakdown = calculateDiscountedPrice(
              parseNumericPrice(planMeta.priceInr),
              parseNumericPrice(planMeta.priceUsd),
              planTier,
              publicSummary
            );
            discountSummary = `${breakdown.label} · Est. ${formatCurrencyPrice(
              breakdown.finalInr,
              'INR'
            )} / ${formatCurrencyPrice(breakdown.finalUsd, 'USD')} min.`;
          }
        } else {
          discountSummary =
            matchedCoupon.discountType === 'percent'
              ? `${matchedCoupon.discountValue}% OFF`
              : `${formatCurrencyPrice(matchedCoupon.discountValue, 'INR')} OFF`;
        }
      }

      const referenceId = generateReferenceId();
      const createdAt = new Date().toISOString();

      let deliveryMode: StoredInquiry['deliveryMode'] = 'stored';
      const baseRecord: StoredInquiry = {
        referenceId,
        ...validation.sanitized,
        ...(discountSummary ? { discountSummary } : {}),
        createdAt,
        deliveryMode,
      };

      const emailed = await forwardViaResend(baseRecord);
      if (emailed) {
        deliveryMode = 'email';
      } else {
        const webhooked = await forwardViaWebhook(baseRecord);
        if (webhooked) {
          deliveryMode = 'webhook';
        }
      }

      const finalRecord: StoredInquiry = {
        ...baseRecord,
        deliveryMode,
      };

      await persistInquiry(finalRecord);

      if (couponList && matchedCouponIdx !== -1) {
        couponList[matchedCouponIdx] = {
          ...couponList[matchedCouponIdx],
          usedCount: couponList[matchedCouponIdx].usedCount + 1,
        };
        await writeCoupons(couponList);
      }

      return res.status(201).json({
        ok: true,
        referenceId,
        createdAt,
        deliveryMode,
        ...(discountSummary ? { discountSummary } : {}),
        message:
          deliveryMode === 'email'
            ? 'Your project inquiry has been sent to our team and logged.'
            : deliveryMode === 'webhook'
              ? 'Your project inquiry has been forwarded to our team and logged.'
              : 'Your project inquiry has been saved to our inquiry desk. For immediate assistance, call +91 89790 71924.',
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      return res.status(500).json({
        ok: false,
        message:
          'Unable to process your inquiry right now. Please try again or call +91 89790 71924 directly.',
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Craft Stack server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Craft Stack server:', err);
  process.exit(1);
});
