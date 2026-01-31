import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Sparkline } from './Sparkline';
type CardVariant = 'default' | 'kpi' | 'activity' | 'record' | 'connector';
interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  aurora?: boolean;
  onClick?: () => void;
}
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  sparklineData?: number[];
  className?: string;
}
interface ActivityCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  className?: string;
}
interface ConnectorCardProps {
  name: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  className?: string;
}
export function Card({
  variant = 'default',
  className = '',
  children,
  aurora = false,
  onClick
}: CardProps) {
  const variantStyles =
    variant === 'kpi' || variant === 'record' || variant === 'connector'
      ? 'panel-elevated'
      : '';
  const baseStyles = `
    panel ${variantStyles} texture luminous-arc
    transition-all duration-base ease-out
  `;
  const interactiveStyles = onClick ?
  'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' :
  '';
  const auroraStyles = aurora ? 'aurora-edge' : '';
  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${auroraStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}>

      {children}
    </div>);

}
export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  sparklineData,
  className = ''
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  return (
    <Card variant="kpi" className={`p-6 ${className}`} aurora>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-tertiary mb-1">{title}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
            {value}
          </p>
        </div>
        {Icon &&
        <div className="p-2.5 rounded-lg bg-accent-cyan-dim">
            <Icon size={20} className="text-accent-cyan" />
          </div>
        }
      </div>

      <div className="flex items-center justify-between">
        {change !== undefined &&
        <div className="flex items-center gap-1.5">
            {isPositive &&
          <TrendingUpIcon size={14} className="text-success" />
          }
            {isNegative &&
          <TrendingDownIcon size={14} className="text-danger" />
          }
            <span
            className={`text-sm font-medium tabular-nums ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-text-tertiary'}`}>

              {isPositive ? '+' : ''}
              {change}%
            </span>
            {changeLabel &&
          <span className="text-sm text-text-quaternary">
                {changeLabel}
              </span>
          }
          </div>
        }
        {sparklineData &&
        <Sparkline
          data={sparklineData}
          width={80}
          height={32}
          color={isNegative ? 'danger' : 'cyan'} />

        }
      </div>
    </Card>);

}
export function ActivityCard({
  icon: Icon,
  iconColor = 'text-accent-cyan',
  title,
  description,
  timestamp,
  actor,
  className = ''
}: ActivityCardProps) {
  return (
    <Card variant="activity" className={`p-4 ${className}`}>
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg bg-surface-elevated ${iconColor}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {title}
          </p>
          <p className="text-sm text-text-tertiary truncate">{description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-text-quaternary font-mono">
              {timestamp}
            </span>
            {actor &&
            <>
                <span className="text-text-quaternary">·</span>
                <span className="text-xs text-text-tertiary">{actor}</span>
              </>
            }
          </div>
        </div>
      </div>
    </Card>);

}
export function ConnectorCard({
  name,
  icon: Icon,
  status,
  lastSync,
  className = ''
}: ConnectorCardProps) {
  const statusConfig = {
    connected: {
      color: 'bg-success',
      label: 'Connected'
    },
    disconnected: {
      color: 'bg-text-quaternary',
      label: 'Disconnected'
    },
    syncing: {
      color: 'bg-accent-cyan animate-pulse',
      label: 'Syncing'
    },
    error: {
      color: 'bg-danger',
      label: 'Error'
    }
  };
  const { color, label } = statusConfig[status];
  return (
    <Card variant="connector" className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-surface-elevated">
          <Icon size={20} className="text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-xs text-text-tertiary">{label}</span>
          </div>
        </div>
        {lastSync &&
        <span className="text-xs text-text-quaternary font-mono">
            {lastSync}
          </span>
        }
      </div>
    </Card>);

}