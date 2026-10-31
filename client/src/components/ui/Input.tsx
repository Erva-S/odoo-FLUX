import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-10 rounded-lg border bg-surface-container-low text-on-surface placeholder:text-outline text-sm transition-colors focus:outline-none focus:bg-surface-container-lowest ${
              leftIcon ? 'pl-10' : 'pl-3'
            } ${rightIcon ? 'pr-10' : 'pr-3'} ${
              error
                ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                : 'border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-error font-body-sm">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-on-surface-variant font-body-sm">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
