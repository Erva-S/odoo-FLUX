import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';
import { Card } from '../../../components/ui/Card.js';

export interface StaffTask {
  id: string;
  type: 'Invoicing' | 'Verification' | 'Dunning' | 'Dispute';
  title: string;
  account: string;
  amount?: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  status: 'Pending' | 'Completed';
}

interface StaffTaskCardProps {
  task: StaffTask;
  onComplete?: (id: string) => void;
}

export const StaffTaskCard: React.FC<StaffTaskCardProps> = ({ task, onComplete }) => {
  return (
    <Card className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            task.priority === 'High'
              ? 'bg-error-container text-error'
              : 'bg-surface-container-high text-primary'
          }`}
        >
          {task.priority === 'High' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-data-mono text-outline font-semibold">
              {task.id}
            </span>
            <Badge variant={task.type === 'Dunning' ? 'warning' : 'primary'} size="sm">
              {task.type}
            </Badge>
            {task.priority === 'High' && (
              <Badge variant="error" size="sm">
                Urgent
              </Badge>
            )}
          </div>
          <h3 className="text-base font-bold text-on-surface mt-1">{task.title}</h3>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
            <span>
              Account: <strong className="text-on-surface">{task.account}</strong>
            </span>
            {task.amount && (
              <span>
                Amount: <strong className="font-data-mono text-on-surface">{task.amount}</strong>
              </span>
            )}
            <span>Due: {task.due}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        {task.status === 'Pending' ? (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => onComplete?.(task.id)}
          >
            Mark Complete
          </Button>
        ) : (
          <Badge variant="success" size="md">
            Completed
          </Badge>
        )}
      </div>
    </Card>
  );
};

