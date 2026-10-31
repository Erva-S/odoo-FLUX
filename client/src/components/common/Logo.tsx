import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Logo({ size = 'md', showSubtitle = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const svgSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${iconSizes[size]} rounded-xl bg-primary-container/10 flex items-center justify-center shadow-sm flex-shrink-0`}
      >
        <svg
          className={`${svgSizes[size]} text-primary`}
          fill="none"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke="currentColor"
            strokeDasharray="64 24"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M19 19L29 29M29 19L19 29"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <circle cx="14" cy="24" fill="#90F4C0" r="3" />
          <circle cx="34" cy="24" fill="#5558D9" r="3" />
        </svg>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-heading font-semibold text-on-surface tracking-tight leading-none text-lg">
          Subscriptly
        </span>
        {showSubtitle && (
          <span className="text-[11px] text-outline font-medium tracking-wide uppercase mt-0.5">
            by Brightloop Software
          </span>
        )}
      </div>
    </div>
  );
}
