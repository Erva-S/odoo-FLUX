import React from 'react';
import { TrendingUp, Users, ShieldCheck, AlertTriangle, Building2, Wallet } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'indigo';
  icon: React.ReactNode;
  trend?: string;
  footerLabel?: string;
  footerValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'success',
  icon,
  trend,
  footerLabel,
  footerValue,
}) => {
  return (
    <div className="relative overflow-hidden bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          {title}
        </span>
        <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-on-surface font-headline-xl">
          {value}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {trend && <TrendingUp className="w-3 h-3 inline mr-0.5" />}
            {badgeText}
          </Badge>
        )}
      </div>
      {(subtitle || (footerLabel && footerValue)) && (
        <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
          <span>{subtitle || footerLabel}</span>
          {footerValue && <span className="font-semibold text-on-surface font-data-mono">{footerValue}</span>}
        </div>
      )}
    </div>
  );
};

