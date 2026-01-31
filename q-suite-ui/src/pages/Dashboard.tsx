import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_CONTROL_CENTER } from '../constants/brand';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  FileTextIcon,
  DollarSignIcon,
  TargetIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  SparklesIcon,
  LightbulbIcon,
  ZapIcon } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, KPICard } from '../components/ui/Card';
import { Timeline } from '../components/ui/Timeline';
import { Badge } from '../components/ui/Badge';
import { Sparkline } from '../components/ui/Sparkline';
const signals = [
{
  id: 1,
  type: 'opportunity',
  title: 'High-value deal stalled',
  description:
  'Meridian Capital Partners ($2.4M) has had no activity for 14 days',
  action: 'Review deal',
  priority: 'high'
},
{
  id: 2,
  type: 'insight',
  title: 'Conversion rate improving',
  description: 'Proposal-to-close rate up 18% this quarter vs. last',
  action: 'View analytics',
  priority: 'medium'
},
{
  id: 3,
  type: 'action',
  title: '12 threads need linking',
  description: 'Unlinked emails from key contacts detected',
  action: 'Link evidence',
  priority: 'high'
},
{
  id: 4,
  type: 'alert',
  title: 'Document expiring soon',
  description: 'NDA with Sterling Partners expires in 7 days',
  action: 'Renew document',
  priority: 'medium'
}];

const recentActivity = [
{
  id: 'evt-001',
  type: 'deal' as const,
  title: 'Deal moved to Negotiation',
  description: 'Apex Holdings deal advanced by Sarah Chen',
  actor: 'Sarah Chen',
  timestamp: new Date().toISOString(),
  references: ['DEAL-0156']
},
{
  id: 'evt-002',
  type: 'document' as const,
  title: 'Contract uploaded',
  description: 'Master Services Agreement added to Pinnacle deal',
  actor: 'Michael Torres',
  timestamp: new Date(Date.now() - 1800000).toISOString(),
  references: ['DOC-2024-0893']
},
{
  id: 'evt-003',
  type: 'email' as const,
  title: 'Email thread linked',
  description: 'Pricing discussion attached to Horizon Group',
  actor: 'Emily Park',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  references: ['THR-2024-1205']
},
{
  id: 'evt-004',
  type: 'user' as const,
  title: 'Meeting scheduled',
  description: 'Demo call with Sterling Partners confirmed',
  actor: 'Alex Morgan',
  timestamp: new Date(Date.now() - 7200000).toISOString()
},
{
  id: 'evt-005',
  type: 'link' as const,
  title: 'Evidence linked',
  description: 'Financial statements attached to due diligence',
  actor: 'David Kim',
  timestamp: new Date(Date.now() - 10800000).toISOString(),
  references: ['DOC-2024-0890', 'DEAL-0142']
}];

const signalIcons = {
  opportunity: SparklesIcon,
  insight: LightbulbIcon,
  action: ZapIcon,
  alert: AlertTriangleIcon
};
const signalColors = {
  opportunity: 'text-accent-violet bg-accent-violet-dim',
  insight: 'text-accent-teal bg-accent-teal-dim',
  action: 'text-accent-cyan bg-accent-cyan-dim',
  alert: 'text-warning bg-warning-dim'
};
export function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = TITLE_CONTROL_CENTER;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
          Control Center
        </h1>
        <p className="text-text-secondary">
          Real-time overview of your pipeline, signals, and activity.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Active Leads"
          value="156"
          change={8}
          changeLabel="vs last month"
          icon={UsersIcon}
          sparklineData={[120, 128, 135, 142, 148, 152, 156]} />

        <KPICard
          title="Open Quotes"
          value="$4.2M"
          change={15}
          changeLabel="vs last month"
          icon={FileTextIcon}
          sparklineData={[3.2, 3.4, 3.6, 3.8, 4.0, 4.1, 4.2]} />

        <KPICard
          title="Revenue Pipeline"
          value="$12.8M"
          change={23}
          changeLabel="vs last quarter"
          icon={DollarSignIcon}
          sparklineData={[9.5, 10.2, 10.8, 11.4, 11.9, 12.4, 12.8]} />

        <KPICard
          title="Conversion Rate"
          value="34%"
          change={5}
          changeLabel="vs last quarter"
          icon={TargetIcon}
          sparklineData={[28, 29, 30, 31, 32, 33, 34]} />

      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Signals Panel */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                Signals
              </h2>
              <Badge color="cyan" size="sm">
                {signals.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm">
              Configure
            </Button>
          </div>

          <div className="space-y-3">
            {signals.map((signal) => {
              const Icon = signalIcons[signal.type as keyof typeof signalIcons];
              const colorClass =
              signalColors[signal.type as keyof typeof signalColors];
              return (
                <Card key={signal.id} className="p-4 group" onClick={() => {}}>
                  <div className="flex gap-4">
                    <div className={`p-2.5 rounded-xl ${colorClass} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                          {signal.title}
                        </h3>
                        {signal.priority === 'high' &&
                        <Badge color="danger" size="sm">
                            High
                          </Badge>
                        }
                      </div>
                      <p className="text-sm text-text-tertiary mb-3">
                        {signal.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={ArrowRightIcon}>

                        {signal.action}
                      </Button>
                    </div>
                  </div>
                </Card>);

            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Recent Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reil/ledger')}>

              View ledger
            </Button>
          </div>

          <Card className="p-6">
            <Timeline events={recentActivity} />
          </Card>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Pipeline Overview
        </h2>
        <Card className="p-6" aurora>
          <div className="grid grid-cols-5 gap-4">
            {[
            {
              stage: 'Lead',
              count: 45,
              value: '$1.2M',
              color: 'bg-accent-cyan'
            },
            {
              stage: 'Qualification',
              count: 32,
              value: '$2.8M',
              color: 'bg-accent-violet'
            },
            {
              stage: 'Proposal',
              count: 18,
              value: '$4.1M',
              color: 'bg-accent-teal'
            },
            {
              stage: 'Negotiation',
              count: 12,
              value: '$3.2M',
              color: 'bg-warning'
            },
            {
              stage: 'Closed Won',
              count: 8,
              value: '$1.5M',
              color: 'bg-success'
            }].
            map((stage, index) =>
            <div key={stage.stage} className="relative">
                <div className="text-center mb-4">
                  <p className="text-sm text-text-tertiary mb-1">
                    {stage.stage}
                  </p>
                  <p className="text-2xl font-bold text-text-primary tabular-nums">
                    {stage.count}
                  </p>
                  <p className="text-sm text-text-secondary font-mono">
                    {stage.value}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                  <div
                  className={`h-full rounded-full ${stage.color} transition-all duration-slow`}
                  style={{
                    width: `${stage.count / 45 * 100}%`
                  }} />

                </div>
                {/* Connector arrow */}
                {index < 4 &&
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-text-quaternary">
                    <ArrowRightIcon size={16} />
                  </div>
              }
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

}