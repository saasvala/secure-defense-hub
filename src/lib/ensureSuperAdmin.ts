import { store, genId } from './store';
import { seedData } from './seed';

export const DEFAULT_SUPER_ADMIN = {
  username: 'Softwarevala@admim.com',
  password: 'softwarevala#123456',
};

/**
 * Boot-time integrity check: confirms the seeded Super Admin account exists
 * in storage. If missing (or corrupted), reseeds it automatically so login
 * can never fail due to absent default credentials.
 *
 * Returns true if the account was already present, false if it had to be
 * (re)created.
 */
export function ensureSuperAdminExists(): boolean {
  // Make sure roles + base seed have run at least once.
  seedData();

  const roles = store.getRoles();
  const superAdminRole = roles.find(r => r.name === 'Super Admin');
  if (!superAdminRole) {
    // Roles missing entirely — force a full reseed.
    seedData();
  }

  const role = store.getRoles().find(r => r.name === 'Super Admin');
  if (!role) return false;

  const users = store.getUsers();
  const existing = users.find(u => u.username === DEFAULT_SUPER_ADMIN.username);

  if (existing && existing.password === DEFAULT_SUPER_ADMIN.password && existing.status === 'active' && existing.role_id === role.id) {
    return true;
  }

  // Repair or recreate.
  const repaired = users.filter(u => u.username !== DEFAULT_SUPER_ADMIN.username);
  repaired.unshift({
    id: existing?.id ?? genId(),
    role_id: role.id,
    username: DEFAULT_SUPER_ADMIN.username,
    password: DEFAULT_SUPER_ADMIN.password,
    status: 'active',
  });
  store.setUsers(repaired);
  store.setSetupComplete(true);
  return false;
}
