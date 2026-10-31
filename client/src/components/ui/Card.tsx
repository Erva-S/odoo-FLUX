import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6 ${
        hoverable ? 'hover:shadow-md hover:border-outline-variant/40 transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

