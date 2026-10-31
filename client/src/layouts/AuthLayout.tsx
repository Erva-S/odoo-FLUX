import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-surface">
      {/* Ambient mesh gradients from approved design */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-surface-container-low/60 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">
        {/* Top Operational Status Pill */}
        <div className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container shadow-sm border border-outline-variant/30">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-[11px] font-semibold text-secondary tracking-wide uppercase">
            All billing engines operational
          </span>
          <span className="text-[11px] text-outline">| 100% uptime</span>
        </div>

        {/* Dynamic Auth Card Content */}
        <Outlet />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-outline">
          <p>© 2026 Brightloop Software Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
