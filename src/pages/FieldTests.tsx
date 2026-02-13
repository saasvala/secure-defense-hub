import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { FlaskConical } from 'lucide-react';

export default function FieldTests() {
  const tests = store.getFieldTests();
  const projects = store.getProjects();

  return (
    <div>
      <PageHeader title="Field Trials & Testing" subtitle={`${tests.length} tests logged`} icon={FlaskConical} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Outcome</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-primary">{projects.find(p => p.id === t.project_id)?.code_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{t.location}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.outcome} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.date}</td>
                  <td className="px-4 py-3 text-xs text-foreground/70">{t.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
