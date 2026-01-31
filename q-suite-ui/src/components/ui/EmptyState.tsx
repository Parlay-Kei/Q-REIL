import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';
import { Button } from './Button';
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>

      {/* Icon with aurora glow effect */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 rounded-full blur-2xl" />
        <div className="relative p-5 rounded-2xl bg-surface-primary border border-stroke-hairline">
          <Icon size={32} className="text-text-tertiary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-sm mb-6">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) &&
      <div className="flex items-center gap-3">
          {action &&
        <Button
          variant="primary"
          leftIcon={action.icon}
          onClick={action.onClick}>

              {action.label}
            </Button>
        }
          {secondaryAction &&
        <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
        }
        </div>
      }
    </div>);

}
// Error state variant
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>

      <div className="relative mb-6">
        <div className="absolute inset-0 bg-danger/20 rounded-full blur-2xl" />
        <div className="relative p-5 rounded-2xl bg-danger-dim border border-danger/20">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-danger">

            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-sm mb-6">{description}</p>

      {onRetry &&
      <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    </div>);

}