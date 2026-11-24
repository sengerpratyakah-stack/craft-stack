import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { NAV_LINKS } from '../data/agencyData';

interface NavbarProps {
  onNavigateQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateQuote }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
        scrolled
          ? 'bg-[#080B18]/85 backdrop-blur-xl border-b border-white/10'
          : 'bg-[#080B18]/60 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          aria-label="Craft Stack Home"
          className="inline-flex items-center whitespace-nowrap shrink-0 rounded-md focus-visible:outline-none"
        >
          <BrandLogo size="sm" />
        </a>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-5 xl:gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 text-sm font-medium text-[#AAB2C5] transition-colors duration-150 hover:text-white whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-gradient-to-r after:from-[#7957FF] after:to-[#00D4FF] after:transition-all after:duration-200 hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateQuote}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:border-[#7957FF]/70 hover:bg-[#7957FF]/15 hover:shadow-[0_0_24px_rgba(121,87,255,0.3)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Get a Free Quote</span>
            <ArrowRight className="h-4 w-4 text-[#00D4FF]" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-[#7957FF]/60 hover:bg-white/10 lg:hidden cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-white/10 bg-[#080B18]/98 backdrop-blur-xl lg:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-[#AAB2C5] transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onNavigateQuote();
              }}
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7957FF] to-[#5B3DF5] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(121,87,255,0.4)] transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Get a Free Quote</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
