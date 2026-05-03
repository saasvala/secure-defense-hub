import { useState } from 'react';
import { store, genId, type User } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Users, Plus, RotateCcw, Power, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(store.getUsers());
  const roles = store.getRoles();
  const [showForm, setShowForm] = useState(false);
  const defaultRole = roles.find(r => r.name !== 'Super Admin')?.id || '';
  const [form, setForm] = useState({ username: '', password: '', role_id: defaultRole });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = () => setUsers(store.getUsers());

  const addUser = () => {
    if (!form.username.trim() || !form.password.trim() || !form.role_id) {
      toast.error('All fields are required'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (store.getUsers().some(u => u.username === form.username.trim())) {
      toast.error('Username already exists'); return;
    }
    const newUser: User = {
      id: genId(), role_id: form.role_id,
      username: form.username.trim(), password: form.password, status: 'active',
    };
    store.setUsers([...store.getUsers(), newUser]);
    store.addAudit({ user_id: currentUser?.id || 'admin', action: 'USER_CREATED', details: `Created user: ${newUser.username}` });
    toast.success(`User "${newUser.username}" created`);
    setForm({ username: '', password: '', role_id: defaultRole });
    setShowForm(false);
    refresh();
  };

  const resetUser = (id: string) => {
    const updated = store.getUsers().map(u => u.id === id ? { ...u, password: 'reset123!', status: 'active' as const } : u);
    store.setUsers(updated);
    store.addAudit({ user_id: currentUser?.id || 'admin', action: 'USER_RESET', details: `Reset user ID: ${id}` });
    toast.success('Password reset to: reset123!');
    refresh();
  };

  const toggleStatus = (id: string) => {
    const updated = store.getUsers().map(u =>
      u.id === id ? { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : u
    );
    store.setUsers(updated);
    store.addAudit({ user_id: currentUser?.id || 'admin', action: 'USER_STATUS_TOGGLED', details: `User ID: ${id}` });
    toast.success('User status updated');
    refresh();
  };

  const deleteUser = () => {
    if (!deleteId) return;
    if (deleteId === currentUser?.id) {
      toast.error('Cannot delete the active session user'); setDeleteId(null); return;
    }
    const target = users.find(u => u.id === deleteId);
    store.setUsers(store.getUsers().filter(u => u.id !== deleteId));
    store.addAudit({ user_id: currentUser?.id || 'admin', action: 'USER_DELETED', details: `Deleted: ${target?.username}` });
    toast.success(`User "${target?.username}" deleted`);
    setDeleteId(null);
    refresh();
  };

  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown';

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered users`}
        icon={Users}
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add User
          </button>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Add User Form */}
        {showForm && (
          <div className="bg-card border border-primary/20 rounded p-4 glow-amber">
            <h3 className="text-xs font-tactical text-primary mb-4">New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="bg-input border border-border rounded px-3 py-2 text-sm font-tactical text-foreground focus:outline-none focus:border-primary"
              />
              <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="bg-input border border-border rounded px-3 py-2 text-sm font-tactical text-foreground focus:outline-none focus:border-primary"
              />
              <select
                value={form.role_id}
                onChange={e => setForm({ ...form, role_id: e.target.value })}
                className="bg-input border border-border rounded px-3 py-2 text-sm font-tactical text-foreground focus:outline-none focus:border-primary"
              >
                {roles.filter(r => r.name !== 'Super Admin').map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <button onClick={addUser} className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
              [ CREATE USER ]
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Username</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-tactical text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-tactical text-foreground">{u.username}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{getRoleName(u.role_id)}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => resetUser(u.id)} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Reset password">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleStatus(u.id)} className="p-1.5 rounded text-muted-foreground hover:text-tactical-amber hover:bg-tactical-amber/10 transition-colors" title="Toggle active">
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(u.id)}
                          disabled={u.id === currentUser?.id}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={u.id === currentUser?.id ? 'Cannot delete current session' : 'Delete user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="p-0">
                    <EmptyState icon={Users} title="NO USERS" message="No personnel registered yet. Use Add User to create the first account." />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="DELETE USER"
        message="This will permanently remove the user account. Action is logged."
        destructive confirmLabel="DELETE"
        onConfirm={deleteUser}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
