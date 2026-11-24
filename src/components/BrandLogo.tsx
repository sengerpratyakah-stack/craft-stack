import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 28 : 32;
  const textClass = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cs-top-grad" x1="6" y1="3" x2="30" y2="17" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#7957FF" />
          </linearGradient>
          <linearGradient id="cs-mid-grad" x1="5" y1="14" x2="31" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7957FF" />
            <stop offset="100%" stopColor="#4F35D6" />
          </linearGradient>
        </defs>
        <path
          d="M18 32L5 24.5L18 17L31 24.5L18 32Z"
          fill="#101525"
          stroke="#7957FF"
          strokeOpacity="0.6"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M18 25L5 17.5L18 10L31 17.5L18 25Z"
          fill="url(#cs-mid-grad)"
          fillOpacity="0.88"
          stroke="#9E87FF"
          strokeOpacity="0.65"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M18 18L5 10.5L18 3L31 10.5L18 18Z"
          fill="url(#cs-top-grad)"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M18 10.5V18"
          stroke="#FFFFFF"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display font-bold tracking-tight text-white ${textClass} uppercase`}
      >
        Craft<span className="text-[#00D4FF] font-extrabold">Stack</span>
      </span>
    </span>
  );
};
