import React from "react";
import clsx from "clsx";

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "hero";
  size?: "default" | "compact" | "large";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ variant = "primary", size = "default", className, children, icon, ...props }, ref) => {
    const baseStyles = "btn-push inline-flex items-center justify-center gap-2 font-bold select-none cursor-pointer";

    const variantStyles = {
      primary: "bg-neoBlack text-neoWhite hover:text-neoWhite",
      secondary: "bg-neoWhite text-neoBlack hover:bg-neutral-50",
      destructive: "bg-statusRed text-neoBlack",
      hero: "btn-push-hero bg-neoBlack text-neoWhite text-lg tracking-tight",
    };

    const sizeStyles = {
      compact: "px-4 py-2 text-sm rounded-[8px]",
      default: "px-6 py-3 text-base rounded-[10px]",
      large: "px-8 py-4 text-lg rounded-[12px]",
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          props.disabled && "opacity-50 cursor-not-allowed transform-none hover:transform-none shadow-none",
          className
        )}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);

NeoButton.displayName = "NeoButton";

