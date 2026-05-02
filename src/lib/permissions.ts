// Role-based permissions map for Defense Research Org
// Module keys correspond to route paths

export type ModuleKey =
  | 'dashboard'
  | 'programs'
  | 'projects'
  | 'prototypes'
  | 'field-tests'
  | 'clearance'
  | 'compliance'
  | 'assets'
  | 'reports'
  | 'audit'
  | 'backup'
  | 'users';

export type Capability = 'view' | 'create' | 'update' | 'delete' | 'export';

// Default: every role gets full view of dashboard.
// Super Admin always overrides everything.
const ROLE_MATRIX: Record<string, Partial<Record<ModuleKey, Capability[]>>> = {
  'Super Admin': {
    dashboard: ['view'], programs: ['view','create','update','delete','export'],
    projects: ['view','create','update','delete','export'],
    prototypes: ['view','create','update','delete','export'],
    'field-tests': ['view','create','update','delete','export'],
    clearance: ['view','create','update','delete','export'],
    compliance: ['view','update','export'],
    assets: ['view','create','update','delete','export'],
    reports: ['view','export'], audit: ['view','export'],
    backup: ['view','create','update','delete'], users: ['view','create','update','delete'],
  },
  'Defense Director': {
    dashboard: ['view'], programs: ['view','create','update','export'],
    projects: ['view','update','export'], prototypes: ['view','export'],
    'field-tests': ['view','export'], clearance: ['view'],
    compliance: ['view','export'], assets: ['view'], reports: ['view','export'], audit: ['view','export'],
  },
  'Program Commander': {
    dashboard: ['view'], programs: ['view','update'],
    projects: ['view','create','update'], prototypes: ['view','create','update'],
    'field-tests': ['view','create','update'], compliance: ['view'],
    assets: ['view'], reports: ['view','export'], clearance: ['view'],
  },
  'Lead Scientist': {
    dashboard: ['view'], programs: ['view'], projects: ['view','update'],
    prototypes: ['view','create','update','delete'],
    'field-tests': ['view','create','update'], assets: ['view'], reports: ['view','export'],
  },
  'Weapons Systems Engineer': {
    dashboard: ['view'], projects: ['view'],
    prototypes: ['view','create','update'], 'field-tests': ['view','create'],
    assets: ['view','update'], reports: ['view'],
  },
  'Aerospace Engineer': {
    dashboard: ['view'], projects: ['view'],
    prototypes: ['view','create','update'], 'field-tests': ['view','create'],
    assets: ['view'], reports: ['view'],
  },
  'Cyber Security Analyst': {
    dashboard: ['view'], projects: ['view'], compliance: ['view','update'],
    audit: ['view','export'], reports: ['view'], clearance: ['view'],
  },
  'Field Testing Officer': {
    dashboard: ['view'], projects: ['view'], prototypes: ['view'],
    'field-tests': ['view','create','update'], assets: ['view'], reports: ['view'],
  },
  'Quality & Compliance Officer': {
    dashboard: ['view'], compliance: ['view','update','export'],
    audit: ['view','export'], reports: ['view','export'], clearance: ['view'], programs: ['view'], projects: ['view'],
  },
  'Logistics Manager': {
    dashboard: ['view'], assets: ['view','create','update','delete'],
    reports: ['view','export'], projects: ['view'],
  },
  'Finance': {
    dashboard: ['view'], programs: ['view'], projects: ['view'],
    reports: ['view','export'], assets: ['view'],
  },
  'External Auditor': {
    dashboard: ['view'], audit: ['view','export'], compliance: ['view','export'],
    reports: ['view','export'], programs: ['view'], projects: ['view'], clearance: ['view'],
  },
};

export function can(roleName: string | undefined, module: ModuleKey, cap: Capability = 'view'): boolean {
  if (!roleName) return false;
  if (roleName === 'Super Admin') return true;
  const caps = ROLE_MATRIX[roleName]?.[module];
  return !!caps?.includes(cap);
}

export function visibleModules(roleName: string | undefined): ModuleKey[] {
  if (!roleName) return [];
  if (roleName === 'Super Admin') {
    return Object.keys(ROLE_MATRIX['Super Admin']) as ModuleKey[];
  }
  const matrix = ROLE_MATRIX[roleName] || {};
  return (Object.keys(matrix) as ModuleKey[]).filter(k => can(roleName, k, 'view'));
}
