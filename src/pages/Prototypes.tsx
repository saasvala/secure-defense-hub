import { useState } from 'react';
import { store, genId, type Prototype } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { can } from '@/lib/permissions';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import CrudModal, { type FieldDef } from '@/components/CrudModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { Cpu, GitCommit, ArrowDown, Plus, Pencil, Trash2 } from 'lucide-react';

export default function Prototypes() {
  const { currentRole, currentUser } = useAuth();
  const [prototypes, setPrototypes] = useState(store.getPrototypes());
  const projects = store.getProjects();

  const [modal, setModal] = useState<{ open: boolean; editing?: Prototype }>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const canCreate = can(currentRole?.name, 'prototypes', 'create');
  const canUpdate = can(currentRole?.name, 'prototypes', 'update');
  const canDelete = can(currentRole?.name, 'prototypes', 'delete');

  const fields: FieldDef[] = [
    { key: 'project_id', label: 'Parent Project', type: 'select', required: true,
      options: projects.map(p => ({ value: p.id, label: p.code_name })) },
    { key: 'version', label: 'Version', required: true, placeholder: 'e.g. v1.0-alpha' },
    { key: 'result', label: 'Result', type: 'select', required: true, options: [
      { value: 'pending', label: 'Pending' }, { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' }, { value: 'review', label: 'Review' },
    ]},
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const byProject: Record<string, typeof prototypes> = {};
  prototypes.forEach(p => { (byProject[p.project_id] ||= []).push(p); });

  const refresh = () => setPrototypes(store.getPrototypes());

  const save = (vals: Partial<Prototype>) => {
    const all = store.getPrototypes();
    if (modal.editing) {
      store.setPrototypes(all.map(p => p.id === modal.editing!.id ? { ...p, ...vals } as Prototype : p));
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROTOTYPE_UPDATED', details: `Version: ${vals.version}` });
      toast.success(`Prototype ${vals.version} updated`);
    } else {
      const np: Prototype = {
        id: genId(),
        project_id: vals.project_id!,
        version: vals.version!,
        result: vals.result as Prototype['result'],
        notes: vals.notes || '',
        created_at: new Date().toISOString().slice(0, 10),
      };
      store.setPrototypes([...all, np]);
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROTOTYPE_CREATED', details: `Version: ${np.version}` });
      toast.success(`Prototype ${np.version} created`);
    }
    setModal({ open: false });
    refresh();
  };

  const del = () => {
    if (!confirmId) return;
    const target = prototypes.find(p => p.id === confirmId);
    store.setPrototypes(store.getPrototypes().filter(p => p.id !== confirmId));
    store.addAudit({ user_id: currentUser?.id || 'system', action: 'PROTOTYPE_DELETED', details: `Version: ${target?.version}` });
    toast.success(`Prototype ${target?.version} deleted`);
    setConfirmId(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Prototype Development"
        subtitle={`${prototypes.length} prototypes tracked`}
        icon={Cpu}
        actions={canCreate && (
          <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
            <Plus className="w-3 h-3" /> New Prototype
          </button>
        )}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {prototypes.length === 0 && (
          <EmptyState icon={Cpu} title="NO PROTOTYPES" message="No prototype versions tracked yet." />
        )}
        {Object.entries(byProject).map(([projId, protos]) => {
          const project = projects.find(p => p.id === projId);
          return (
            <div key={projId} className="bg-card border border-border rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-xs font-tactical text-primary">{project?.code_name || '—'}</span>
                  <span className="text-[10px] text-muted-foreground">• {protos.length} versions</span>
                </div>
                <ImmutableBadge state="versioned" label={`${protos.length} REVISIONS`} />
              </div>

              <div className="p-4">
                <div className="relative">
                  {protos.map((proto, idx) => (
                    <div key={proto.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          proto.result === 'pass' ? 'border-tactical-green bg-tactical-green/10' :
                          proto.result === 'fail' ? 'border-destructive bg-destructive/10' :
                          proto.result === 'review' ? 'border-tactical-amber bg-tactical-amber/10' :
                          'border-muted-foreground/30 bg-secondary/20'
                        }`}>
                          <GitCommit className={`w-3 h-3 ${
                            proto.result === 'pass' ? 'text-tactical-green' :
                            proto.result === 'fail' ? 'text-destructive' :
                            proto.result === 'review' ? 'text-tactical-amber' :
                            'text-muted-foreground'
                          }`} />
                        </div>
                        {idx < protos.length - 1 && (
                          <div className="w-px h-8 bg-border flex items-center justify-center">
                            <ArrowDown className="w-2.5 h-2.5 text-muted-foreground/30 absolute" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-tactical text-foreground">{proto.version}</span>
                          <StatusBadge status={proto.result} />
                          <ImmutableBadge state={proto.result === 'pass' ? 'verified' : 'immutable'} />
                          <div className="ml-auto flex items-center gap-1">
                            {canUpdate && (
                              <button onClick={() => setModal({ open: true, editing: proto })} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => setConfirmId(proto.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-foreground/60">{proto.notes}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{proto.created_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CrudModal
        open={modal.open}
        title={modal.editing ? 'EDIT PROTOTYPE' : 'NEW PROTOTYPE'}
        fields={fields}
        initial={modal.editing}
        onClose={() => setModal({ open: false })}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="DELETE PROTOTYPE"
        message="This version will be permanently removed from the lineage."
        destructive confirmLabel="DELETE"
        onConfirm={del}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
