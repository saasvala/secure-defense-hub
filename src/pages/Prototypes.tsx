import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import { Cpu, GitCommit, ArrowDown } from 'lucide-react';

export default function Prototypes() {
  const prototypes = store.getPrototypes();
  const projects = store.getProjects();

  // Group by project for version lineage
  const byProject: Record<string, typeof prototypes> = {};
  prototypes.forEach(p => {
    if (!byProject[p.project_id]) byProject[p.project_id] = [];
    byProject[p.project_id].push(p);
  });

  return (
    <div>
      <PageHeader title="Prototype Development" subtitle={`${prototypes.length} prototypes tracked`} icon={Cpu} />
      <div className="p-6 space-y-6">
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

              {/* Version Lineage Tree */}
              <div className="p-4">
                <div className="relative">
                  {protos.map((proto, idx) => (
                    <div key={proto.id} className="flex items-start gap-4">
                      {/* Tree connector */}
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

                      {/* Version info */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-tactical text-foreground">{proto.version}</span>
                          <StatusBadge status={proto.result} />
                          <ImmutableBadge state={proto.result === 'pass' ? 'verified' : 'immutable'} />
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
    </div>
  );
}
