import React, { useState } from 'react';
import { AlertTriangle, Eye, Send, CheckCircle2 } from 'lucide-react';

interface DunningAlertBannerProps {
  overdueCount?: number;
  amountAtRisk?: string;
  onViewDelinquent?: () => void;
}

export function DunningAlertBanner({
  overdueCount = 12,
  amountAtRisk = '₹1,84,500',
  onViewDelinquent,
}: DunningAlertBannerProps) {
  const [reminded, setReminded] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center flex-shrink-0 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-base font-semibold text-on-surface tracking-tight">
              {overdueCount} Invoices Overdue for Collection
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-error-container text-error font-semibold">
              {amountAtRisk} At Risk
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Automated retry threshold exceeded for 4 enterprise accounts. Action required to prevent service pause.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
        <button
          onClick={onViewDelinquent}
          type="button"
          className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-outline" />
          <span>View Delinquent</span>
        </button>
        <button
          onClick={() => setReminded(true)}
          type="button"
          disabled={reminded}
          className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
            reminded
              ? 'bg-secondary-container text-on-secondary-container cursor-default'
              : 'bg-error text-on-error hover:bg-error/90'
          }`}
        >
          {reminded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reminders Dispatched</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Bulk Reminders ({overdueCount})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
