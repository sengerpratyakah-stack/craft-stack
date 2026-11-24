import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { LoadingIntro } from './components/LoadingIntro';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { PricingSection } from './components/PricingSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ProcessSection } from './components/ProcessSection';
import { CtaSection } from './components/CtaSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CouponStudioModal } from './components/CouponStudioModal';
import { PlanOption, ServiceOption } from './utils/validation';
import { PublicCouponSummary } from './utils/coupons';

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceOption | ''>('');
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | ''>('');
  const [appliedCoupon, setAppliedCoupon] = useState<PublicCouponSummary | null>(null);
  const [couponStudioOpen, setCouponStudioOpen] = useState(false);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNavigateToContact = useCallback(
    (service?: ServiceOption, plan?: PlanOption) => {
      if (service) {
        setSelectedService(service);
      }
      if (plan) {
        setSelectedPlan(plan);
      }
      scrollToSection('contact');
      setFocusTrigger((prev) => prev + 1);
    },
    [scrollToSection]
  );

  const handleCouponMutated = useCallback(
    (changedCode?: string, removedOrPaused?: boolean) => {
      if (removedOrPaused && changedCode && appliedCoupon?.code === changedCode) {
        setAppliedCoupon(null);
      }
    },
    [appliedCoupon]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#080B18] text-white">
        <LoadingIntro />
        <Navbar onNavigateQuote={() => handleNavigateToContact()} />

        <main>
          <HeroSection
            onStartProject={() => handleNavigateToContact()}
            onExploreServices={() => scrollToSection('services')}
          />
          <AboutSection />
          <ServicesSection onSelectService={(service) => handleNavigateToContact(service)} />
          <WhyChooseSection />
          <PricingSection
            onSelectPlan={(plan, service) => handleNavigateToContact(service, plan)}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
            onOpenCouponStudio={() => setCouponStudioOpen(true)}
          />
          <PortfolioSection onRequestSimilar={(service) => handleNavigateToContact(service)} />
          <ProcessSection />
          <CtaSection onStartBuild={() => handleNavigateToContact()} />
          <ContactSection
            selectedService={selectedService}
            selectedPlan={selectedPlan}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
            focusTrigger={focusTrigger}
          />
        </main>

        <Footer
          onSelectService={(service) => handleNavigateToContact(service)}
          onOpenCouponStudio={() => setCouponStudioOpen(true)}
        />

        <CouponStudioModal
          isOpen={couponStudioOpen}
          onClose={() => setCouponStudioOpen(false)}
          ownerToken={ownerToken}
          onAuthenticated={setOwnerToken}
          onSignOut={() => setOwnerToken(null)}
          onApplyCouponPreview={(coupon) => {
            setAppliedCoupon(coupon);
            scrollToSection('pricing');
          }}
          onCouponMutated={handleCouponMutated}
        />
      </div>
    </MotionConfig>
  );
}
