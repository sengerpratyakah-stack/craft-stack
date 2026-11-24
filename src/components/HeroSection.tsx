import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, Code2, Layers, Sparkles } from 'lucide-react';
import { BUSINESS_INFO } from '../data/agencyData';

interface HeroSectionProps {
  onStartProject: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartProject,
  onExploreServices,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#080B18] pt-14 pb-20 sm:pt-20 sm:pb-24 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-44 h-[460px] bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(121,87,255,0.52),rgba(121,87,255,0.16)_50%,transparent_80%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[10%] h-[360px] w-[360px] rounded-full bg-[#00D4FF]/10 blur-[120px] animate-pulse-aura"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <p className="mb-4 text-sm font-medium tracking-wide text-[#00D4FF]">
              {BUSINESS_INFO.tagline}
            </p>

            <h1 className="font-display text-[clamp(2.25rem,4.2vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
              We Build Digital Experiences That{' '}
              <span className="bg-gradient-to-r from-white via-[#D5C9FF] to-[#00D4FF] bg-clip-text text-transparent">
                Grow Your Business.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#AAB2C5] sm:text-lg">
              From stunning websites to powerful digital solutions, we transform your ideas into
              exceptional online experiences.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartProject}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(121,87,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(121,87,255,0.65)] active:translate-y-0 whitespace-nowrap cursor-pointer"
              >
                <span>Start Your Project</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-[#00D4FF]/60 hover:bg-white/[0.08] whitespace-nowrap cursor-pointer"
              >
                <span>Explore Our Services</span>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#AAB2C5] sm:text-sm">
              <span className="font-medium text-white/90">Craft Stack Digital Studio</span>
              <span aria-hidden="true">·</span>
              <span>Sector 18, Noida</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="w-full sm:w-auto">Custom Web Design, UI/UX &amp; Full-Stack Builds</span>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-6 flex flex-col items-center justify-center"
          >
            <div className="relative flex w-full max-w-[580px] items-center justify-center py-6 sm:py-10">
              <div className="relative flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute h-72 w-72 rounded-full bg-[#7957FF]/30 blur-[80px]"
                />

                <div
                  aria-hidden="true"
                  className="animate-float-slow relative h-[320px] w-[200px] sm:h-[380px] sm:w-[230px] rotate-[24deg] rounded-[115px] border-[10px] border-[#9F85FF]/55 bg-gradient-to-b from-[#171233]/90 via-[#0C0F20]/95 to-[#1F1646]/90 p-3 shadow-[0_24px_80px_rgba(121,87,255,0.45),inset_0_0_28px_rgba(0,212,255,0.22)]"
                >
                  <div className="h-full w-full rounded-[96px] border border-[#00D4FF]/35 bg-[#080B18]/90 p-3 shadow-[inset_0_0_32px_rgba(121,87,255,0.32)]">
                    <div className="h-full w-full rounded-[82px] border border-white/10 bg-[linear-gradient(rgba(121,87,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.18)_1px,transparent_1px)] bg-[size:16px_16px] opacity-80" />
                  </div>
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border-[6px] border-[#C4B5FD]/70 bg-gradient-to-br from-[#7957FF]/30 to-[#00D4FF]/20 backdrop-blur-md shadow-[0_0_30px_rgba(121,87,255,0.55)]" />
                </div>

                <div className="animate-float-reverse absolute -bottom-2 -left-2 sm:left-0 z-10 w-[235px] sm:w-[270px] rounded-2xl border border-white/15 bg-[#101525]/90 p-3.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                      <span className="h-2 w-2 rounded-full bg-white/25" />
                      <span className="h-2 w-2 rounded-full bg-[#00D4FF]/70" />
                    </div>
                    <span className="font-mono text-[10px] text-[#AAB2C5]">craftstack.in</span>
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/10 bg-[#080B18]/80 p-3">
                    <div className="h-2 w-20 rounded-full bg-gradient-to-r from-[#7957FF] to-[#00D4FF]" />
                    <div className="h-2.5 w-36 rounded-full bg-white/80" />
                    <div className="h-2 w-28 rounded-full bg-white/25" />
                    <div className="mt-3 grid grid-cols-3 gap-1.5 pt-1">
                      <div className="h-9 rounded-lg border border-[#7957FF]/30 bg-[#7957FF]/15" />
                      <div className="h-9 rounded-lg border border-[#00D4FF]/25 bg-[#00D4FF]/10" />
                      <div className="h-9 rounded-lg border border-white/10 bg-white/[0.04]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col gap-4 pl-6 z-10">
                <div className="w-44 rounded-2xl border border-[#9F85FF]/45 bg-gradient-to-br from-[#7957FF]/85 to-[#3D22A8]/90 p-4 shadow-[0_16px_40px_rgba(121,87,255,0.4)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <Layers className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-white/80">01</span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-white">100% Custom</p>
                  <p className="mt-0.5 text-xs text-white/85">Tailored UI &amp; code architecture</p>
                </div>

                <div className="ml-6 w-44 rounded-2xl border border-white/12 bg-[#101525]/80 p-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center justify-between">
                    <Sparkles className="h-5 w-5 text-[#00D4FF]" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-[#AAB2C5]">02</span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-white">Mobile-First</p>
                  <p className="mt-0.5 text-xs text-[#AAB2C5]">Fluid across every screen</p>
                </div>

                <div className="w-44 rounded-2xl border border-white/12 bg-[#101525]/80 p-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center justify-between">
                    <Code2 className="h-5 w-5 text-[#7957FF]" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-[#AAB2C5]">03</span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-white">Full-Stack</p>
                  <p className="mt-0.5 text-xs text-[#AAB2C5]">Design to live launch</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid w-full grid-cols-3 gap-2.5 sm:hidden">
              <div className="rounded-xl border border-[#7957FF]/40 bg-[#7957FF]/20 p-3 text-center">
                <p className="font-display text-xs font-bold text-white">100% Custom</p>
                <p className="mt-0.5 text-[11px] text-[#AAB2C5]">Bespoke UI</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#101525]/85 p-3 text-center">
                <p className="font-display text-xs font-bold text-white">Mobile-First</p>
                <p className="mt-0.5 text-[11px] text-[#AAB2C5]">Responsive</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#101525]/85 p-3 text-center">
                <p className="font-display text-xs font-bold text-white">Full-Stack</p>
                <p className="mt-0.5 text-[11px] text-[#AAB2C5]">End-to-End</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 hidden lg:flex justify-end">
          <a
            href="#about"
            aria-label="Scroll to About Us section"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-[#AAB2C5] transition-all duration-200 hover:border-[#00D4FF] hover:text-white hover:bg-white/[0.08]"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
