import { store } from '@/lib/store';
import { Circle } from 'lucide-react';

export default function StatusBoard() {
  const programs = store.getPrograms();
  const projects = store.getProjects();
  const assets = store.getAssets();
  const prototypes = store.getPrototypes();
  const fieldTests = store.getFieldTests();

  const systemStatus = [
    {
      system: 'Programs',
      active: programs.filter(p => p.status === 'active').length,
      total: programs.length,
      status: programs.some(p => p.status === 'suspended') ? 'amber' : 'green',
    },
    {
      system: 'Projects',
      active: projects.filter(p => p.status === 'in_progress' || p.status === 'testing').length,
      total: projects.length,
      status: projects.some(p => p.status === 'cancelled') ? 'red' : 'green',
    },
    {
      system: 'Prototypes',
      active: prototypes.filter(p => p.result === 'pass' || p.result === 'review').length,
      total: prototypes.length,
      status: prototypes.some(p => p.result === 'fail') ? 'red' : 'green',
    },
    {
      system: 'Field Tests',
      active: fieldTests.filter(t => t.outcome === 'success').length,
      total: fieldTests.length,
      status: fieldTests.some(t => t.outcome === 'failure') ? 'red' : fieldTests.some(t => t.outcome === 'partial') ? 'amber' : 'green',
    },
    {
      system: 'Assets',
      active: assets.filter(a => a.status === 'operational').length,
      total: assets.length,
      status: assets.some(a => a.status === 'decommissioned') ? 'amber' : 'green',
    },
    {
      system: 'Database',
      active: 1,
      total: 1,
      status: 'green' as const,
    },
    {
      system: 'Encryption',
      active: 1,
      total: 1,
      status: 'green' as const,
    },
    {
      system: 'Backup',
      active: store.getBackups().length > 0 ? 1 : 0,
      total: 1,
      status: store.getBackups().length === 0 ? 'amber' : 'green',
    },
  ];

  const statusColors = {
    green: 'text-tactical-green',
    amber: 'text-tactical-amber animate-pulse-amber',
    red: 'text-destructive animate-pulse',
  };

  return (
    <div className="bg-card border border-border rounded">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-tactical text-muted-foreground">System Status Board</span>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemStatus.map(s => (
          <div key={s.system} className="flex items-center gap-2 px-3 py-2 bg-secondary/20 rounded border border-border/50">
            <Circle className={`w-2.5 h-2.5 fill-current ${statusColors[s.status as keyof typeof statusColors]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-tactical text-foreground truncate">{s.system}</p>
              <p className="text-[9px] text-muted-foreground">{s.active}/{s.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
