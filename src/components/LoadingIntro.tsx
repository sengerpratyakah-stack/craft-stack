import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BrandLogo } from './BrandLogo';

export const LoadingIntro: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return false;
    return true;
  });

  useEffect(() => {
    if (!visible || prefersReducedMotion) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [visible, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B18]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <BrandLogo />
            <div className="h-0.5 w-36 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full bg-gradient-to-r from-[#7957FF] to-[#00D4FF]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
