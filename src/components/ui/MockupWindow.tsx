import React from "react";
import clsx from "clsx";

interface MockupWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export const MockupWindow: React.FC<MockupWindowProps> = ({
  title = "brightloop-system // preview",
  children,
  className,
  headerRight,
}) => {
  return (
    <div
      className={clsx(
        "bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-xl overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Header bar */}
      <div className="bg-neoBlack px-4 py-3 flex items-center justify-between border-b-2 border-black select-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black inline-block" />
          {title && (
            <span className="ml-2 font-mono text-xs font-bold text-neutral-300 truncate max-w-[220px] sm:max-w-none">
              {title}
            </span>
          )}
        </div>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 overflow-auto bg-neoWhite text-neoBlack">
        {children}
      </div>
    </div>
  );
};

