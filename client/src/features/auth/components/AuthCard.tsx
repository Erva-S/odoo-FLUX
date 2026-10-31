import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, footer, className = '' }) => {
  return (
    <div
      className={`w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl p-8 sm:p-10 ${className}`}
    >
      {children}
      {footer && <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">{footer}</div>}
    </div>
  );
};

