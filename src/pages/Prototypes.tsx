import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Cpu } from 'lucide-react';

export default function Prototypes() {
  const prototypes = store.getPrototypes();
  const projects = store.getProjects();

  return (
    <div>
      <PageHeader title="Prototype Development" subtitle={`${prototypes.length} prototypes tracked`} icon={Cpu} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Version</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Result</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Notes</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {prototypes.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-primary">{projects.find(pr => pr.id === p.project_id)?.code_name || '—'}</td>
                  <td className="px-4 py-3 text-xs font-tactical text-foreground">{p.version}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.result} /></td>
                  <td className="px-4 py-3 text-xs text-foreground/70">{p.notes}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
