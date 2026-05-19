import { store } from '@/lib/store';

const TACTICAL_OPS = [
  { code: 'OPERATION SHADOW',  progress: 82, tag: 'BLACK-OPS',  tone: 'red' as const },
  { code: 'NIGHTFALL-X',       progress: 47, tag: 'RECON',      tone: 'blue' as const },
  { code: 'EAGLE CORE',        progress: 64, tag: 'AIR-CMD',    tone: 'amber' as const },
  { code: 'PHANTOM GRID',      progress: 91, tag: 'CYBER-DEF',  tone: 'green' as const },
];

const TONE: Record<'red'|'blue'|'amber'|'green', string> = {
  red: 'text-tactical-red',
  blue: 'text-tactical-blue',
  amber: 'text-tactical-amber',
  green: 'text-tactical-green',
};

export default function MissionTimeline() {
  const projects = store.getProjects();
  const programs = store.getPrograms();

  const stages = ['planning', 'in_progress', 'testing', 'completed'];
  const stageLabels: Record<string, string> = {
    planning: 'PLAN',
    in_progress: 'DEV',
    testing: 'TEST',
    completed: 'DONE',
  };
  const stageColors: Record<string, string> = {
    planning: 'bg-muted-foreground',
    in_progress: 'bg-tactical-blue',
    testing: 'bg-tactical-amber',
    completed: 'bg-tactical-green',
  };

  return (
    <div className="glass holo-border rounded">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <span className="text-xs font-tactical text-tactical-blue tracking-widest">// Mission Timeline</span>
        <span className="text-[9px] font-tactical text-muted-foreground">{projects.length} OPS</span>
        </div>

        {/* Tactical named operations */}
        <div className="space-y-2.5 pb-3 mb-1 border-b border-border/40">
          {TACTICAL_OPS.map(op => (
            <div key={op.code}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-tactical tracking-widest ${TONE[op.tone]}`}>◆ {op.code}</span>
                <span className="text-[9px] font-tactical text-muted-foreground">{op.tag} • {op.progress}%</span>
              </div>
              <div className="h-2 bg-secondary/60 rounded-sm overflow-hidden border border-border/40 relative">
                <div className="h-full rounded-sm progress-glow transition-all" style={{ width: `${op.progress}%` }} />
              </div>
            </div>
          ))}
        </div>


      <div className="p-4 space-y-3.5">
        <div className="flex items-center gap-1 mb-2">
          {stages.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={`h-1 flex-1 rounded ${stageColors[s]}/30`} />
              <span className="text-[9px] font-tactical text-muted-foreground">{stageLabels[s]}</span>
              {i < stages.length - 1 && <div className="w-2 h-px bg-border" />}
            </div>
          ))}
        </div>

        {projects.slice(0, 6).map(proj => {
          const prog = programs.find(p => p.id === proj.program_id);
          const stageIdx = stages.indexOf(proj.status);
          const progress = stageIdx >= 0 ? ((stageIdx + 1) / stages.length) * 100 : 10;

          return (
            <div key={proj.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-tactical text-foreground tracking-wider">▸ {proj.code_name}</span>
                <span className="text-[9px] text-muted-foreground truncate max-w-[140px]">{prog?.name?.slice(0, 20)}</span>
              </div>
              <div className="h-2 bg-secondary/60 rounded-sm overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-sm transition-all progress-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
