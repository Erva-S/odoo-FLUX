import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';

export interface PlanBlueprint {
  id: string;
  name: string;
  code: string;
  price: string;
  period: 'month' | 'year';
  activeTenants: number;
  pauseLimitCycles: number;
  cancellationNoticeDays: number;
  autoRenew: boolean;
  popular?: boolean;
  features: string[];
}

interface PlanBlueprintCardProps {
  plan: PlanBlueprint;
  onConfigure?: (plan: PlanBlueprint) => void;
}

export const PlanBlueprintCard: React.FC<PlanBlueprintCardProps> = ({ plan, onConfigure }) => {
  return (
    <div
      className={`rounded-2xl bg-surface-container-lowest p-6 border shadow-sm relative flex flex-col justify-between transition-all ${
        plan.popular
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-outline-variant/20 hover:border-outline-variant/40'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" size="sm">
            Most Popular Enterprise Choice
          </Badge>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
          <span className="font-data-mono text-[11px] text-outline">{plan.code}</span>
        </div>

        <div className="flex items-baseline gap-1 my-4">
          <span className="text-3xl font-extrabold text-on-surface font-data-mono">
            {plan.price}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            / {plan.period === 'month' ? 'month' : 'year'}
          </span>
        </div>

        {/* Policy Badges */}
        <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-surface-container-low rounded-xl text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-outline">Pause Limit</span>
            <p className="font-bold text-on-surface mt-0.5">{plan.pauseLimitCycles} Cycles max</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-outline">Cancellation</span>
            <p className="font-bold text-on-surface mt-0.5">{plan.cancellationNoticeDays} Days Notice</p>
          </div>
        </div>

        {/* Feature Inclusions */}
        <div className="space-y-2.5 my-5">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
            Included Governance Rules
          </span>
          {plan.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
        <span className="text-xs text-on-surface-variant font-data-mono">
          {plan.activeTenants} active contracts
        </span>
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => onConfigure?.(plan)}
        >
          Configure Rules
        </Button>
      </div>
    </div>
  );
};

