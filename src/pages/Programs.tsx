import { useState } from 'react';
import { store, genId, type Program } from '@/lib/store';
import { useAuth } from '@/context/useAuth';
import { can } from '@/lib/permissions';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import CrudModal, { type FieldDef } from '@/components/CrudModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { FolderKanban, ChevronRight, CheckCircle2, Clock, XCircle, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';

const STAGE_GATES = [
  { name: 'Proposal', key: 'proposal' },
  { name: 'Review', key: 'review' },
  { name: 'Approved', key: 'approved' },
  { name: 'Active', key: 'active' },
  { name: 'Complete', key: 'complete' },
];

function getStageIndex(status: string) {
  if (status === 'active') return 3;
  if (status === 'completed') return 4;
  if (status === 'suspended') return 2;
  if (status === 'archived') return 4;
  return 1;
}

const StageIcon = ({ passed, current }: { passed: boolean; current: boolean }) => {
  if (passed) return <CheckCircle2 className="w-3.5 h-3.5 text-tactical-green" />;
  if (current) return <Clock className="w-3.5 h-3.5 text-tactical-amber animate-pulse-amber" />;
  return <XCircle className="w-3.5 h-3.5 text-muted-foreground/30" />;
};

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Program Name', required: true, placeholder: 'e.g. Project AEGIS Shield' },
  { key: 'classification', label: 'Classification', type: 'select', required: true, options: [
    { value: 'TOP SECRET', label: 'TOP SECRET' },
    { value: 'SECRET', label: 'SECRET' },
    { value: 'CONFIDENTIAL', label: 'CONFIDENTIAL' },
    { value: 'UNCLASSIFIED', label: 'UNCLASSIFIED' },
  ]},
  { key: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' },
    { value: 'completed', label: 'Completed' }, { value: 'archived', label: 'Archived' },
  ]},
];

export default function Programs() {
  const { currentRole, currentUser } = useAuth();
  const [programs, setPrograms] = useState(store.getPrograms());
  const [modal, setModal] = useState<{ open: boolean; editing?: Program }>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const canCreate = can(currentRole?.name, 'programs', 'create');
  const canUpdate = can(currentRole?.name, 'programs', 'update');
  const canDelete = can(currentRole?.name, 'programs', 'delete');

  const refresh = () => setPrograms(store.getPrograms());

  const save = (vals: Partial<Program>) => {
    const all = store.getPrograms();
    if (modal.editing) {
      const updated = all.map(p => p.id === modal.editing!.id ? { ...p, ...vals } as Program : p);
      store.setPrograms(updated);
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROGRAM_UPDATED', details: `Program: ${vals.name}` });
      toast.success(`Program "${vals.name}" updated`);
    } else {
      const np: Program = {
        id: genId(),
        name: vals.name!,
        classification: vals.classification as Program['classification'],
        status: vals.status as Program['status'],
        created_by: currentUser?.id || 'system',
        created_at: new Date().toISOString().slice(0, 10),
      };
      store.setPrograms([np, ...all]);
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROGRAM_CREATED', details: `Program: ${np.name}` });
      toast.success(`Program "${np.name}" created`);
    }
    setModal({ open: false });
    refresh();
  };

  const del = () => {
    if (!confirmId) return;
    const target = programs.find(p => p.id === confirmId);
    store.setPrograms(store.getPrograms().filter(p => p.id !== confirmId));
    store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROGRAM_DELETED', details: `Program: ${target?.name}` });
    toast.success(`Program "${target?.name}" deleted`);
    setConfirmId(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Defense Programs"
        subtitle={`${programs.length} registered programs`}
        icon={FolderKanban}
        actions={canCreate && (
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90"
          >
            <Plus className="w-3 h-3" /> New Program
          </button>
        )}
      />
      <div className="p-4 sm:p-6 space-y-4">
        {programs.length === 0 && (
          <EmptyState icon={FolderKanban} title="NO PROGRAMS" message="No defense programs registered yet." />
        )}
        {programs.map(p => {
          const stageIdx = getStageIndex(p.status);
          return (
            <div key={p.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <FolderKanban className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-tactical text-foreground truncate">{p.name}</span>
                  <StatusBadge status={p.classification} />
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ImmutableBadge state="versioned" />
                  <span className="text-[10px] text-muted-foreground">{p.created_at}</span>
                  {canUpdate && (
                    <button onClick={() => setModal({ open: true, editing: p })} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => setConfirmId(p.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 bg-secondary/10 overflow-x-auto">
                <div className="flex items-center gap-1 flex-wrap">
                  {STAGE_GATES.map((gate, i) => (
                    <div key={gate.key} className="flex items-center gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/30">
                        <StageIcon passed={i < stageIdx} current={i === stageIdx} />
                        <span className={`text-[9px] font-tactical whitespace-nowrap ${i <= stageIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {gate.name}
                        </span>
                      </div>
                      {i < STAGE_GATES.length - 1 && (
                        <ChevronRight className={`w-3 h-3 ${i < stageIdx ? 'text-tactical-green' : 'text-muted-foreground/20'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {p.status === 'suspended' && (
                <div className="px-4 py-2 bg-destructive/5 border-t border-destructive/10 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  <span className="text-[10px] font-tactical text-destructive">Program suspended — approval required to resume</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CrudModal
        open={modal.open}
        title={modal.editing ? 'EDIT PROGRAM' : 'NEW PROGRAM'}
        fields={FIELDS}
        initial={modal.editing}
        onClose={() => setModal({ open: false })}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="DELETE PROGRAM"
        message="This action is irreversible and will be logged in the audit trail."
        destructive
        confirmLabel="DELETE"
        onConfirm={del}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
