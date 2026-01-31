import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';

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
      </div>
    </div>
  );
}