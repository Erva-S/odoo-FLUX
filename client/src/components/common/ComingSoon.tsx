import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  moduleName: string;
  description: string;
  phase?: string;
  icon?: LucideIcon;
}

export function ComingSoon({
  moduleName,
  description,
  phase = 'Phase 2',
  icon: Icon = Sparkles,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm max-w-xl mx-auto my-12">
      <div className="w-14 h-14 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-3 border border-outline-variant/30">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        Planned for {phase}
      </div>
      <h2 className="text-xl font-heading font-semibold text-on-surface mb-2">
        {moduleName} Module
      </h2>
      <p className="text-sm text-on-surface-variant max-w-md leading-relaxed mb-6">
        {description}
      </p>
      <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 text-xs text-outline max-w-sm">
        🔒 Architecture foundation ready: Schema constraints and authorization guards are prepared for this module in subsequent releases.
      </div>
    </div>
  );
}
