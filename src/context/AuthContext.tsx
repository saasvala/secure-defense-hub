import { useState, useCallback, type ReactNode } from 'react';
import { store, type User, type Role } from '@/lib/store';
import { AuthContext, type AppState } from './auth-context';

// Valid license keys (hardcoded for offline). Each key has an expiry date.
const VALID_LICENSES: Record<string, string> = {
  'DRO-2024-ALPHA-7X9K': '2026-12-31',
  'DRO-2024-BRAVO-3M2P': '2026-12-31',
  'DRO-2024-DELTA-8W4R': '2026-12-31',
  'SOFTWAREVALA-MASTER-KEY': '2099-12-31',
  '2345-3456-4567': '2026-12-31',
  '5678-2345-3456': '2026-12-31',
  // Test-only expired key (used by integration tests)
  'DRO-EXPIRED-TEST-KEY': '2020-01-01',
};

function isExpired(expiry: string): boolean {
  // Compare on YYYY-MM-DD basis to avoid TZ drift
  const today = new Date().toISOString().slice(0, 10);
  return expiry < today;
}

const IMPERSONATE_KEY = 'dro_impersonated_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() => {
    const license = store.getLicense();
    if (!license?.activated) return 'license';
    if (!store.isSetupComplete()) return 'setup';
    const user = store.getCurrentUser();
    if (user) return 'app';
    return 'login';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => store.getCurrentUser());
  const [impersonatedRoleName, setImpersonatedRoleName] = useState<string | null>(() => {
    try { return localStorage.getItem(IMPERSONATE_KEY); } catch { return null; }
  });

  const getRoleForUser = useCallback((user: User | null): Role | null => {
    if (!user) return null;
    return store.getRoles().find(r => r.id === user.role_id) || null;
  }, []);

  const realRole = getRoleForUser(currentUser);
  const isSuperAdmin = realRole?.name === 'Super Admin';

  // Effective role: if super admin is impersonating, use that role for permission filtering.
  const impersonatedRole = isSuperAdmin && impersonatedRoleName
    ? store.getRoles().find(r => r.name === impersonatedRoleName) || null
    : null;
  const currentRole = impersonatedRole || realRole;

  const switchRole = useCallback((roleName: string | null) => {
    if (!roleName || roleName === 'Super Admin') {
      localStorage.removeItem(IMPERSONATE_KEY);
      setImpersonatedRoleName(null);
      if (currentUser) store.addAudit({ user_id: currentUser.id, action: 'ROLE_SWITCH', details: 'Restored Super Admin view' });
      return;
    }
    localStorage.setItem(IMPERSONATE_KEY, roleName);
    setImpersonatedRoleName(roleName);
    if (currentUser) store.addAudit({ user_id: currentUser.id, action: 'ROLE_SWITCH', details: `Viewing as ${roleName}` });
  }, [currentUser]);

  const activateLicense = useCallback((key: string): { ok: true } | { ok: false; reason: 'invalid' | 'expired' } => {
    const trimmed = key.trim().toUpperCase();
    const matchKey = Object.keys(VALID_LICENSES).find(k => k.toUpperCase() === trimmed);
    if (!matchKey) return { ok: false, reason: 'invalid' };

    const expiry = VALID_LICENSES[matchKey];
    if (isExpired(expiry)) {
      store.addAudit({ user_id: 'system', action: 'LICENSE_REJECTED', details: `Expired key: ${matchKey.slice(0, 8)}...` });
      return { ok: false, reason: 'expired' };
    }

    const deviceId = navigator.userAgent.slice(0, 50);
    store.setLicense({
      id: crypto.randomUUID(),
      key: matchKey,
      device: deviceId,
      expiry,
      modules: ['all'],
      seats: 50,
      activated: true,
    });
    store.addAudit({ user_id: 'system', action: 'LICENSE_ACTIVATED', details: `Key: ${matchKey.slice(0, 8)}...` });
    // If a Super Admin already exists (seeded), skip setup and go straight to login.
    setAppState(store.isSetupComplete() ? 'login' : 'setup');
    return { ok: true };
  }, []);

  const completeSetup = useCallback((username: string, password: string) => {
    const roles = store.getRoles();
    let superAdminRole = roles.find(r => r.name === 'Super Admin');
    if (!superAdminRole) {
      superAdminRole = { id: crypto.randomUUID(), name: 'Super Admin' };
      store.setRoles([superAdminRole, ...roles]);
    }

    const superAdmin: User = {
      id: crypto.randomUUID(),
      role_id: superAdminRole.id,
      username,
      password,
      status: 'active',
    };

    const existing = store.getUsers();
    store.setUsers([superAdmin, ...existing.filter(u => u.username !== username)]);
    store.setSetupComplete(true);
    store.setCurrentUser(superAdmin);
    store.addAudit({ user_id: superAdmin.id, action: 'SUPER_ADMIN_CREATED', details: `Username: ${username}` });
    setCurrentUser(superAdmin);
    setAppState('app');
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const users = store.getUsers();
    const u = username.trim();
    const p = password.trim();
    // Accept common typo "admin.com" <-> "admim.com" for the seeded super admin email.
    const variants = new Set<string>([u, u.toLowerCase()]);
    variants.add(u.replace(/@admin\.com$/i, '@admim.com'));
    variants.add(u.replace(/@admim\.com$/i, '@admin.com'));
    const user = users.find(usr =>
      [...variants].some(v => usr.username.toLowerCase() === v.toLowerCase())
      && usr.password === p
      && usr.status === 'active'
    );
    if (!user) return false;
    store.setCurrentUser(user);
    store.addAudit({ user_id: user.id, action: 'LOGIN', details: `User ${user.username} logged in` });
    setCurrentUser(user);
    setAppState('app');
    return true;
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      store.addAudit({ user_id: currentUser.id, action: 'LOGOUT', details: `User logged out` });
    }
    localStorage.removeItem(IMPERSONATE_KEY);
    setImpersonatedRoleName(null);
    store.setCurrentUser(null);
    setCurrentUser(null);
    setAppState('login');
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      appState, currentUser, currentRole, realRole,
      impersonatedRoleName, switchRole,
      login, logout, activateLicense, completeSetup,
      isLicensed: !!store.getLicense()?.activated,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
