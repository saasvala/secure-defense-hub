import { useState } from 'react';
import { store, genId, type Clearance } from '@/lib/store';
import { useAuth } from '@/context/useAuth';
import { can } from '@/lib/permissions';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ClearanceMatrix from '@/components/ClearanceMatrix';
import ImmutableBadge from '@/components/ImmutableBadge';
import CrudModal, { type FieldDef } from '@/components/CrudModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import { KeyRound, Shield, Plus, Pencil, Trash2 } from 'lucide-react';

export default function ClearanceRecords() {
  const { currentRole, currentUser } = useAuth();
  const [clearances, setClearances] = useState(store.getClearances());
  const users = store.getUsers();
  const roles = store.getRoles();

  const [modal, setModal] = useState<{ open: boolean; editing?: Clearance }>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const canCreate = can(currentRole?.name, 'clearance', 'create');
  const canUpdate = can(currentRole?.name, 'clearance', 'update');
  const canDelete = can(currentRole?.name, 'clearance', 'delete');

  const fields: FieldDef[] = [
    { key: 'user_id', label: 'Personnel', type: 'select', required: true,
      options: users.map(u => ({ value: u.id, label: u.username })) },
    { key: 'level', label: 'Clearance Level', type: 'select', required: true, options: [
      { value: 'TOP SECRET', label: 'TOP SECRET' },
      { value: 'SECRET', label: 'SECRET' },
      { value: 'CONFIDENTIAL', label: 'CONFIDENTIAL' },
      { value: 'UNCLASSIFIED', label: 'UNCLASSIFIED' },
    ]},
    { key: 'expiry', label: 'Expiry Date', type: 'date', required: true },
  ];

  const refresh = () => setClearances(store.getClearances());

  const save = (vals: Partial<Clearance>) => {
    const all = store.getClearances();
    if (modal.editing) {
      store.setClearances(all.map(c => c.id === modal.editing!.id ? { ...c, ...vals } as Clearance : c));
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'CLEARANCE_UPDATED', details: `Level: ${vals.level}` });
      toast.success('Clearance updated');
    } else {
      const nc: Clearance = {
        id: genId(),
        user_id: vals.user_id!,
        level: vals.level as Clearance['level'],
        expiry: vals.expiry!,
      };
      store.setClearances([nc, ...all]);
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'CLEARANCE_GRANTED', details: `Level: ${nc.level}` });
      toast.success('Clearance granted');
    }
    setModal({ open: false });
    refresh();
  };

  const del = () => {
    if (!confirmId) return;
    store.setClearances(store.getClearances().filter(c => c.id !== confirmId));
    store.addAudit({ user_id: currentUser?.id || 'system', action: 'CLEARANCE_REVOKED', details: `ID: ${confirmId}` });
    toast.success('Clearance revoked');
    setConfirmId(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Security Clearance Records"
        subtitle={`${clearances.length} records`}
        icon={KeyRound}
        actions={canCreate && (
          <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
            <Plus className="w-3 h-3" /> Grant Clearance
          </button>
        )}
      />
      <div className="p-4 sm:p-6 space-y-6">
        <ClearanceMatrix />

        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical text-muted-foreground">Personnel Clearance Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Personnel</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Level</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Expiry</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">State</th>
                  {(canUpdate || canDelete) && <th className="px-4 py-3 text-right text-[10px] font-tactical text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {clearances.map(c => {
                  const user = users.find(u => u.id === c.user_id);
                  const role = roles.find(r => r.id === user?.role_id);
                  const daysLeft = Math.ceil((new Date(c.expiry).getTime() - Date.now()) / 86400000);
                  const expiring = daysLeft < 90 && daysLeft > 0;

                  return (
                    <tr key={c.id} className={`border-b border-border/50 hover:bg-secondary/20 ${expiring ? 'bg-tactical-amber/5' : ''}`}>
                      <td className="px-4 py-3 text-xs font-tactical text-foreground">{user?.username || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{role?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.level} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.expiry}
                        {expiring && <span className="ml-2 text-tactical-amber text-[9px] font-tactical">({daysLeft}d)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <ImmutableBadge state={expiring ? 'immutable' : 'verified'} label={expiring ? 'EXPIRING' : 'VALID'} />
                      </td>
                      {(canUpdate || canDelete) && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canUpdate && (
                              <button onClick={() => setModal({ open: true, editing: c })} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => setConfirmId(c.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {clearances.length === 0 && (
                  <tr><td colSpan={6} className="p-0">
                    <EmptyState icon={KeyRound} title="NO CLEARANCES" message="No personnel clearance records on file." />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CrudModal
        open={modal.open}
        title={modal.editing ? 'EDIT CLEARANCE' : 'GRANT CLEARANCE'}
        fields={fields}
        initial={modal.editing}
        onClose={() => setModal({ open: false })}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="REVOKE CLEARANCE"
        message="Personnel access will be immediately revoked."
        destructive confirmLabel="REVOKE"
        onConfirm={del}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
