import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import StatusBoard from '@/components/StatusBoard';
import SystemMonitoring from '@/components/SystemMonitoring';
import AnomalyTimeline from '@/components/AnomalyTimeline';
import MissionTimeline from '@/components/MissionTimeline';
import EmptyState from '@/components/EmptyState';
import PriorityAlerts from '@/components/PriorityAlerts';
import TopCommandBar from '@/components/TopCommandBar';
import AIAnalytics from '@/components/AIAnalytics';
import SurveillanceFeed from '@/components/SurveillanceFeed';
import SystemHealth from '@/components/SystemHealth';
import SecurityAlertsPanel from '@/components/SecurityAlertsPanel';
import { LayoutDashboard, FolderKanban, FileSearch, Users, Shield, FlaskConical, Package, Activity } from 'lucide-react';

export default function Dashboard() {
  const programs = store.getPrograms();
  const projects = store.getProjects();
  const users = store.getUsers();
  const assets = store.getAssets();
  const fieldTests = store.getFieldTests();
  const prototypes = store.getPrototypes();
  const audit = store.getAudit();

  const stats = [
    { label: 'Programs', value: programs.length, icon: FolderKanban, color: 'text-primary', glow: 'glow-amber' },
    { label: 'Projects', value: projects.length, icon: FileSearch, color: 'text-tactical-blue', glow: 'glow-blue' },
    { label: 'Personnel', value: users.length, icon: Users, color: 'text-tactical-green', glow: 'glow-green' },
    { label: 'Assets', value: assets.length, icon: Package, color: 'text-tactical-amber', glow: 'glow-amber' },
    { label: 'Field Tests', value: fieldTests.length, icon: FlaskConical, color: 'text-accent', glow: 'glow-blue' },
    { label: 'Prototypes', value: prototypes.length, icon: Shield, color: 'text-tactical-green', glow: 'glow-green' },
  ];

  const activePrograms = programs.filter(p => p.status === 'active');
  const recentAudit = audit.slice(0, 6);

  return (
    <div>
      <PageHeader title="Cyber Intelligence Hub" subtitle="AI Command • Surveillance • Threat Ops" icon={LayoutDashboard} />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Top Command Bar */}
        <TopCommandBar />

        {/* AI Command Analytics */}
        <AIAnalytics />

        {/* Live Surveillance Grid */}
        <SurveillanceFeed />
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`glass holo-border rounded p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 ${s.glow}`}>
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-2xl bg-current pointer-events-none" />
              <div className="flex items-center gap-2 mb-2 relative">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] font-tactical text-muted-foreground tracking-widest">{s.label}</span>
              </div>
              <p className={`text-3xl font-tactical font-bold relative ${s.color}`}>{String(s.value).padStart(2, '0')}</p>
              <div className="mt-2 h-1 rounded-sm bg-secondary/40 overflow-hidden relative">
                <div className="h-full progress-glow" style={{ width: `${Math.min(100, s.value * 8 + 20)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time System Monitoring */}
        <SystemMonitoring />

        {/* System Health & Encryption Status */}
        <SystemHealth />

        {/* Security Alerts */}
        <SecurityAlertsPanel />

        {/* Anomaly Timeline Feed */}
        <AnomalyTimeline />

        {/* Status Board */}
        <StatusBoard />

        {/* Mission Timeline + Priority Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MissionTimeline />
          <PriorityAlerts />
        </div>

        {/* Active Programs + Recent Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <span className="text-xs font-tactical text-muted-foreground">Active Programs</span>
            </div>
            <div className="p-4 space-y-2">
              {activePrograms.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded">
                  <span className="text-xs font-tactical text-foreground">{p.name}</span>
                  <StatusBadge status={p.classification} />
                </div>
              ))}
              {activePrograms.length === 0 && (
                <EmptyState icon={FolderKanban} title="NO ACTIVE PROGRAMS" message="No programs currently in active status." />
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Activity className="w-4 h-4 text-tactical-amber" />
              <span className="text-xs font-tactical text-muted-foreground">Recent Activity</span>
            </div>
            <div className="p-4 space-y-1">
              {recentAudit.map(a => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-1.5 text-[11px]">
                  <span className="font-tactical text-foreground/70 break-all min-w-0">{a.action}</span>
                  <span className="text-muted-foreground font-body tabular-nums whitespace-nowrap">{new Date(a.date).toLocaleString()}</span>
                </div>
              ))}
              {recentAudit.length === 0 && (
                <EmptyState icon={Activity} title="NO ACTIVITY" message="No recent system activity logged." />
              )}
            </div>
          </div>
        </div>

        {/* Project Status Overview */}
        <div className="bg-card border border-border rounded">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-xs font-tactical text-muted-foreground">Project Status Overview</span>
          </div>
          <div className="p-4">
            {projects.length === 0 ? (
              <EmptyState icon={FileSearch} title="NO PROJECTS" message="No classified projects to display." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {projects.map(p => {
                  const prog = programs.find(pr => pr.id === p.program_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded border border-border/50">
                      <div>
                        <p className="text-xs font-tactical text-foreground">{p.code_name}</p>
                        <p className="text-[10px] text-muted-foreground">{prog?.name}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
