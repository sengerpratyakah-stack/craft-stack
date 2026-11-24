import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Cpu, Gem, Target } from 'lucide-react';
import { ABOUT_HIGHLIGHTS } from '../data/agencyData';

const highlightIcons = [Gem, Cpu, Target];

export const AboutSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative border-t border-white/5 bg-[#101525] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-sm font-medium text-[#00D4FF]">About Craft Stack</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              Creativity Meets Technology
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#AAB2C5]">
              Craft Stack is a digital design and web engineering agency based in Sector 18, Noida.
              We partner with ambitious founders, local enterprises, and growing brands to build
              websites that look unmistakable and convert visitors into paying customers.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#AAB2C5]">
              Instead of forcing your business into rigid templates, we align visual storytelling,
              human-centered UI/UX design, and clean full-stack development into one cohesive build.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#080B18]/80 p-6">
              <p className="font-display text-sm font-semibold text-white">
                How We Measure Every Delivery
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-[#AAB2C5]">Architecture</dt>
                  <dd className="mt-1 font-medium text-white">Clean TypeScript &amp; React</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#AAB2C5]">Viewport Support</dt>
                  <dd className="mt-1 font-medium text-white">Mobile to 4K Desktop</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#AAB2C5]">Accessibility</dt>
                  <dd className="mt-1 font-medium text-white">Keyboard &amp; WCAG Contrast</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#AAB2C5]">Studio Base</dt>
                  <dd className="mt-1 font-medium text-white">Noida, Uttar Pradesh</dd>
                </div>
              </dl>
            </div>
          </motion.div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-5">
            {ABOUT_HIGHLIGHTS.map((item, idx) => {
              const IconComponent = highlightIcons[idx] || Gem;
              return (
                <motion.article
                  key={item.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative rounded-2xl border border-white/10 bg-[#080B18]/75 p-6 transition-all duration-200 hover:border-[#7957FF]/55 hover:bg-[#080B18] sm:p-7"
                >
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#7957FF]/30 bg-[#7957FF]/12 text-[#00D4FF] transition-colors duration-200 group-hover:border-[#00D4FF]/50 group-hover:bg-[#7957FF]/25">
                      <IconComponent className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#AAB2C5] sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
