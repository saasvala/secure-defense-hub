import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import { FlaskConical, CheckCircle2, XCircle, Clock, AlertTriangle, MapPin } from 'lucide-react';

const VALIDATION_STATES: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  success: { icon: CheckCircle2, label: 'VALIDATED', color: 'text-tactical-green' },
  partial: { icon: AlertTriangle, label: 'PARTIAL PASS', color: 'text-tactical-amber' },
  failure: { icon: XCircle, label: 'FAILED', color: 'text-destructive' },
  pending: { icon: Clock, label: 'AWAITING VALIDATION', color: 'text-muted-foreground' },
};

export default function FieldTests() {
  const tests = store.getFieldTests();
  const projects = store.getProjects();

  return (
    <div>
      <PageHeader title="Field Trials & Testing" subtitle={`${tests.length} tests logged`} icon={FlaskConical} />
      <div className="p-6 space-y-4">
        {tests.map(t => {
          const project = projects.find(p => p.id === t.project_id);
          const validation = VALIDATION_STATES[t.outcome] || VALIDATION_STATES.pending;
          const ValIcon = validation.icon;

          return (
            <div key={t.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="text-xs font-tactical text-primary">{project?.code_name || '—'}</span>
                  <StatusBadge status={t.outcome} />
                </div>
                <div className="flex items-center gap-2">
                  <ImmutableBadge state="immutable" />
                  <span className="text-[10px] text-muted-foreground">{t.date}</span>
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-tactical-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-tactical text-muted-foreground">Location</p>
                    <p className="text-xs text-foreground">{t.location}</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[10px] font-tactical text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs text-foreground/70">{t.notes}</p>
                </div>

                {/* Validation State */}
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
    </div>
  );
}
