/**
 * Q Suite Module Registry
 * 
 * Single source of truth for all Q Suite modules.
 * Used by: AppSwitcher, Home launcher, route validation, 404 suggestions.
 * 
 * Mission: ENGDEL-QSUITE-MODULE-REGISTRY-AND-REDIRECTS-0002
 */

import type { LucideIcon } from 'lucide-react';
import {
  ZapIcon,
  LayoutDashboardIcon,
  FileTextIcon,
} from 'lucide-react';

export type ModuleStatus = 'active' | 'beta' | 'coming-soon';

export interface Module {
  id: string;
  name: string;
  description: string;
  route: string;
  status: ModuleStatus;
  ctaLabel: string;
  icon: LucideIcon;
}

/**
 * Get CTA label based on status
 */
function getCtaLabel(status: ModuleStatus): string {
  switch (status) {
    case 'active':
      return 'Open';
    case 'beta':
      return 'Open Beta';
    case 'coming-soon':
      return 'View Roadmap';
  }
}

/**
 * Q Suite modules registry
 * 
 * Modules are ordered by status: Active first, then Beta, then Coming Soon.
 */
export const modules: Module[] = [
  {
    id: 'reil',
    name: 'Q REIL',
    description: 'Commercial Real Estate package',
    route: '/reil',
    status: 'active',
    ctaLabel: getCtaLabel('active'),
    icon: ZapIcon,
  },
  {
    id: 'cc',
    name: 'Q CC',
    description: 'Control Center for users, roles, connectors, and system health',
    route: '/dashboard', // Using Dashboard as entry point per IA_NAV_SPEC.md
    status: 'beta',
    ctaLabel: getCtaLabel('beta'),
    icon: LayoutDashboardIcon,
  },
  {
    id: 'icms',
    name: 'Q ICMS',
    description: 'Information & Content Management System',
    route: '/roadmap', // Coming Soon modules route to roadmap
    status: 'coming-soon',
    ctaLabel: getCtaLabel('coming-soon'),
    icon: FileTextIcon,
  },
];

/**
 * Get module by ID
 */
export function getModuleById(id: string): Module | undefined {
  return modules.find(m => m.id === id);
}

/**
 * Get module by route
 */
export function getModuleByRoute(route: string): Module | undefined {
  return modules.find(m => m.route === route);
}

/**
 * Get active modules only
 */
export function getActiveModules(): Module[] {
  return modules.filter(m => m.status === 'active');
}

/**
 * Get all available routes (active + beta)
 */
export function getAvailableRoutes(): string[] {
  return modules
    .filter(m => m.status === 'active' || m.status === 'beta')
    .map(m => m.route);
}

/**
 * Check if a route is valid for a module
 */
export function isValidModuleRoute(route: string): boolean {
  return modules.some(m => route === m.route || route.startsWith(m.route + '/'));
}
