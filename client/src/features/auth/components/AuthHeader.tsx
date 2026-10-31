import React from 'react';
import { Logo } from '../../../components/common/Logo.js';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <Logo size="md" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-on-surface font-headline-lg">
        {title}
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant font-body-default max-w-sm">
        {subtitle}
      </p>
    </div>
  );
};

