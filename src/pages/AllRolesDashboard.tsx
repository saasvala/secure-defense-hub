import { useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { store } from '@/lib/store';
import { visibleModules, type ModuleKey } from '@/lib/permissions';
import {
  LayoutGrid, Users, Shield, FolderKanban, FileSearch, Cpu,
  FlaskConical, KeyRound, ShieldCheck, Package, FileBarChart,
  ClipboardList, HardDrive, Filter,
} from 'lucide-react';

const MODULE_META: Record<ModuleKey, { label: string; icon: typeof Shield; color: string; count: () => number }> = {
  dashboard:     { label: 'Dashboard',    icon: LayoutGrid,     color: 'text-primary',          count: () => 1 },
  programs:      { label: 'Programs',     icon: FolderKanban,   color: 'text-primary',          count: () => store.getPrograms().length },
  projects:      { label: 'Projects',     icon: FileSearch,     color: 'text-tactical-blue',    count: () => store.getProjects().length },
  prototypes:    { label: 'Prototypes',   icon: Cpu,            color: 'text-muted-foreground', count: () => store.getPrototypes().length },
  'field-tests': { label: 'Field Tests',  icon: FlaskConical,   color: 'text-accent',           count: () => store.getFieldTests().length },
  clearance:     { label: 'Clearance',    icon: KeyRound,       color: 'text-tactical-amber',   count: () => store.getClearances().length },
  compliance:    { label: 'Compliance',   icon: ShieldCheck,    color: 'text-tactical-green',   count: () => 0 },
  assets:        { label: 'Assets',       icon: Package,        color: 'text-tactical-amber',   count: () => store.getAssets().length },
  reports:       { label: 'Reports',      icon: FileBarChart,   color: 'text-tactical-blue',    count: () => 0 },
  audit:         { label: 'Audit Logs',   icon: ClipboardList,  color: 'text-muted-foreground', count: () => store.getAudit().length },
  backup:        { label: 'Backup',       icon: HardDrive,      color: 'text-tactical-green',   count: () => store.getBackups().length },
  users:         { label: 'User Mgmt',    icon: Users,          color: 'text-tactical-blue',    count: () => store.getUsers().length },
};

export default function AllRolesDashboard() {
  const roles = useMemo(() => store.getRoles(), []);
  const users = useMemo(() => store.getUsers(), []);
  const [filter, setFilter] = useState<string>('ALL');

  const visibleRoles = filter === 'ALL' ? roles : roles.filter(r => r.name === filter);

  const usersByRole = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach(u => m.set(u.role_id, (m.get(u.role_id) || 0) + 1));
    return m;
  }, [users]);

  return (
    <div>
      <PageHeader
        title="All Roles Dashboard"
        subtitle="Combined operational view across every clearance role"
        icon={LayoutGrid}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard icon={Users}  label="Total Roles"     value={roles.length} color="text-primary" />
          <SummaryCard icon={Shield} label="Total Personnel" value={users.length} color="text-tactical-blue" />
          <SummaryCard icon={KeyRound} label="Active Sessions" value={users.filter(u => u.status === 'active').length} color="text-tactical-green" />
          <SummaryCard icon={ClipboardList} label="Audit Events" value={store.getAudit().length} color="text-tactical-amber" />
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border rounded p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-tactical text-muted-foreground">Filter by Role</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoleChip active={filter === 'ALL'} onClick={() => setFilter('ALL')} label={`ALL (${roles.length})`} />
            {roles.map(r => (
              <RoleChip
                key={r.id}
                active={filter === r.name}
                onClick={() => setFilter(r.name)}
                label={`${r.name} (${usersByRole.get(r.id) || 0})`}
              />
            ))}
          </div>
        </div>

        {/* Per-role panels */}
        {visibleRoles.length === 0 ? (
          <EmptyState icon={Users} title="NO ROLES" message="No roles configured in the system." />
        ) : (
          <div className="space-y-4">
            {visibleRoles.map(role => {
              const mods = visibleModules(role.name);
              const personnel = usersByRole.get(role.id) || 0;
              return (
                <section key={role.id} className="bg-card border border-border rounded overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-secondary/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="text-xs font-tactical text-foreground truncate">{role.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-tactical">
                      <span className="px-2 py-0.5 rounded bg-tactical-blue/10 text-tactical-blue border border-tactical-blue/20">
                        {personnel} PERSONNEL
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {mods.length} MODULES
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    {mods.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground font-tactical text-center py-4">
                        NO MODULES ASSIGNED
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        {mods.map(m => {
                          const meta = MODULE_META[m];
                          const Icon = meta.icon;
                          return (
                            <div
                              key={m}
                              className="bg-secondary/20 hover:bg-secondary/40 transition-colors border border-border/50 rounded p-3"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                <span className="text-[9px] font-tactical text-muted-foreground truncate">{meta.label}</span>
                              </div>
                              <p className="text-lg font-tactical text-foreground tabular-nums">{meta.count()}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] font-tactical text-muted-foreground truncate">{label}</span>
      </div>
      <p className="text-2xl font-tactical text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function RoleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-[10px] font-tactical border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-secondary/30 text-foreground/70 border-border hover:bg-secondary/60 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}
