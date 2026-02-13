import { useState } from 'react';
import { store, genId, type User } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Users, Plus, RotateCcw, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState(store.getUsers());
  const roles = store.getRoles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role_id: roles[1]?.id || '' });

  const refresh = () => setUsers(store.getUsers());

  const addUser = () => {
    if (!form.username || !form.password || !form.role_id) return;
    const newUser: User = {
      id: genId(),
      role_id: form.role_id,
      username: form.username,
      password: form.password,
      status: 'active',
    };
    const updated = [...store.getUsers(), newUser];
    store.setUsers(updated);
    store.addAudit({ user_id: 'admin', action: 'USER_CREATED', details: `Created user: ${form.username}` });
    setForm({ username: '', password: '', role_id: roles[1]?.id || '' });
    setShowForm(false);
    refresh();
  };

  const resetUser = (id: string) => {
    const updated = store.getUsers().map(u => u.id === id ? { ...u, password: 'reset123!', status: 'active' as const } : u);
    store.setUsers(updated);
    store.addAudit({ user_id: 'admin', action: 'USER_RESET', details: `Reset user ID: ${id}` });
    refresh();
  };

  const toggleStatus = (id: string) => {
    const updated = store.getUsers().map(u =>
      u.id === id ? { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : u
    );
    store.setUsers(updated);
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

      <div className="p-6 space-y-4">
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
          <table className="w-full">
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
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => resetUser(u.id)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Reset">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button onClick={() => toggleStatus(u.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Toggle Status">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
