import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE, SUITE_NAME } from '../constants/brand';
import { modules } from '../lib/modules';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export function Roadmap() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Roadmap | ${SUITE_NAME}`;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  const comingSoonModules = modules.filter(m => m.status === 'coming-soon');

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={ArrowLeftIcon}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Go Back
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight mb-3">
            Q Suite Roadmap
          </h1>
          <p className="text-lg text-text-secondary">
            Upcoming modules and features coming to {SUITE_NAME}.
          </p>
        </div>

        {/* Coming Soon Modules */}
        {comingSoonModules.length > 0 ? (
          <div className="space-y-6">
            {comingSoonModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="p-6 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-surface-elevated">
                      <Icon size={24} className="text-text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-text-primary">
                          {module.name}
                        </h2>
                        <Badge color="info" size="sm">
                          Coming Soon
                        </Badge>
                      </div>
                      <p className="text-text-secondary mb-4">
                        {module.description}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        This module is currently in development. Check back soon for updates.
                      </p>
                    </div>
                  </div>
                </div>);
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-surface-primary/60 backdrop-blur-xl border border-stroke-hairline text-center">
            <p className="text-text-secondary">
              No upcoming modules at this time. All modules are available!
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="primary"
            leftIcon={HomeIcon}
            onClick={() => navigate('/')}
          >
            Return to Launcher
          </Button>
        </div>
      </div>
    </div>);
}
