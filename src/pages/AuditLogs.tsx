import { useState } from 'react';
import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import ImmutableBadge from '@/components/ImmutableBadge';
import { ClipboardList, Download, User, Shield, Filter } from 'lucide-react';

export default function AuditLogs() {
  const audit = store.getAudit();
  const users = store.getUsers();
  const roles = store.getRoles();
  const clearances = store.getClearances();
  const [filterAction, setFilterAction] = useState('');

  const uniqueActions = [...new Set(audit.map(a => a.action))];
  const filtered = filterAction ? audit.filter(a => a.action === filterAction) : audit;

  const getUserInfo = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const role = roles.find(r => r.id === user?.role_id);
    const clearance = clearances.find(c => c.user_id === userId);
    return { user, role, clearance };
  };

  const exportForensicBundle = () => {
    const bundle = {
      export_date: new Date().toISOString(),
      export_type: 'FORENSIC_BUNDLE',
      total_entries: filtered.length,
      entries: filtered.map(a => {
        const info = getUserInfo(a.user_id);
        return {
          ...a,
          actor_name: info.user?.username || a.user_id,
          actor_role: info.role?.name || 'Unknown',
          clearance_level: info.clearance?.level || 'N/A',
        };
      }),
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic_bundle_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.addAudit({ user_id: store.getCurrentUser()?.id || 'system', action: 'FORENSIC_EXPORT', details: `Exported ${filtered.length} entries` });
  };

  return (
    <div>
      <PageHeader
        title="Audit & Forensics"
        subtitle={`${audit.length} entries • Full trace timeline`}
        icon={ClipboardList}
        actions={
          <button
            onClick={exportForensicBundle}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90"
          >
            <Download className="w-3 h-3" /> Export Forensic Bundle
          </button>
        }
      />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="bg-input border border-border rounded px-3 py-1.5 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Actions ({audit.length})</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span className="text-[10px] text-muted-foreground font-tactical">Showing {filtered.length} entries</span>
        </div>

        {/* Trace Timeline */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="space-y-0">
            {filtered.map((a, idx) => {
              const info = getUserInfo(a.user_id);
              return (
                <div key={a.id} className={`flex items-start gap-4 px-4 py-3 ${idx % 2 === 0 ? 'bg-secondary/5' : ''} border-b border-border/30 hover:bg-secondary/15 transition-colors`}>
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {idx < filtered.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-tactical text-primary">{a.action}</span>
                      <ImmutableBadge state="immutable" />
                    </div>
                    <p className="text-[11px] text-foreground/60">{a.details}</p>
                  </div>

                  {/* Actor + Clearance Tag */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex items-center gap-1.5 justify-end">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-tactical text-foreground">{info.user?.username || a.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] font-tactical text-muted-foreground">{info.role?.name || '—'}</span>
                    </div>
                    {info.clearance && (
                      <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-tactical rounded border ${
                        info.clearance.level === 'TOP SECRET' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                        info.clearance.level === 'SECRET' ? 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30' :
                        'bg-tactical-blue/10 text-tactical-blue border-tactical-blue/30'
                      }`}>
                        {info.clearance.level}
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground font-tactical tabular-nums shrink-0 pt-0.5">
                    {new Date(a.date).toLocaleString()}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">No audit entries</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
