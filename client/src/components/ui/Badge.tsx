import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'indigo' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    primary: 'bg-primary-fixed text-on-primary-fixed border-primary/20',
    success: 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    error: 'bg-error-container text-on-error-container border-error/20',
    neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
    indigo: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20',
    outline: 'bg-transparent text-on-surface border border-outline-variant/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium leading-none',
    md: 'text-[12px] px-2.5 py-1 font-medium',
  };

  const dotColors = {
    primary: 'bg-primary',
    success: 'bg-tertiary',
    warning: 'bg-amber-500',
    error: 'bg-error',
    neutral: 'bg-outline',
    indigo: 'bg-secondary',
    outline: 'bg-on-surface',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider font-label-caps transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

