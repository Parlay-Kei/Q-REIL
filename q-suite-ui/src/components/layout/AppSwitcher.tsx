import React from 'react';
import { modules, type ModuleStatus } from '../../lib/modules';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AppSwitcherProps {
  onNavigate: (path: string) => void;
  className?: string;
}

const statusBadgeConfig: Record<ModuleStatus, { label: string; color: 'success' | 'warning' | 'info' }> = {
  'active': {
    label: 'Active',
    color: 'success',
  },
  'beta': {
    label: 'Beta',
    color: 'warning',
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'info',
  },
};

export function AppSwitcher({ onNavigate, className = '' }: AppSwitcherProps) {
  const handleTileClick = (module: typeof modules[0]) => {
    if (module.status === 'coming-soon') {
      // Navigate to roadmap for Coming Soon modules
      onNavigate('/roadmap');
    } else {
      // Navigate to module route for Active/Beta
      onNavigate(module.route);
    }
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>

      {modules.map((module) => {
        const Icon = module.icon;
        const badgeConfig = statusBadgeConfig[module.status];
        const isDisabled = module.status === 'coming-soon';

        return (
          <div
            key={module.id}
            className={`group relative p-5 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline text-left transition-all duration-base ${
              isDisabled
                ? 'opacity-75'
                : 'hover:bg-surface-elevated/80 hover:border-stroke-subtle hover:-translate-y-0.5 hover:shadow-lg'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan aurora-edge`}>

            {/* Icon and status badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-surface-elevated transition-colors ${
                isDisabled ? '' : 'group-hover:bg-surface-hover'
              }`}>
                <Icon
                  size={24}
                  className={`text-text-secondary transition-colors ${
                    isDisabled ? '' : 'group-hover:text-accent-cyan'
                  }`} />
              </div>
              <Badge color={badgeConfig.color} size="sm">
                {badgeConfig.label}
              </Badge>
            </div>

            {/* Content */}
            <h3 className={`text-base font-semibold text-text-primary mb-1 transition-colors ${
              isDisabled ? '' : 'group-hover:text-accent-cyan'
            }`}>
              {module.name}
            </h3>
            <p className="text-sm text-text-tertiary mb-4 line-clamp-2">
              {module.description}
            </p>

            {/* CTA Button */}
            <div className="mt-4">
              <Button
                variant={isDisabled ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleTileClick(module)}
                className="w-full"
                disabled={false} // Always allow clicking, even Coming Soon goes to roadmap
              >
                {module.ctaLabel}
              </Button>
            </div>
          </div>);
      })}
    </div>);
}
