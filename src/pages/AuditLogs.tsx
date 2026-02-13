import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import { ClipboardList } from 'lucide-react';

export default function AuditLogs() {
  const audit = store.getAudit();
  const users = store.getUsers();

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`${audit.length} entries`} icon={ClipboardList} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground font-tactical">{new Date(a.date).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{users.find(u => u.id === a.user_id)?.username || a.user_id}</td>
                  <td className="px-4 py-3 text-xs font-tactical text-primary">{a.action}</td>
                  <td className="px-4 py-3 text-xs text-foreground/70">{a.details}</td>
                </tr>
              ))}
              {audit.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">No audit entries</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
