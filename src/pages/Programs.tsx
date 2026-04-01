import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import { FolderKanban, ChevronRight, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

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

export default function Programs() {
  const programs = store.getPrograms();

  return (
    <div>
      <PageHeader title="Defense Programs" subtitle={`${programs.length} registered programs`} icon={FolderKanban} />
      <div className="p-6 space-y-4">
        {programs.map(p => {
          const stageIdx = getStageIndex(p.status);
          return (
            <div key={p.id} className="bg-card border border-border rounded overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  <span className="text-xs font-tactical text-foreground">{p.name}</span>
                  <StatusBadge status={p.classification} />
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-2">
                  <ImmutableBadge state="versioned" />
                  <span className="text-[10px] text-muted-foreground">{p.created_at}</span>
                </div>
              </div>

              {/* Stage Gates */}
              <div className="px-4 py-3 bg-secondary/10">
                <div className="flex items-center gap-1">
                  {STAGE_GATES.map((gate, i) => (
                    <div key={gate.key} className="flex items-center gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/30">
                        <StageIcon passed={i < stageIdx} current={i === stageIdx} />
                        <span className={`text-[9px] font-tactical ${i <= stageIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
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

              {/* Approval indicator */}
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
    </div>
  );
}
