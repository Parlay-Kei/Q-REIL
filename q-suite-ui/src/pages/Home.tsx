import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, TITLE_HOME } from '../constants/brand';
import { modules, type ModuleStatus } from '../lib/modules';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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

export function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = TITLE_HOME;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  const handleTileClick = (module: typeof modules[0]) => {
    if (module.status === 'coming-soon') {
      // Navigate to roadmap for Coming Soon modules
      navigate('/roadmap');
    } else {
      // Navigate to module route for Active/Beta
      navigate(module.route);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Launcher Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight mb-3">
          Q Suite Launcher
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Access all Q Suite modules. Each module connects to your unified ledger.
        </p>
      </div>

      {/* Module Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const badgeConfig = statusBadgeConfig[module.status];
          const isDisabled = module.status === 'coming-soon';

          return (
            <div
              key={module.id}
              className={`group relative p-6 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline text-left transition-all duration-base ${
                isDisabled
                  ? 'opacity-75'
                  : 'hover:bg-surface-elevated/80 hover:border-stroke-subtle hover:-translate-y-0.5 hover:shadow-lg'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan aurora-edge`}>

              {/* Icon and status badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl bg-surface-elevated transition-colors ${
                  isDisabled ? '' : 'group-hover:bg-surface-hover'
                }`}>
                  <Icon
                    size={32}
                    className={`text-text-secondary transition-colors ${
                      isDisabled ? '' : 'group-hover:text-accent-cyan'
                    }`} />
                </div>
                <Badge color={badgeConfig.color} size="sm">
                  {badgeConfig.label}
                </Badge>
              </div>

              {/* Content */}
              <h2 className={`text-xl font-semibold text-text-primary mb-2 transition-colors ${
                isDisabled ? '' : 'group-hover:text-accent-cyan'
              }`}>
                {module.name}
              </h2>
              <p className="text-sm text-text-tertiary mb-6 line-clamp-2">
                {module.description}
              </p>

              {/* CTA Button */}
              <Button
                variant={isDisabled ? 'secondary' : 'primary'}
                size="md"
                onClick={() => handleTileClick(module)}
                className="w-full"
                disabled={false} // Always allow clicking, even Coming Soon goes to roadmap
              >
                {module.ctaLabel}
              </Button>
            </div>);
        })}
      </div>
    </div>);
}
