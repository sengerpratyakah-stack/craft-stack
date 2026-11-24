import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Eye, Layers, X } from 'lucide-react';
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_PROJECTS,
  PortfolioProject,
} from '../data/agencyData';
import {
  PortfolioCategory,
  ServiceOption,
  filterPortfolioProjects,
} from '../utils/validation';

interface PortfolioSectionProps {
  onRequestSimilar: (service: ServiceOption) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  onRequestSimilar,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('All');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const visibleProjects = filterPortfolioProjects(PORTFOLIO_PROJECTS, activeCategory);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  const markImageBroken = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="portfolio" className="border-t border-white/5 bg-[#101525] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#00D4FF]">Our Portfolio</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              Selected Digital Concepts &amp; Build Showcases
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#AAB2C5] sm:text-base">
              Notice: The projects below are curated demonstration concepts illustrating Craft
              Stack&apos;s design and engineering standards until live client launches are added.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter portfolio by website category"
            className="flex flex-wrap items-center gap-2"
          >
            {PORTFOLIO_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-10 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer sm:text-sm ${
                    isActive
                      ? 'bg-[#7957FF] text-white shadow-[0_0_20px_rgba(121,87,255,0.4)]'
                      : 'border border-white/10 bg-[#080B18] text-[#AAB2C5] hover:border-white/25 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project, idx) => (
            <motion.article
              key={project.id}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080B18]/90 transition-all duration-200 hover:border-[#7957FF]/60 hover:shadow-[0_18px_45px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#080B18]">
                {!brokenImages[project.id] ? (
                  <img
                    src={project.imageUrl}
                    alt={project.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => markImageBroken(project.id)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#101525] via-[#1B1642] to-[#080B18] p-6 text-center">
                    <Layers className="h-9 w-9 text-[#00D4FF]" aria-hidden="true" />
                    <p className="mt-3 font-display text-base font-semibold text-white">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-[#AAB2C5]">{project.category}</p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080B18] via-transparent to-transparent opacity-75"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#AAB2C5]">
                    <span className="font-medium text-[#00D4FF]">{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Demonstration Concept</span>
                  </div>

                  <h3 className="mt-2 font-display text-xl font-bold text-white">
                    {project.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#AAB2C5]">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="min-w-0 truncate text-xs text-[#AAB2C5]">
                    {project.stack.slice(0, 2).join(' · ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    aria-label={`Inspect preview for ${project.title}`}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-white transition-colors hover:text-[#00D4FF] cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-[#7957FF]" aria-hidden="true" />
                    <span>Inspect Concept</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-modal-title"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#101525] p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#00D4FF]">
                    {selectedProject.category} · Demonstration Concept
                  </p>
                  <h3
                    id="portfolio-modal-title"
                    className="mt-1 font-display text-2xl font-bold text-white"
                  >
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project preview"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[#AAB2C5] transition-colors hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#080B18]">
                {!brokenImages[selectedProject.id] ? (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.imageAlt}
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#080B18] text-sm text-[#AAB2C5]">
                    {selectedProject.title}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#AAB2C5]">
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">
                    Design Objective
                  </h4>
                  <p className="mt-1">{selectedProject.challenge}</p>
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">
                    Craft Stack Approach
                  </h4>
                  <p className="mt-1">{selectedProject.solution}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-display text-xs font-semibold text-white">
                      Included Deliverables
                    </h4>
                    <p className="mt-1 text-xs text-[#AAB2C5]">
                      {selectedProject.deliverables.join(' · ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-semibold text-white">
                      Technical Capabilities
                    </h4>
                    <p className="mt-1 text-xs text-[#AAB2C5]">
                      {selectedProject.stack.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="min-h-11 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[#AAB2C5] transition-colors hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const service = selectedProject.serviceMatch;
                    setSelectedProject(null);
                    onRequestSimilar(service);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5636E8] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(121,87,255,0.4)] transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Build Something Similar</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
