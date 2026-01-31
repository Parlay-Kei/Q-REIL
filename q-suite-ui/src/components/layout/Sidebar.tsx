import React from 'react';
import {
  HomeIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MailIcon,
  FileTextIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZapIcon,
  Box,
} from 'lucide-react';
import { SUITE_NAME, SUITE_BYLINE, REIL_APP_NAME, CONTROL_CENTER_NAME } from '../../constants/brand';
import { Tooltip } from '../ui/Tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const topNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, path: '/' },
  { id: 'dashboard', label: CONTROL_CENTER_NAME, icon: LayoutDashboardIcon, path: '/dashboard' },
  { id: 'apps', label: 'Apps', icon: Box, path: '/apps' },
  { id: 'reil', label: REIL_APP_NAME, icon: ZapIcon, path: '/reil', badge: 12 },
];

const reilSubNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGridIcon, path: '/reil' },
  { id: 'inbox', label: 'Inbox', icon: MailIcon, path: '/reil/inbox', badge: 5 },
  { id: 'records', label: 'Records', icon: UsersIcon, path: '/reil/records' },
  { id: 'deals', label: 'Deals', icon: BriefcaseIcon, path: '/reil/deals' },
  { id: 'documents', label: 'Documents', icon: FileTextIcon, path: '/reil/documents' },
  { id: 'ledger', label: 'Ledger', icon: ClockIcon, path: '/reil/ledger' },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const isReilSection = (path: string) => path.startsWith('/reil');

function NavButton({
  item,
  isActive,
  isCollapsed,
  onNavigate,
  onToggleCollapse,
  children,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: (path: string) => void;
  onToggleCollapse: () => void;
  children: React.ReactNode;
}) {
  const Icon = item.icon;
  const button = (
    <button
      onClick={() => onNavigate(item.path)}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-base ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan
        ${isActive ? 'bg-accent-cyan-dim text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}
      `}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-cyan rounded-full shadow-glow-cyan" />
      )}
      <Icon size={20} className="shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium truncate animate-fade-in">
            {item.label}
          </span>
          {item.badge !== undefined && (
            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-accent-cyan/20 text-accent-cyan">
              {item.badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && item.badge !== undefined && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-cyan" />
      )}
    </button>
  );
  return isCollapsed ? (
    <Tooltip key={item.id} content={item.label} position="right">
      {button}
    </Tooltip>
  ) : (
    <div key={item.id}>{button}</div>
  );
}

export function Sidebar({
  currentPath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`
        flex flex-col h-full
        bg-surface-primary/60 backdrop-blur-xl texture luminous-arc
        border-r border-stroke-hairline
        transition-all duration-slow ease-out
        ${isCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-stroke-hairline">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
            <span className="text-bg-deep font-bold text-sm">Q</span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <span className="font-semibold text-text-primary tracking-tight">{SUITE_NAME}</span>
              <span className="block text-xs text-text-quaternary">{SUITE_BYLINE}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top-level navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {topNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentPath === item.path}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
            onToggleCollapse={onToggleCollapse}
          >
            {item.label}
          </NavButton>
        ))}

        {/* REIL sub-nav (when in REIL section) */}
        {isReilSection(currentPath) && (
          <div className="pt-2 mt-2 border-t border-stroke-hairline">
            <div className={!isCollapsed ? 'px-3 py-1.5' : 'px-0 py-1.5'}>
              {!isCollapsed && (
                <span className="text-xs font-medium text-text-quaternary uppercase tracking-wider">
                  {REIL_APP_NAME}
                </span>
              )}
            </div>
            <div className="space-y-1 mt-1">
              {reilSubNavItems.map((item) => {
                const isOverview = item.path === '/reil';
                const isActive = isOverview
                  ? currentPath === '/reil'
                  : currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <NavButton
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                    onToggleCollapse={onToggleCollapse}
                  >
                    {item.label}
                  </NavButton>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom navigation */}
      <div className="py-4 px-2 border-t border-stroke-hairline">
        {bottomNavItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          const button = (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-base ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan
                ${isActive ? 'bg-accent-cyan-dim text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}
              `}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium animate-fade-in">{item.label}</span>
              )}
            </button>
          );
          return isCollapsed ? (
            <Tooltip key={item.id} content={item.label} position="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all duration-base"
        >
          {isCollapsed ? (
            <ChevronRightIcon size={20} />
          ) : (
            <>
              <ChevronLeftIcon size={20} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
