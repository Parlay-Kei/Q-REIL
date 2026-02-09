import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_DOCUMENT_TITLE } from '../constants/brand';
import { modules, getAvailableRoutes } from '../lib/modules';
import { Button } from '../components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const availableRoutes = getAvailableRoutes();

  useEffect(() => {
    document.title = `Route Not Found | ${DEFAULT_DOCUMENT_TITLE}`;
    return () => { document.title = DEFAULT_DOCUMENT_TITLE };
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code */}
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Route not found
        </h2>
        <p className="text-text-secondary mb-8">
          The route <code className="px-2 py-1 bg-surface-elevated rounded text-sm font-mono">{location.pathname}</code> does not exist.
        </p>

        {/* Available Routes */}
        <div className="mb-8 text-left">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Available routes:
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-surface-elevated border border-stroke-hairline">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Home</div>
                  <div className="text-sm text-text-tertiary font-mono">/</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  Go
                </Button>
              </div>
            </div>
            
            {modules.map((module) => {
              if (module.status === 'coming-soon') return null;
              
              return (
                <div
                  key={module.id}
                  className="p-3 rounded-lg bg-surface-elevated border border-stroke-hairline"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-primary">{module.name}</div>
                      <div className="text-sm text-text-tertiary font-mono">{module.route}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(module.route)}
                    >
                      Go
                    </Button>
                  </div>
                </div>);
            })}

            <div className="p-3 rounded-lg bg-surface-elevated border border-stroke-hairline">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Settings</div>
                  <div className="text-sm text-text-tertiary font-mono">/settings</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/settings')}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="primary"
            leftIcon={HomeIcon}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          <Button
            variant="secondary"
            leftIcon={ArrowLeftIcon}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>);
}
