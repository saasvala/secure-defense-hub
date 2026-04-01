import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ClearanceMatrix from '@/components/ClearanceMatrix';
import ImmutableBadge from '@/components/ImmutableBadge';
import { KeyRound, Shield } from 'lucide-react';

export default function ClearanceRecords() {
  const clearances = store.getClearances();
  const users = store.getUsers();
  const roles = store.getRoles();

  return (
    <div>
      <PageHeader title="Security Clearance Records" subtitle={`${clearances.length} records`} icon={KeyRound} />
      <div className="p-6 space-y-6">
        {/* L1-L5 Clearance Matrix */}
        <ClearanceMatrix />

        {/* Records Table */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical text-muted-foreground">Personnel Clearance Records</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Personnel</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Level</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Expiry</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">State</th>
              </tr>
            </thead>
            <tbody>
              {clearances.map(c => {
                const user = users.find(u => u.id === c.user_id);
                const role = roles.find(r => r.id === user?.role_id);
                const daysLeft = Math.ceil((new Date(c.expiry).getTime() - Date.now()) / 86400000);
                const expiring = daysLeft < 90 && daysLeft > 0;

                return (
                  <tr key={c.id} className={`border-b border-border/50 hover:bg-secondary/20 ${expiring ? 'bg-tactical-amber/5' : ''}`}>
                    <td className="px-4 py-3 text-xs font-tactical text-foreground">{user?.username || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{role?.name || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.level} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.expiry}
                      {expiring && <span className="ml-2 text-tactical-amber text-[9px] font-tactical">({daysLeft}d)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ImmutableBadge state={expiring ? 'immutable' : 'verified'} label={expiring ? 'EXPIRING' : 'VALID'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
