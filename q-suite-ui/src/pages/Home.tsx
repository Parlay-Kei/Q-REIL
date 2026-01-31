import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, REIL_APP_NAME, CONTROL_CENTER_NAME, TITLE_HOME } from '../constants/brand';
import {
  ArrowRightIcon,
  ZapIcon,
  BriefcaseIcon,
  FileTextIcon,
  ClockIcon,
  MailIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  LayoutDashboardIcon,
  Box,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, KPICard, ConnectorCard } from '../components/ui/Card';
import { Timeline } from '../components/ui/Timeline';
import { Badge } from '../components/ui/Badge';
const recentEvents = [
{
  id: 'evt-001',
  type: 'document' as const,
  title: 'Document linked to Deal',
  description:
  'Q3 Financial Report attached to Meridian Capital Partners deal',
  actor: 'Sarah Chen',
  timestamp: new Date().toISOString(),
  references: ['DOC-2024-0892', 'DEAL-0156']
},
{
  id: 'evt-002',
  type: 'email' as const,
  title: 'Thread attached to Contact',
  description:
  'Email thread from James Wilson linked to Apex Holdings contact',
  actor: 'System',
  timestamp: new Date(Date.now() - 1800000).toISOString(),
  references: ['THR-2024-1204']
},
{
  id: 'evt-003',
  type: 'deal' as const,
  title: 'Deal stage updated',
  description: 'Pinnacle Investments moved from Qualification to Proposal',
  actor: 'Michael Torres',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  references: ['DEAL-0142']
},
{
  id: 'evt-004',
  type: 'link' as const,
  title: 'Evidence linked',
  description: 'Contract draft linked to Horizon Group deal workspace',
  actor: 'Emily Park',
  timestamp: new Date(Date.now() - 7200000).toISOString(),
  references: ['DOC-2024-0891', 'DEAL-0148']
},
{
  id: 'evt-005',
  type: 'user' as const,
  title: 'Contact created',
  description: 'New contact added: David Kim, CFO at Sterling Partners',
  actor: 'Alex Morgan',
  timestamp: new Date(Date.now() - 10800000).toISOString(),
  references: ['CON-2024-0567']
}];

/** Quick Access: Q REIL, Q Control Center, Apps only (per NAV_LABELS_FINAL.md) */
const appTiles = [
  {
    id: 'reil',
    name: REIL_APP_NAME,
    icon: ZapIcon,
    badge: 12,
    path: '/reil',
    color: 'from-accent-cyan to-accent-teal',
  },
  {
    id: 'control-center',
    name: CONTROL_CENTER_NAME,
    icon: LayoutDashboardIcon,
    path: '/dashboard',
    color: 'from-accent-violet to-accent-cyan',
  },
  {
    id: 'apps',
    name: 'Apps',
    icon: Box,
    path: '/apps',
    color: 'from-accent-teal to-success',
  },
];

export function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = TITLE_HOME;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Hero Panel */}
      <div className="relative mb-8 p-8 rounded-2xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline overflow-hidden aurora-edge">
        {/* Luminous arc */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-60" />

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-cyan/10 to-accent-violet/10 rounded-full blur-3xl" />

        <div className="relative">
          <Badge color="cyan" className="mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Live
            </span>
          </Badge>

          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight mb-3">
            One workspace. One ledger.
            <br />
            <span className="bg-gradient-to-r from-accent-cyan to-accent-teal bg-clip-text text-transparent">
              Full transaction visibility.
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mb-6">
            Q Suite unifies your inbox, documents, and deals into a single
            transaction timeline. Every action is recorded, every connection is
            traceable.
          </p>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              rightIcon={ArrowRightIcon}
              onClick={() => navigate('/reil')}>

              Start linking evidence
            </Button>
            <Button variant="secondary" onClick={() => navigate('/reil/ledger')}>
              View activity ledger
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Apps and Status */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Quick Access Apps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Quick Access
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/apps')}>

                View all apps
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {appTiles.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => navigate(app.path)}
                    className="group relative p-4 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline text-center transition-all duration-base hover:bg-surface-elevated/80 hover:border-stroke-subtle hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan">

                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center`}>

                      <Icon size={24} className="text-bg-deep" />
                    </div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                      {app.name}
                    </span>
                    {app.badge &&
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-semibold rounded bg-accent-cyan/20 text-accent-cyan">
                        {app.badge}
                      </span>
                    }
                  </button>);

              })}
            </div>
          </div>

          {/* Global Status */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Global Status
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Active Deals"
                value="24"
                change={12}
                changeLabel="vs last month"
                icon={BriefcaseIcon}
                sparklineData={[12, 15, 18, 14, 20, 22, 24]} />

              <KPICard
                title="Unlinked Threads"
                value="47"
                change={-8}
                changeLabel="vs last week"
                icon={MailIcon}
                sparklineData={[65, 58, 52, 55, 48, 50, 47]} />

              <KPICard
                title="Documents"
                value="1,284"
                change={5}
                changeLabel="this week"
                icon={FileTextIcon}
                sparklineData={[1200, 1220, 1245, 1260, 1270, 1278, 1284]} />

              <KPICard
                title="Ledger Events"
                value="8.4K"
                change={23}
                changeLabel="this month"
                icon={ClockIcon}
                sparklineData={[6800, 7100, 7400, 7800, 8000, 8200, 8400]} />

            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Recent Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reil/ledger')}>

                View all
              </Button>
            </div>
            <Card className="p-6">
              <Timeline events={recentEvents} groupByDay={false} />
            </Card>
          </div>
        </div>

        {/* Right column - Connectors */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Connector Health
            </h2>
            <div className="space-y-3">
              <ConnectorCard
                name="Gmail"
                icon={MailIcon}
                status="connected"
                lastSync="2 min ago" />

              <ConnectorCard
                name="Outlook"
                icon={MailIcon}
                status="syncing"
                lastSync="Syncing..." />

              <ConnectorCard
                name="Google Drive"
                icon={FileTextIcon}
                status="connected"
                lastSync="5 min ago" />

              <ConnectorCard
                name="Salesforce"
                icon={BriefcaseIcon}
                status="connected"
                lastSync="1 min ago" />

              <ConnectorCard
                name="Dropbox"
                icon={FileTextIcon}
                status="error"
                lastSync="Failed" />

            </div>
          </div>

          {/* System Health */}
          <Card className="p-5" aurora>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success-dim">
                <CheckCircleIcon size={18} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  System Health
                </p>
                <p className="text-xs text-text-tertiary">
                  All systems operational
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">API Response</span>
                <span className="text-success font-mono">42ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Sync Queue</span>
                <span className="text-text-primary font-mono">0 pending</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Last Backup</span>
                <span className="text-text-primary font-mono">12 min ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}