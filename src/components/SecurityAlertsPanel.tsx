import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Trash2, BellRing } from 'lucide-react';
import { securityAlerts, type SecurityAlert } from '@/lib/securityAlerts';

const LEVEL_CLS: Record<SecurityAlert['level'], { text: string; bg: string; border: string; dot: string }> = {
  INFO:         { text: 'text-tactical-blue',  bg: 'bg-tactical-blue/10',  border: 'border-tactical-blue/40',  dot: 'bg-tactical-blue' },
  DEGRADED:     { text: 'text-tactical-amber', bg: 'bg-tactical-amber/10', border: 'border-tactical-amber/40', dot: 'bg-tactical-amber' },
  COMPROMISED:  { text: 'text-tactical-red',   bg: 'bg-tactical-red/10',   border: 'border-tactical-red/40',   dot: 'bg-tactical-red' },
};

function relTime(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function SecurityAlertsPanel() {
  const [list, setList] = useState<SecurityAlert[]>(securityAlerts.all());
  const [, setTick] = useState(0);

  useEffect(() => securityAlerts.subscribe(setList), []);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const unackedCount = list.filter(a => !a.acknowledged).length;

  return (
    <div className="glass holo-border rounded">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${unackedCount ? 'text-tactical-red animate-pulse-amber' : 'text-tactical-green'}`} />
          <span className={`text-xs font-tactical tracking-widest ${unackedCount ? 'text-tactical-red' : 'text-tactical-green'}`}>
            // Security Alerts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-tactical rounded border ${unackedCount ? 'border-tactical-red/40 bg-tactical-red/10 text-tactical-red animate-pulse-amber' : 'border-tactical-green/40 bg-tactical-green/10 text-tactical-green'}`}>
            {unackedCount} UNACKED
          </span>
          {list.length > 0 && (
            <button
              onClick={() => securityAlerts.clear()}
              className="p-1 rounded border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BellRing className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-[10px] font-tactical tracking-widest">NO SECURITY EVENTS</p>
          </div>
        )}

        {list.map(a => {
          const c = LEVEL_CLS[a.level];
          return (
            <div key={a.id} className={`flex items-start gap-2 px-3 py-2 rounded border ${c.border} ${c.bg} ${a.acknowledged ? 'opacity-60' : ''} transition-opacity`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${c.dot} shrink-0 ${!a.acknowledged ? 'pulse-dot' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-tactical tracking-widest ${c.text}`}>{a.level}</span>
                  <span className="text-[9px] font-tactical text-muted-foreground">▸ {a.check}</span>
                </div>
                <p className="text-[11px] font-tactical text-foreground/85 tracking-wider mt-0.5">{a.message}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 tabular-nums">{relTime(a.ts)}</p>
              </div>
              {!a.acknowledged && (
                <button
                  onClick={() => securityAlerts.ack(a.id)}
                  className={`p-1 rounded border ${c.border} ${c.text} hover:bg-background/40 transition-colors shrink-0`}
                  title="Acknowledge"
                >
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
