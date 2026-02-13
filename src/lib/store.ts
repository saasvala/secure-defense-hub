// Local storage based data store for offline-first operation

export interface License {
  id: string;
  key: string;
  device: string;
  expiry: string;
  modules: string[];
  seats: number;
  activated: boolean;
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  role_id: string;
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'locked';
}

export interface Program {
  id: string;
  name: string;
  classification: 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';
  status: 'active' | 'suspended' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
}

export interface Project {
  id: string;
  program_id: string;
  code_name: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'cancelled';
  description: string;
  created_at: string;
}

export interface Prototype {
  id: string;
  project_id: string;
  version: string;
  result: 'pending' | 'pass' | 'fail' | 'review';
  notes: string;
  created_at: string;
}

export interface FieldTest {
  id: string;
  project_id: string;
  location: string;
  outcome: 'success' | 'partial' | 'failure' | 'pending';
  date: string;
  notes: string;
}

export interface Clearance {
  id: string;
  user_id: string;
  level: 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';
  expiry: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'decommissioned';
}

export interface InventoryItem {
  id: string;
  asset_id: string;
  qty: number;
  location: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  date: string;
  details: string;
}

export interface BackupEntry {
  id: string;
  date: string;
  size: string;
  status: 'completed' | 'failed';
}

const STORAGE_PREFIX = 'dro_';

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

export const store = {
  // License
  getLicense: (): License | null => getItem<License | null>('license', null),
  setLicense: (l: License) => setItem('license', l),

  // Roles
  getRoles: (): Role[] => getItem<Role[]>('roles', []),
  setRoles: (r: Role[]) => setItem('roles', r),

  // Users
  getUsers: (): User[] => getItem<User[]>('users', []),
  setUsers: (u: User[]) => setItem('users', u),

  // Programs
  getPrograms: (): Program[] => getItem<Program[]>('programs', []),
  setPrograms: (p: Program[]) => setItem('programs', p),

  // Projects
  getProjects: (): Project[] => getItem<Project[]>('projects', []),
  setProjects: (p: Project[]) => setItem('projects', p),

  // Prototypes
  getPrototypes: (): Prototype[] => getItem<Prototype[]>('prototypes', []),
  setPrototypes: (p: Prototype[]) => setItem('prototypes', p),

  // Field Tests
  getFieldTests: (): FieldTest[] => getItem<FieldTest[]>('field_tests', []),
  setFieldTests: (f: FieldTest[]) => setItem('field_tests', f),

  // Clearance
  getClearances: (): Clearance[] => getItem<Clearance[]>('clearances', []),
  setClearances: (c: Clearance[]) => setItem('clearances', c),

  // Assets
  getAssets: (): Asset[] => getItem<Asset[]>('assets', []),
  setAssets: (a: Asset[]) => setItem('assets', a),

  // Inventory
  getInventory: (): InventoryItem[] => getItem<InventoryItem[]>('inventory', []),
  setInventory: (i: InventoryItem[]) => setItem('inventory', i),

  // Audit
  getAudit: (): AuditEntry[] => getItem<AuditEntry[]>('audit', []),
  addAudit: (entry: Omit<AuditEntry, 'id' | 'date'>) => {
    const audit = getItem<AuditEntry[]>('audit', []);
    audit.unshift({ ...entry, id: crypto.randomUUID(), date: new Date().toISOString() });
    setItem('audit', audit);
  },

  // Backups
  getBackups: (): BackupEntry[] => getItem<BackupEntry[]>('backups', []),
  setBackups: (b: BackupEntry[]) => setItem('backups', b),

  // Setup state
  isSetupComplete: (): boolean => getItem<boolean>('setup_complete', false),
  setSetupComplete: (v: boolean) => setItem('setup_complete', v),

  // Current user session
  getCurrentUser: (): User | null => getItem<User | null>('current_user', null),
  setCurrentUser: (u: User | null) => setItem('current_user', u),

  // Clear all
  clearAll: () => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
    });
  },
};

// Generate unique ID
export const genId = () => crypto.randomUUID();
