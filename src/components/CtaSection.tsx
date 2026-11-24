import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface CtaSectionProps {
  onStartBuild: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onStartBuild }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#080B18] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[#7957FF]/35 bg-gradient-to-br from-[#131836] via-[#101525] to-[#0B1224] px-6 py-14 text-center shadow-[0_24px_80px_rgba(121,87,255,0.2)] sm:px-12 sm:py-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#7957FF]/25 blur-[90px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#00D4FF]/20 blur-[90px]"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl [text-wrap:balance]">
              Ready to Take Your Business Online?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#AAB2C5] sm:text-lg">
              Let&apos;s create a powerful digital presence for your business. Your next big idea
              starts with Craft Stack.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onStartBuild}
                className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(121,87,255,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(0,212,255,0.45)] active:translate-y-0 whitespace-nowrap cursor-pointer"
              >
                <span>Let&apos;s Build Your Website</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
