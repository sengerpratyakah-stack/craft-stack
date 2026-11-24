import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { PROCESS_STEPS } from '../data/agencyData';

export const ProcessSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="process"
      className="border-t border-white/5 bg-[#080B18] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#00D4FF]">Our Working Process</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            From First Conversation to Confident Launch
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#AAB2C5]">
            A transparent five-stage workflow engineered to keep timelines predictable and design
            quality high.
          </p>
        </div>

        <div className="mt-12 relative">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-10 right-10 h-px bg-gradient-to-r from-[#7957FF]/40 via-[#00D4FF]/50 to-[#7957FF]/40"
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, index) => {
              const isSelected = activeIndex === index;
              return (
                <motion.button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#7957FF] bg-[#101525] shadow-[0_14px_38px_rgba(121,87,255,0.22)]'
                      : 'border-white/10 bg-[#101525]/60 hover:border-white/25 hover:bg-[#101525]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-semibold tabular-nums transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#7957FF] to-[#00D4FF] text-white'
                          : 'border border-white/15 bg-[#080B18] text-[#00D4FF]'
                      }`}
                    >
                      {step.number}
                    </span>
                    <CheckCircle2
                      className={`h-4 w-4 transition-colors ${
                        isSelected ? 'text-[#00D4FF]' : 'text-white/20'
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#AAB2C5]">
                    {step.summary}
                  </p>

                  <p className="mt-4 border-t border-white/10 pt-3 text-xs font-medium text-[#00D4FF] w-full">
                    {step.outcome}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
