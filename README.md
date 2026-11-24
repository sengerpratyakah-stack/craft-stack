# Craft Stack — Digital Website Design & Development Agency

Official web application for **Craft Stack**, a digital design and full-stack website development agency based in Sector 18, Noida, Uttar Pradesh, India.

## Features

- **Brand & Visual System**: Custom Craft Stack geometric cube/stack logo, Midnight Navy (`#080B18`), Electric Purple (`#7957FF`), Cyan Blue (`#00D4FF`), and Dark Charcoal (`#101525`) palette with `Plus Jakarta Sans` and `DM Sans` typography.
- **Complete Agency Sections**:
  - Sticky Navigation Bar with smooth scrolling, mobile drawer, and **Get a Free Quote** CTA
  - Hero Section with 3D glassmorphic centerpiece, live UI preview card, and dual CTAs
  - About Us (*Creativity Meets Technology*) with three studio pillars
  - 8 Interactive Service Cards (Website Design, Website Development, E-Commerce, Business Websites, Landing Pages, UI/UX Design, Portfolio Websites, Redesign & Optimization)
  - Why Choose Craft Stack (6 core advantages)
  - **Three-Tier Price List (Standard, Platinum, Premium)** with INR (`₹`) / USD (`$`) switcher and direct quote pre-selection
  - Filterable Portfolio Showcase across 5 categories (clearly marked as demonstration concepts) with inspection modal
  - 5-Step Animated Working Process timeline (`01`–`05`)
  - Call-to-Action Banner & Full Contact Section with clickable phone (`tel:+918979071924`) and Google Maps location link
- **Functional Backend Contact API (`POST /api/contact`)**:
  - Validates and sanitizes all fields on both client and server (`src/utils/validation.ts`)
  - Persists inquiries safely to `data/inquiries.json` with a generated Reference ID
  - Supports optional email delivery via Resend (`RESEND_API_KEY`) or HTTPS webhook relay (`CONTACT_WEBHOOK_URL`)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development mode (Express + Vite middleware on port 3000):
   ```bash
   npm run dev
   ```
3. Run unit tests:
   ```bash
   npm test
   ```
4. Type-check and build for production:
   ```bash
   npm run lint
   npm run build
   npm start
   ```
