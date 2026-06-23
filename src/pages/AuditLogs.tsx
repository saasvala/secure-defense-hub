import { useMemo, useState } from 'react';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import { ClipboardList, Download, User, Shield, Filter, Search, X, CalendarDays } from 'lucide-react';

export default function AuditLogs() {
  const audit = store.getAudit();
  const users = store.getUsers();
  const roles = store.getRoles();
  const clearances = store.getClearances();

  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'ACK' | 'CLEAR'>('ALL');

  const uniqueActions = [...new Set(audit.map(a => a.action))];
  const actorIds = [...new Set(audit.map(a => a.user_id))];

  const getUserInfo = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const role = roles.find(r => r.id === user?.role_id);
    const clearance = clearances.find(c => c.user_id === userId);
    return { user, role, clearance };
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs = dateTo ? new Date(dateTo).getTime() + 86_399_999 : null;
    return audit.filter(a => {
      if (filterAction && a.action !== filterAction) return false;
      if (filterUser && a.user_id !== filterUser) return false;
      if (quickFilter === 'ACK' && !a.action.includes('SECURITY_ALERT_ACK')) return false;
      if (quickFilter === 'CLEAR' && a.action !== 'SECURITY_ALERTS_CLEARED') return false;
      const ts = new Date(a.date).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      if (q) {
        const info = getUserInfo(a.user_id);
        const hay = `${a.action} ${a.details} ${info.user?.username || ''} ${info.role?.name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit, filterAction, filterUser, search, dateFrom, dateTo, quickFilter]);

  const resetFilters = () => {
    setFilterAction(''); setFilterUser(''); setSearch(''); setDateFrom(''); setDateTo(''); setQuickFilter('ALL');
  };
  const hasActiveFilters = !!(filterAction || filterUser || search || dateFrom || dateTo || quickFilter !== 'ALL');

  const exportForensicBundle = () => {
    if (filtered.length === 0) { toast.error('No audit entries to export'); return; }
    try {
    const bundle = {
      export_date: new Date().toISOString(),
      export_type: 'FORENSIC_BUNDLE',
      total_entries: filtered.length,
      filters: { action: filterAction, user: filterUser, search, dateFrom, dateTo, quickFilter },
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
    toast.success(`Forensic bundle exported (${filtered.length} entries)`);
    } catch {
      toast.error('Forensic export failed');
    }
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
        <div className="bg-card border border-border rounded p-3 space-y-3">
          {/* Quick chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {([
              { id: 'ALL', label: 'All' },
              { id: 'ACK', label: 'Acknowledgements' },
              { id: 'CLEAR', label: 'Clears' },
            ] as const).map(c => (
              <button
                key={c.id}
                onClick={() => setQuickFilter(c.id)}
                className={`px-2 py-1 text-[10px] font-tactical tracking-widest rounded border transition-colors ${
                  quickFilter === c.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1 px-2 py-1 text-[10px] font-tactical tracking-widest rounded border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="relative lg:col-span-2">
              <Search className="w-3 h-3 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search action, details, actor…"
                className="w-full bg-input border border-border rounded pl-7 pr-2 py-1.5 text-xs font-tactical text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All actions ({audit.length})</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="bg-input border border-border rounded px-2 py-1.5 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All users</option>
              {actorIds.map(id => {
                const u = users.find(x => x.id === id);
                return <option key={id} value={id}>{u?.username || id}</option>;
              })}
            </select>
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
              />
              <span className="text-muted-foreground text-xs">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-tactical tracking-widest">
            Showing {filtered.length} of {audit.length} entries
          </div>
        </div>

        {/* Trace Timeline */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="space-y-0">
            {filtered.map((a, idx) => {
              const info = getUserInfo(a.user_id);
              return (
                <div key={a.id} className={`flex flex-col md:flex-row md:items-start gap-3 px-4 py-3 ${idx % 2 === 0 ? 'bg-secondary/5' : ''} border-b border-border/30 hover:bg-secondary/15 transition-colors`}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {idx < filtered.length - 1 && <div className="w-px flex-1 bg-border mt-1 hidden md:block" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-tactical text-primary">{a.action}</span>
                        <ImmutableBadge state="immutable" />
                      </div>
                      <p className="text-[11px] text-foreground/60 break-words">{a.details}</p>
                    </div>
                  </div>

                  {/* Actor + Timestamp */}
                  <div className="flex md:flex-col md:text-right md:items-end gap-2 md:gap-1 flex-wrap items-center md:shrink-0 md:w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-tactical text-foreground">{info.user?.username || a.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                    <span className="text-[10px] text-muted-foreground font-tactical tabular-nums">
                      {new Date(a.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-2">
                <EmptyState icon={ClipboardList} title="NO AUDIT ENTRIES" message={hasActiveFilters ? 'No entries match the current filters.' : 'No system activity has been recorded yet.'} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
