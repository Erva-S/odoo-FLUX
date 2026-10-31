import React, { useState } from 'react';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

interface OperationalTask {
  id: string;
  type: 'Invoicing' | 'Verification' | 'Dunning' | 'Dispute';
  title: string;
  account: string;
  amount?: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  status: 'Pending' | 'Completed';
}

const INITIAL_TASKS: OperationalTask[] = [
  {
    id: 'TASK-101',
    type: 'Invoicing',
    title: 'Manual GST e-Invoice Reconciliation',
    account: 'Kaizen Logistics Solutions',
    amount: '₹1,12,000',
    priority: 'High',
    due: 'Today, 5:00 PM',
    status: 'Pending',
  },
  {
    id: 'TASK-102',
    type: 'Verification',
    title: 'New Customer GSTIN & Certificate Verification',
    account: 'CloudPulse Networks',
    priority: 'Medium',
    due: 'Tomorrow',
    status: 'Pending',
  },
  {
    id: 'TASK-103',
    type: 'Dunning',
    title: 'Stage 2 Automated Dunning Follow-up Call',
    account: 'Zenith FinTech Labs',
    amount: '₹42,500',
    priority: 'High',
    due: 'In 2 hours',
    status: 'Pending',
  },
  {
    id: 'TASK-104',
    type: 'Dispute',
    title: 'Review AutoPay e-Mandate Decline Code 114',
    account: 'BlueHorizon Retail Analytics',
    priority: 'Low',
    due: 'Nov 02',
    status: 'Pending',
  },
];

export function OperationalQueuePage() {
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<string>('All');

  const completeTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: 'Completed' } : t)));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'Completed') return t.status === 'Completed';
    return t.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold font-label-caps uppercase tracking-wider">
              Staff Operations
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="font-data-mono text-xs text-outline">Task Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline-xl">
            Operational Queue & Triage
          </h1>
          <p className="text-sm text-on-surface-variant font-body-default mt-1">
            Execute manual billing reconciliations, client verification checks, and high-priority dunning interventions.
          </p>
        </div>
      </div>

      {/* Filter strip */}
      <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1 w-fit">
        {['All', 'Pending', 'Invoicing', 'Verification', 'Dunning', 'Completed'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === cat
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                  <span>Account: <strong className="text-on-surface">{task.account}</strong></span>
                  {task.amount && <span>Amount: <strong className="font-data-mono text-on-surface">{task.amount}</strong></span>}
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
                  onClick={() => completeTask(task.id)}
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
        ))}
      </div>
    </div>
  );
}

