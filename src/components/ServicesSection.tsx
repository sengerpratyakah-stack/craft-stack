import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Code2,
  Gauge,
  Layers,
  Palette,
  Rocket,
  ShoppingBag,
} from 'lucide-react';
import { SERVICES, ServiceItem } from '../data/agencyData';
import { ServiceOption } from '../utils/validation';

interface ServicesSectionProps {
  onSelectService: (service: ServiceOption) => void;
}

const iconMap: Record<ServiceItem['iconKey'], React.ComponentType<{ className?: string }>> = {
  palette: Palette,
  code: Code2,
  'shopping-bag': ShoppingBag,
  building: Building2,
  rocket: Rocket,
  layers: Layers,
  briefcase: Briefcase,
  gauge: Gauge,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="relative bg-[#080B18] py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(121,87,255,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#00D4FF]">Our Services</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              End-to-End Web Design &amp; Digital Engineering
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#AAB2C5] sm:text-base">
            Select any capability below to start a tailored project quote with our Noida studio.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => {
            const IconComponent = iconMap[service.iconKey];
            const indexLabel = String(index + 1).padStart(2, '0');

            return (
              <motion.article
                key={service.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: (index % 4) * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101525]/85 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#7957FF]/70 hover:shadow-[0_14px_40px_rgba(121,87,255,0.22)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7957FF]/0 via-transparent to-[#00D4FF]/0 opacity-0 transition-opacity duration-200 group-hover:from-[#7957FF]/12 group-hover:to-[#00D4FF]/10 group-hover:opacity-100"
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#080B18] text-[#00D4FF] transition-colors duration-200 group-hover:border-[#7957FF]/60 group-hover:text-white group-hover:bg-[#7957FF]/25">
                      <IconComponent className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xs text-[#AAB2C5] tabular-nums">
                      {indexLabel}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#AAB2C5]">
                    {service.description}
                  </p>
                </div>

                <div className="relative mt-6 border-t border-white/10 pt-4">
                  <p className="text-xs text-[#AAB2C5]">{service.deliverableHint}</p>
                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#00D4FF] transition-colors hover:text-white cursor-pointer"
                  >
                    <span>Inquire for {service.title}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
