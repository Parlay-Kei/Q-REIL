import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { Badge } from '../ui/Badge';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => navigate(path)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Command bar */}
        <CommandBar
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          notificationCount={3}
          connectorStatus="healthy"
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Demo identity banner */}
        {(import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.DEV) && (
          <footer className="border-t border-stroke-hairline bg-surface-elevated px-6 py-2">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span>App: <strong className="text-text-secondary">Q Suite</strong></span>
                <span>Module: <strong className="text-text-secondary">Q REIL</strong></span>
                <span>Environment: <strong className="text-text-secondary">Demo</strong></span>
                <span>Data mode: <strong className="text-text-secondary">
                  {import.meta.env.VITE_USE_INBOX_SEED_DATA === 'true' ? 'Seeded' : 'Live'}
                </strong></span>
              </div>
              <Badge color="neutral" size="sm">Demo</Badge>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}