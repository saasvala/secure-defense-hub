import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { KeyRound } from 'lucide-react';

export default function ClearanceRecords() {
  const clearances = store.getClearances();
  const users = store.getUsers();

  return (
    <div>
      <PageHeader title="Security Clearance Records" subtitle={`${clearances.length} records`} icon={KeyRound} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Personnel</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Level</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {clearances.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-foreground">{users.find(u => u.id === c.user_id)?.username || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.level} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
