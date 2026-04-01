import { store } from '@/lib/store';
import { AlertTriangle, AlertOctagon, Info, Clock } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  message: string;
  module: string;
  time: string;
}

function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const programs = store.getPrograms();
  const projects = store.getProjects();
  const assets = store.getAssets();
  const clearances = store.getClearances();
  const prototypes = store.getPrototypes();

  // Non-compliant / suspended programs
  programs.filter(p => p.status === 'suspended').forEach(p => {
    alerts.push({ id: p.id, severity: 'high', message: `Program "${p.name}" suspended`, module: 'Programs', time: p.created_at });
  });

  // Failed prototypes
  prototypes.filter(p => p.result === 'fail').forEach(p => {
    const proj = projects.find(pr => pr.id === p.project_id);
    alerts.push({ id: p.id, severity: 'critical', message: `Prototype ${p.version} failed — ${proj?.code_name}`, module: 'Prototypes', time: p.created_at });
  });

  // Assets in maintenance
  assets.filter(a => a.status === 'maintenance').forEach(a => {
    alerts.push({ id: a.id, severity: 'medium', message: `Asset "${a.name}" under maintenance`, module: 'Assets', time: new Date().toISOString() });
  });

  // Expiring clearances
  clearances.forEach(c => {
    const exp = new Date(c.expiry);
    const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    if (daysLeft < 90 && daysLeft > 0) {
      alerts.push({ id: c.id, severity: 'medium', message: `Clearance expiring in ${daysLeft} days`, module: 'Clearance', time: c.expiry });
    }
  });

  // Cancelled projects
  projects.filter(p => p.status === 'cancelled').forEach(p => {
    alerts.push({ id: p.id, severity: 'high', message: `Project "${p.code_name}" cancelled`, module: 'Projects', time: p.created_at });
  });

  // Decommissioned assets
  assets.filter(a => a.status === 'decommissioned').forEach(a => {
    alerts.push({ id: a.id, severity: 'info', message: `Asset "${a.name}" decommissioned`, module: 'Assets', time: new Date().toISOString() });
  });

  return alerts.slice(0, 8);
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertOctagon, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', dot: 'bg-destructive' },
  high: { icon: AlertTriangle, color: 'text-tactical-red', bg: 'bg-tactical-red/10 border-tactical-red/20', dot: 'bg-tactical-red' },
  medium: { icon: Clock, color: 'text-tactical-amber', bg: 'bg-tactical-amber/10 border-tactical-amber/20', dot: 'bg-tactical-amber' },
  info: { icon: Info, color: 'text-tactical-blue', bg: 'bg-tactical-blue/10 border-tactical-blue/20', dot: 'bg-tactical-blue' },
};

export default function PriorityAlerts() {
  const alerts = generateAlerts();

  return (
    <div className="bg-card border border-border rounded">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-tactical-amber" />
          <span className="text-xs font-tactical text-muted-foreground">Priority Alerts</span>
        </div>
        <span className="text-[10px] font-tactical text-tactical-amber">{alerts.length} ACTIVE</span>
      </div>
      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
        {alerts.map(alert => {
          const config = SEVERITY_CONFIG[alert.severity];
          const Icon = config.icon;
          return (
            <div key={alert.id} className={`flex items-start gap-2 px-3 py-2 rounded border ${config.bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${config.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-tactical ${config.color}`}>{alert.message}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{alert.module}</p>
              </div>
              <Icon className={`w-3 h-3 ${config.color} shrink-0 mt-0.5`} />
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No active alerts</p>
        )}
      </div>
    </div>
  );
}
