import { store } from '@/lib/store';

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
    <div className="bg-card border border-border rounded">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-tactical text-muted-foreground">Mission Timeline</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Stage headers */}
        <div className="flex items-center gap-1 mb-2">
          {stages.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={`h-1 flex-1 rounded ${stageColors[s]}/30`} />
              <span className="text-[9px] font-tactical text-muted-foreground">{stageLabels[s]}</span>
              {i < stages.length - 1 && <div className="w-2 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Projects on timeline */}
        {projects.slice(0, 6).map(proj => {
          const prog = programs.find(p => p.id === proj.program_id);
          const stageIdx = stages.indexOf(proj.status);
          const progress = stageIdx >= 0 ? ((stageIdx + 1) / stages.length) * 100 : 10;

          return (
            <div key={proj.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-tactical text-foreground">{proj.code_name}</span>
                <span className="text-[9px] text-muted-foreground">{prog?.name?.slice(0, 20)}</span>
              </div>
              <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all ${stageColors[proj.status] || 'bg-muted-foreground'}`}
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
