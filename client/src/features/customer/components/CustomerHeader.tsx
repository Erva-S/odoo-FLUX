import React from 'react';
import { Badge } from '../../../components/ui/Badge.js';

interface CustomerHeaderProps {
  companyName: string;
  planName?: string;
  status?: string;
  mrr?: string;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  companyName,
  planName = 'Professional Tier',
  status = 'Active',
  mrr,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center shadow-md">
          {companyName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-on-surface font-headline-sm">{companyName}</h1>
            <Badge variant="success" size="sm">
              {status}
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant font-body-default mt-0.5">
            Plan: <strong className="text-on-surface">{planName}</strong>
          </p>
        </div>
      </div>
      {mrr && (
        <div className="text-right">
          <span className="text-[11px] font-label-caps uppercase text-outline font-semibold">
            Current Billing Cadence
          </span>
          <div className="text-lg font-bold font-data-mono text-on-surface">{mrr}</div>
        </div>
      )}
    </div>
  );
};

