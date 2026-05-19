// Central registry of all routes registered in App.tsx.
// Used by the role-switch dropdown to verify targets exist before enabling them.

export const REGISTERED_ROUTES: ReadonlySet<string> = new Set<string>([
  '/dashboard',
  '/programs',
  '/projects',
  '/prototypes',
  '/field-tests',
  '/clearance',
  '/compliance',
  '/assets',
  '/reports',
  '/audit',
  '/backup',
  '/users',
  '/admin/all-roles',
]);

// Every role lands on /dashboard after switching. Keep this map open for future
// per-role landing pages without changing call sites.
export function getRoleDashboardRoute(_roleName: string | null | undefined): string {
  return '/dashboard';
}

export function isRouteRegistered(path: string): boolean {
  return REGISTERED_ROUTES.has(path);
}
