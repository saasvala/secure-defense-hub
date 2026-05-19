// Single source of truth for application routes.
// App.tsx renders <Route> elements from APP_ROUTES, and the role-switch
// dropdown derives REGISTERED_ROUTES from the same array — preventing drift
// between the router and the registry.

import type { ComponentType } from 'react';
import Dashboard from '@/pages/Dashboard';
import Programs from '@/pages/Programs';
import Projects from '@/pages/Projects';
import Prototypes from '@/pages/Prototypes';
import FieldTests from '@/pages/FieldTests';
import ClearanceRecords from '@/pages/ClearanceRecords';
import Compliance from '@/pages/Compliance';
import Assets from '@/pages/Assets';
import Reports from '@/pages/Reports';
import AuditLogs from '@/pages/AuditLogs';
import Backup from '@/pages/Backup';
import UserManagement from '@/pages/UserManagement';
import AllRolesDashboard from '@/pages/AllRolesDashboard';
import type { ModuleKey } from '@/lib/permissions';

export interface AppRouteDef {
  path: string;
  component: ComponentType;
  module: ModuleKey;
}

export const APP_ROUTES: readonly AppRouteDef[] = [
  { path: '/dashboard',        component: Dashboard,          module: 'dashboard' },
  { path: '/programs',         component: Programs,           module: 'programs' },
  { path: '/projects',         component: Projects,           module: 'projects' },
  { path: '/prototypes',       component: Prototypes,         module: 'prototypes' },
  { path: '/field-tests',      component: FieldTests,         module: 'field-tests' },
  { path: '/clearance',        component: ClearanceRecords,   module: 'clearance' },
  { path: '/compliance',       component: Compliance,         module: 'compliance' },
  { path: '/assets',           component: Assets,             module: 'assets' },
  { path: '/reports',          component: Reports,            module: 'reports' },
  { path: '/audit',            component: AuditLogs,          module: 'audit' },
  { path: '/backup',           component: Backup,             module: 'backup' },
  { path: '/users',            component: UserManagement,     module: 'users' },
  { path: '/admin/all-roles',  component: AllRolesDashboard,  module: 'users' },
] as const;

// Derived from APP_ROUTES — never edit manually.
export const REGISTERED_ROUTES: ReadonlySet<string> = new Set(APP_ROUTES.map(r => r.path));

// Every role lands on /dashboard after switching. Keep this map open for future
// per-role landing pages without changing call sites.
export function getRoleDashboardRoute(_roleName: string | null | undefined): string {
  return '/dashboard';
}

export function isRouteRegistered(path: string): boolean {
  return REGISTERED_ROUTES.has(path);
}
