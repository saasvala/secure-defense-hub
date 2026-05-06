import { createContext, useState, useCallback, type ReactNode } from 'react';
import { store, type User, type Role } from '@/lib/store';

type AppState = 'license' | 'setup' | 'login' | 'app';

export interface AuthContextType {
  appState: AppState;
  currentUser: User | null;
  currentRole: Role | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  activateLicense: (key: string) => boolean;
  completeSetup: (username: string, password: string) => void;
  isLicensed: boolean;
  isSuperAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Valid license keys (hardcoded for offline)
const VALID_KEYS = [
  'DRO-2024-ALPHA-7X9K',
  'DRO-2024-BRAVO-3M2P',
  'DRO-2024-DELTA-8W4R',
  'SOFTWAREVALA-MASTER-KEY',
];

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

  const getRoleForUser = useCallback((user: User | null): Role | null => {
    if (!user) return null;
    return store.getRoles().find(r => r.id === user.role_id) || null;
  }, []);

  const currentRole = getRoleForUser(currentUser);
  const isSuperAdmin = currentRole?.name === 'Super Admin';

  const activateLicense = useCallback((key: string): boolean => {
    const trimmed = key.trim().toUpperCase();
    if (!VALID_KEYS.includes(trimmed)) return false;
    
    const deviceId = navigator.userAgent.slice(0, 50);
    store.setLicense({
      id: crypto.randomUUID(),
      key: trimmed,
      device: deviceId,
      expiry: '2026-12-31',
      modules: ['all'],
      seats: 50,
      activated: true,
    });
    store.addAudit({ user_id: 'system', action: 'LICENSE_ACTIVATED', details: `Key: ${trimmed.slice(0, 8)}...` });
    setAppState('setup');
    return true;
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

    store.setUsers([superAdmin]);
    store.setSetupComplete(true);
    store.setCurrentUser(superAdmin);
    store.addAudit({ user_id: superAdmin.id, action: 'SUPER_ADMIN_CREATED', details: `Username: ${username}` });
    setCurrentUser(superAdmin);
    setAppState('app');
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const users = store.getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.status === 'active');
    if (!user) return false;
    store.setCurrentUser(user);
    store.addAudit({ user_id: user.id, action: 'LOGIN', details: `User ${username} logged in` });
    setCurrentUser(user);
    setAppState('app');
    return true;
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      store.addAudit({ user_id: currentUser.id, action: 'LOGOUT', details: `User logged out` });
    }
    store.setCurrentUser(null);
    setCurrentUser(null);
    setAppState('login');
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      appState, currentUser, currentRole,
      login, logout, activateLicense, completeSetup,
      isLicensed: !!store.getLicense()?.activated,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from './useAuth';
