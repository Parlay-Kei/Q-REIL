import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ZapIcon,
  BookOpenIcon,
  BarChart3Icon,
  SettingsIcon,
  CheckCircleIcon,
  AlertCircleIcon } from 'lucide-react';
import { REIL_APP_NAME, REIL_APP_DESCRIPTION } from '../../constants/brand';
import { Badge } from '../ui/Badge';
interface AppTile {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
  connectorDeps?: string[];
  path: string;
}
interface AppSwitcherProps {
  onNavigate: (path: string) => void;
  className?: string;
}
const apps: AppTile[] = [
{
  id: 'reil',
  name: REIL_APP_NAME,
  description: REIL_APP_DESCRIPTION,
  icon: ZapIcon,
  status: 'healthy',
  lastUpdated: '2 min ago',
  connectorDeps: ['Gmail', 'Outlook'],
  path: '/reil'
},
{
  id: 'knowledge',
  name: 'Knowledge Base',
  description: 'Team documentation & guides',
  icon: BookOpenIcon,
  status: 'healthy',
  lastUpdated: '1 hour ago',
  path: '/knowledge'
},
{
  id: 'analytics',
  name: 'Analytics',
  description: 'Insights & reporting',
  icon: BarChart3Icon,
  status: 'healthy',
  lastUpdated: '30 min ago',
  connectorDeps: ['BigQuery'],
  path: '/analytics'
},
{
  id: 'settings',
  name: 'Settings',
  description: 'Configuration & integrations',
  icon: SettingsIcon,
  status: 'healthy',
  lastUpdated: 'Just now',
  path: '/settings'
}];

const statusConfig = {
  healthy: {
    icon: CheckCircleIcon,
    color: 'text-success',
    bg: 'bg-success-dim'
  },
  warning: {
    icon: AlertCircleIcon,
    color: 'text-warning',
    bg: 'bg-warning-dim'
  },
  error: {
    icon: AlertCircleIcon,
    color: 'text-danger',
    bg: 'bg-danger-dim'
  }
};
export function AppSwitcher({ onNavigate, className = '' }: AppSwitcherProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>

      {apps.map((app) => {
        const Icon = app.icon;
        const status = statusConfig[app.status];
        const StatusIcon = status.icon;
        return (
          <button
            key={app.id}
            onClick={() => onNavigate(app.path)}
            className="group relative p-5 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline text-left transition-all duration-base hover:bg-surface-elevated/80 hover:border-stroke-subtle hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan aurora-edge">

            {/* Icon and status */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-surface-elevated group-hover:bg-surface-hover transition-colors">
                <Icon
                  size={24}
                  className="text-text-secondary group-hover:text-accent-cyan transition-colors" />

              </div>
              <div className={`p-1.5 rounded-lg ${status.bg}`}>
                <StatusIcon size={14} className={status.color} />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-accent-cyan transition-colors">
              {app.name}
            </h3>
            <p className="text-sm text-text-tertiary mb-4 line-clamp-2">
              {app.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-quaternary font-mono">
                {app.lastUpdated}
              </span>
              {app.connectorDeps &&
              <div className="flex items-center gap-1">
                  {app.connectorDeps.slice(0, 2).map((dep, i) =>
                <span
                  key={i}
                  className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-quaternary">

                      {dep}
                    </span>
                )}
                  {app.connectorDeps.length > 2 &&
                <span className="text-xs text-text-quaternary">
                      +{app.connectorDeps.length - 2}
                    </span>
                }
                </div>
              }
            </div>
          </button>);

      })}
    </div>);

}