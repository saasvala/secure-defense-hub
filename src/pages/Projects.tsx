import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import { FileSearch, GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';

const RISK_LEVELS: Record<string, { label: string; color: string }> = {
  planning: { label: 'LOW', color: 'text-tactical-green' },
  in_progress: { label: 'MEDIUM', color: 'text-tactical-amber' },
  testing: { label: 'HIGH', color: 'text-tactical-red' },
  completed: { label: 'NONE', color: 'text-tactical-green' },
  cancelled: { label: 'CRITICAL', color: 'text-destructive' },
};

export default function Projects() {
  const projects = store.getProjects();
  const programs = store.getPrograms();
  const prototypes = store.getPrototypes();
  const fieldTests = store.getFieldTests();

  return (
    <div>
      <PageHeader title="Classified Projects" subtitle={`${projects.length} projects registered`} icon={FileSearch} />
      <div className="p-4 sm:p-6 space-y-4">
        {projects.length === 0 && (
          <EmptyState icon={FileSearch} title="NO PROJECTS" message="No classified projects registered yet." />
        )}
        {projects.map(p => {
          const prog = programs.find(pr => pr.id === p.program_id);
          const protos = prototypes.filter(pt => pt.project_id === p.id);
          const tests = fieldTests.filter(t => t.project_id === p.id);
          const risk = RISK_LEVELS[p.status] || RISK_LEVELS.planning;
          const deps = projects.filter(pr => pr.program_id === p.program_id && pr.id !== p.id);

          return (
            <div key={p.id} className="bg-card border border-border rounded overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <FileSearch className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-tactical text-primary truncate">{p.code_name}</span>
                  <StatusBadge status={p.status} />
                  <ImmutableBadge state="versioned" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-tactical ${risk.color}`}>RISK: {risk.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{prog?.name}</span>
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Info */}
                <div>
                  <p className="text-[10px] font-tactical text-muted-foreground mb-1">Description</p>
                  <p className="text-xs text-foreground/70">{p.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Created: {p.created_at}</p>
                </div>

                {/* Dependencies */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <GitBranch className="w-3 h-3 text-tactical-blue" />
                    <p className="text-[10px] font-tactical text-muted-foreground">Dependencies ({deps.length})</p>
                  </div>
                  {deps.length > 0 ? deps.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center gap-1 mb-1">
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/50" />
                      <span className="text-[10px] font-tactical text-foreground/60">{d.code_name}</span>
                      <StatusBadge status={d.status} />
                    </div>
                  )) : (
                    <span className="text-[10px] text-muted-foreground/50">No dependencies</span>
                  )}
                </div>

                {/* Linked data */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/20 rounded">
                    <span className="text-[10px] font-tactical text-muted-foreground">Prototypes</span>
                    <span className="text-[10px] font-tactical text-foreground">{protos.length}</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/20 rounded">
                    <span className="text-[10px] font-tactical text-muted-foreground">Field Tests</span>
                    <span className="text-[10px] font-tactical text-foreground">{tests.length}</span>
                  </div>
                  {risk.label === 'CRITICAL' && (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-destructive/10 rounded border border-destructive/20">
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                      <span className="text-[10px] font-tactical text-destructive">Critical risk — review required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
