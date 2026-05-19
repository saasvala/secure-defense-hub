import { createContext } from 'react';
import type { User, Role } from '@/lib/store';

export type AppState = 'license' | 'setup' | 'login' | 'app';

export interface AuthContextType {
  appState: AppState;
  currentUser: User | null;
  currentRole: Role | null;
  realRole: Role | null;
  impersonatedRoleName: string | null;
  switchRole: (roleName: string | null) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  activateLicense: (key: string) => boolean;
  completeSetup: (username: string, password: string) => void;
  isLicensed: boolean;
  isSuperAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
