import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { FolderKanban } from 'lucide-react';

export default function Programs() {
  const programs = store.getPrograms();

  return (
    <div>
      <PageHeader title="Defense Programs" subtitle={`${programs.length} registered programs`} icon={FolderKanban} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Program Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Classification</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-foreground">{p.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.classification} /></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
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
