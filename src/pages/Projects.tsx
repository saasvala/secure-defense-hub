import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { FileSearch } from 'lucide-react';

export default function Projects() {
  const projects = store.getProjects();
  const programs = store.getPrograms();

  return (
    <div>
      <PageHeader title="Classified Projects" subtitle={`${projects.length} projects registered`} icon={FileSearch} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Code Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Program</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-primary">{p.code_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{programs.find(pr => pr.id === p.program_id)?.name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-foreground/70">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
