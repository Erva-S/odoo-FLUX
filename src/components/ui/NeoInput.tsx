import React from "react";
import clsx from "clsx";

export interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(
  ({ label, error, helperText, leftIcon, rightAction, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-neoBlack">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-neutral-600">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              "input-neo w-full bg-neoWhite text-neoBlack text-sm md:text-base font-medium px-3.5 py-2.5",
              leftIcon && "pl-10",
              rightAction && "pr-10",
              error && "input-neo-error",
              className
            )}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-3 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-bold text-statusRed mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-600 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

NeoInput.displayName = "NeoInput";

