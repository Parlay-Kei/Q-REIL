import React, { useState } from 'react';
import {
  SearchIcon,
  PlusIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  CommandIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon } from
'lucide-react';
import { SUITE_NAME, REIL_APP_NAME } from '../../constants/brand';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
interface CommandBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSearch?: () => void;
  onQuickCreate?: () => void;
  notificationCount?: number;
  connectorStatus?: 'healthy' | 'warning' | 'error' | 'syncing';
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}
export function CommandBar({
  isDarkMode,
  onToggleTheme,
  onSearch,
  onQuickCreate,
  notificationCount = 0,
  connectorStatus = 'healthy',
  user = {
    name: 'Alex Morgan',
    email: 'alex@stratanoble.com'
  }
}: CommandBarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const connectorConfig = {
    healthy: {
      icon: CheckCircleIcon,
      color: 'text-success',
      label: 'All systems operational'
    },
    warning: {
      icon: AlertCircleIcon,
      color: 'text-warning',
      label: 'Some connectors need attention'
    },
    error: {
      icon: AlertCircleIcon,
      color: 'text-danger',
      label: 'Connection issues detected'
    },
    syncing: {
      icon: RefreshCwIcon,
      color: 'text-accent-cyan animate-spin',
      label: 'Syncing data...'
    }
  };
  const connector = connectorConfig[connectorStatus];
  const ConnectorIcon = connector.icon;
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-stroke-hairline bg-surface-primary/40 backdrop-blur-xl texture luminous-arc">
      {/* Left section - Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSearch}
          className="flex items-center gap-3 h-10 px-4 rounded-lg panel text-text-tertiary hover:text-text-secondary transition-all duration-base group focus-ring">

          <SearchIcon size={16} />
          <span className="text-sm">Search {SUITE_NAME}, {REIL_APP_NAME}…</span>
          <div className="flex items-center gap-1 ml-8">
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-elevated border border-stroke-hairline text-text-quaternary group-hover:text-text-tertiary">
              <CommandIcon size={10} className="inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-surface-elevated border border-stroke-hairline text-text-quaternary group-hover:text-text-tertiary">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Quick create */}
        <Tooltip content="Quick create">
          <button
            onClick={onQuickCreate}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-teal text-bg-deep hover:shadow-glow-cyan transition-all duration-base">

            <PlusIcon size={18} />
          </button>
        </Tooltip>

        {/* Connector status */}
        <Tooltip content={connector.label}>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors duration-base">
            <ConnectorIcon size={18} className={connector.color} />
          </button>
        </Tooltip>

        {/* Notifications */}
        <Tooltip content={`${notificationCount} notifications`}>
          <button className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors duration-base">
            <BellIcon size={18} className="text-text-secondary" />
            {notificationCount > 0 &&
            <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-semibold rounded-full bg-danger text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            }
          </button>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip content={isDarkMode ? 'Light mode' : 'Dark mode'}>
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-hover transition-colors duration-base">

            {isDarkMode ?
            <SunIcon size={18} className="text-text-secondary" /> :

            <MoonIcon size={18} className="text-text-secondary" />
            }
          </button>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-8 bg-stroke-hairline mx-2" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors duration-base">

            <Avatar
              name={user.name}
              src={user.avatar}
              size="sm"
              status="online" />

            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-text-primary">
                {user.name}
              </p>
              <p className="text-xs text-text-tertiary">{user.email}</p>
            </div>
          </button>

          {isUserMenuOpen &&
          <>
              <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)} />

              <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-surface-elevated/95 backdrop-blur-xl border border-stroke-hairline shadow-lg z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-stroke-hairline">
                  <p className="text-sm font-medium text-text-primary">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-tertiary">{user.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
                    Profile settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
                    Team management
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
                    Billing
                  </button>
                </div>
                <div className="border-t border-stroke-hairline pt-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger-dim transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </header>);

}