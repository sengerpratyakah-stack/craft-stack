import React from 'react';
import {
  Dribbble,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_INFO, NAV_LINKS, SERVICES } from '../data/agencyData';
import { SOCIAL_LINKS, SocialLinkConfig } from '../config/social';
import { ServiceOption } from '../utils/validation';

interface FooterProps {
  onSelectService: (service: ServiceOption) => void;
  onOpenCouponStudio: () => void;
}

const socialIcons: Record<
  SocialLinkConfig['id'],
  React.ComponentType<{ className?: string }>
> = {
  linkedin: Linkedin,
  instagram: Instagram,
  x: Twitter,
  github: Github,
  dribbble: Dribbble,
};

export const Footer: React.FC<FooterProps> = ({
  onSelectService,
  onOpenCouponStudio,
}) => {
  return (
    <footer className="border-t border-white/10 bg-[#080B18] pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a href="#home" aria-label="Craft Stack Home" className="inline-block">
              <BrandLogo />
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#AAB2C5]">
              Craft Stack is a digital website design and development agency helping businesses
              build high-converting websites, UI/UX systems, and modern web applications.
            </p>
            <p className="mt-3 text-xs font-medium text-[#00D4FF]">{BUSINESS_INFO.tagline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((item) => {
                const Icon = socialIcons[item.id];
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Craft Stack on ${item.label}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101525] text-[#AAB2C5] transition-colors hover:border-[#7957FF]/70 hover:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[#AAB2C5] transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="text-left text-[#AAB2C5] transition-colors hover:text-[#00D4FF] cursor-pointer"
                  >
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Contact Details</h3>
            <ul className="mt-4 space-y-3.5 text-sm text-[#AAB2C5]">
              <li>
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="inline-flex items-center gap-2 text-white transition-colors hover:text-[#00D4FF]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#00D4FF]" aria-hidden="true" />
                  <span className="font-mono tabular-nums">{BUSINESS_INFO.phoneRaw}</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7957FF]" aria-hidden="true" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li>
                <a
                  href={BUSINESS_INFO.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00D4FF] transition-colors hover:text-white"
                >
                  <span>View on Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#AAB2C5] sm:flex-row sm:items-center">
          <p>© 2026 Craft Stack. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenCouponStudio}
              className="text-xs font-medium text-[#00D4FF] transition-colors hover:text-white cursor-pointer"
            >
              Owner Coupon Studio
            </button>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <p>Digital Website Design &amp; Development Agency · Sector 18, Noida</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
