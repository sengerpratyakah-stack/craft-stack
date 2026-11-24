import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Compass,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { WHY_CHOOSE_ITEMS, WhyChooseItem } from '../data/agencyData';

const advantageIcons: Record<
  WhyChooseItem['iconKey'],
  React.ComponentType<{ className?: string }>
> = {
  'monitor-smartphone': MonitorSmartphone,
  sparkles: Sparkles,
  smartphone: Smartphone,
  compass: Compass,
  zap: Zap,
  'shield-check': ShieldCheck,
};

export const WhyChooseSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="why-us"
      className="border-t border-white/5 bg-[#101525] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#00D4FF]">Why Choose Craft Stack</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            Built for Speed, Clarity, and Real Business Trust
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#AAB2C5]">
            Every project combines thoughtful visual direction with disciplined front-end and
            back-end engineering standards.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_ITEMS.map((item, idx) => {
            const IconComponent = advantageIcons[item.iconKey];
            return (
              <motion.div
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: (idx % 3) * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-2xl border border-white/10 bg-[#080B18]/75 p-6 transition-all duration-200 hover:border-[#00D4FF]/45 hover:bg-[#080B18]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7957FF]/35 bg-[#7957FF]/12 text-[#7957FF] transition-colors group-hover:border-[#00D4FF]/50 group-hover:text-[#00D4FF]">
                  <IconComponent className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#AAB2C5]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
