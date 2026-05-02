import { useState } from 'react';
import { store, genId, type FieldTest } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { can } from '@/lib/permissions';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import CrudModal, { type FieldDef } from '@/components/CrudModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { FlaskConical, CheckCircle2, XCircle, Clock, AlertTriangle, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';

const VALIDATION_STATES: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  success: { icon: CheckCircle2, label: 'VALIDATED', color: 'text-tactical-green' },
  partial: { icon: AlertTriangle, label: 'PARTIAL PASS', color: 'text-tactical-amber' },
  failure: { icon: XCircle, label: 'FAILED', color: 'text-destructive' },
  pending: { icon: Clock, label: 'AWAITING VALIDATION', color: 'text-muted-foreground' },
};

export default function FieldTests() {
  const { currentRole, currentUser } = useAuth();
  const [tests, setTests] = useState(store.getFieldTests());
  const projects = store.getProjects();

  const [modal, setModal] = useState<{ open: boolean; editing?: FieldTest }>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const canCreate = can(currentRole?.name, 'field-tests', 'create');
  const canUpdate = can(currentRole?.name, 'field-tests', 'update');
  const canDelete = can(currentRole?.name, 'field-tests', 'delete');

  const fields: FieldDef[] = [
    { key: 'project_id', label: 'Parent Project', type: 'select', required: true,
      options: projects.map(p => ({ value: p.id, label: p.code_name })) },
    { key: 'location', label: 'Test Location', required: true, placeholder: 'e.g. Site Alpha - Desert Range' },
    { key: 'date', label: 'Test Date', type: 'date', required: true },
    { key: 'outcome', label: 'Outcome', type: 'select', required: true, options: [
      { value: 'pending', label: 'Pending' }, { value: 'success', label: 'Success' },
      { value: 'partial', label: 'Partial' }, { value: 'failure', label: 'Failure' },
    ]},
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const refresh = () => setTests(store.getFieldTests());

  const save = (vals: Partial<FieldTest>) => {
    const all = store.getFieldTests();
    if (modal.editing) {
      store.setFieldTests(all.map(t => t.id === modal.editing!.id ? { ...t, ...vals } as FieldTest : t));
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'FIELD_TEST_UPDATED', details: `Location: ${vals.location}` });
      toast.success('Field test updated');
    } else {
      const nt: FieldTest = {
        id: genId(),
        project_id: vals.project_id!,
        location: vals.location!,
        date: vals.date || new Date().toISOString().slice(0, 10),
        outcome: vals.outcome as FieldTest['outcome'],
        notes: vals.notes || '',
      };
      store.setFieldTests([nt, ...all]);
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'FIELD_TEST_CREATED', details: `Location: ${nt.location}` });
      toast.success('Field test logged');
    }
    setModal({ open: false });
    refresh();
  };

  const del = () => {
    if (!confirmId) return;
    store.setFieldTests(store.getFieldTests().filter(t => t.id !== confirmId));
    store.addAudit({ user_id: currentUser?.id || 'system', action: 'FIELD_TEST_DELETED', details: `ID: ${confirmId}` });
    toast.success('Field test deleted');
    setConfirmId(null);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Field Trials & Testing"
        subtitle={`${tests.length} tests logged`}
        icon={FlaskConical}
        actions={canCreate && (
          <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
            <Plus className="w-3 h-3" /> Log Test
          </button>
        )}
      />
      <div className="p-4 sm:p-6 space-y-4">
        {tests.length === 0 && (
          <EmptyState icon={FlaskConical} title="NO FIELD TESTS" message="No field trials logged yet." />
        )}
        {tests.map(t => {
          const project = projects.find(p => p.id === t.project_id);
          const validation = VALIDATION_STATES[t.outcome] || VALIDATION_STATES.pending;
          const ValIcon = validation.icon;

          return (
            <div key={t.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <FlaskConical className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-tactical text-primary truncate">{project?.code_name || '—'}</span>
                  <StatusBadge status={t.outcome} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ImmutableBadge state="immutable" />
                  <span className="text-[10px] text-muted-foreground">{t.date}</span>
                  {canUpdate && (
                    <button onClick={() => setModal({ open: true, editing: t })} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => setConfirmId(t.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-tactical-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-tactical text-muted-foreground">Location</p>
                    <p className="text-xs text-foreground">{t.location}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-tactical text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs text-foreground/70">{t.notes}</p>
                </div>

                <div className="flex items-center justify-end">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded border ${
                    t.outcome === 'success' ? 'bg-tactical-green/5 border-tactical-green/20' :
                    t.outcome === 'failure' ? 'bg-destructive/5 border-destructive/20' :
                    t.outcome === 'partial' ? 'bg-tactical-amber/5 border-tactical-amber/20' :
                    'bg-secondary/20 border-border'
                  }`}>
                    <ValIcon className={`w-4 h-4 ${validation.color}`} />
                    <span className={`text-[10px] font-tactical ${validation.color}`}>{validation.label}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CrudModal
        open={modal.open}
        title={modal.editing ? 'EDIT FIELD TEST' : 'NEW FIELD TEST'}
        fields={fields}
        initial={modal.editing}
        onClose={() => setModal({ open: false })}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="DELETE FIELD TEST"
        message="This test record will be permanently removed."
        destructive confirmLabel="DELETE"
        onConfirm={del}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
