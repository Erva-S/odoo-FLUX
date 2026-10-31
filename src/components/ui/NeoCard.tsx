import React from "react";
import clsx from "clsx";

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "yellow" | "sage" | "charcoal" | "canvas" | "dark";
  shadowSize?: "sm" | "standard" | "large" | "none";
  children: React.ReactNode;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  variant = "white",
  shadowSize = "standard",
  className,
  children,
  ...props
}) => {
  const bgStyles = {
    white: "bg-neoWhite text-neoBlack",
    yellow: "bg-neoYellow text-neoBlack",
    sage: "bg-neoSage text-neoBlack",
    charcoal: "bg-neoCharcoal text-neoWhite",
    canvas: "bg-neoCanvas text-neoBlack",
    dark: "bg-neoDark text-neoWhite",
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-neo-sm",
    standard: "shadow-neo",
    large: "shadow-neo-lg",
  };

  return (
    <div
      className={clsx(
        "border-2 border-black rounded-[14px]",
        bgStyles[variant],
        shadowStyles[shadowSize],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

