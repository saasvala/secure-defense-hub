import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Radio, Trash2 } from 'lucide-react';
import { anomalyFeed, type AnomalyEvent, type AnomalySeverity } from '@/lib/anomalyFeed';

const sevColor: Record<AnomalySeverity, string> = {
  NOMINAL: 'text-tactical-green',
  ACTIVE: 'text-tactical-blue',
  WARN: 'text-tactical-amber',
  CRITICAL: 'text-tactical-red',
};
const sevDot: Record<AnomalySeverity, string> = {
  NOMINAL: 'bg-tactical-green',
  ACTIVE: 'bg-tactical-blue',
  WARN: 'bg-tactical-amber',
  CRITICAL: 'bg-tactical-red',
};

function relTime(ts: number, now: number) {
  const d = Math.max(0, Math.floor((now - ts) / 1000));
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ${d % 60}s`;
  return `${Math.floor(d / 3600)}h ${Math.floor((d % 3600) / 60)}m`;
}

export default function AnomalyTimeline() {
  const [events, setEvents] = useState<AnomalyEvent[]>(() => anomalyFeed.all());
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<'ALL' | AnomalySeverity>('ALL');

  useEffect(() => anomalyFeed.subscribe(setEvents), []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'ALL' ? events : events.filter(e => e.to === filter);

  const grouped = useMemo(() => {
    const map = new Map<string, AnomalyEvent[]>();
    events.forEach(e => {
      const arr = map.get(e.metricKey) ?? [];
      arr.push(e);
      map.set(e.metricKey, arr);
    });
    return Array.from(map.entries()).map(([key, list]) => ({
      key,
      label: list[0].metricLabel,
      latest: list[0],
      count: list.length,
    }));
  }, [events]);

  const filters: ('ALL' | AnomalySeverity)[] = ['ALL', 'CRITICAL', 'WARN', 'ACTIVE', 'NOMINAL'];

  return (
    <div className="glass holo-border rounded scanline">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-tactical-amber" />
          <span className="text-xs font-tactical text-tactical-amber tracking-widest">// Anomaly Timeline Feed</span>
          <span className="text-[9px] font-tactical text-muted-foreground">· {events.length} EVT</span>
        </div>
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[9px] font-tactical tracking-widest px-2 py-0.5 rounded border transition-colors ${
                filter === f
                  ? 'border-tactical-amber text-tactical-amber bg-tactical-amber/10'
                  : 'border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => anomalyFeed.clear()}
            title="Clear feed"
            className="ml-1 p-1 rounded border border-border/60 text-muted-foreground hover:text-tactical-red hover:border-tactical-red transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
        {/* Per-system summary */}
        <div className="p-4 space-y-2 lg:col-span-1">
          <p className="text-[9px] font-tactical text-muted-foreground tracking-widest mb-2">▸ PER-SYSTEM STATE</p>
          {grouped.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/60 font-body">Awaiting telemetry transitions…</p>
          ) : (
            grouped.map(g => (
              <div key={g.key} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded border border-border/40 bg-secondary/20">
                <div className="min-w-0">
                  <p className="text-[10px] font-tactical text-foreground truncate">{g.label}</p>
                  <p className="text-[9px] text-muted-foreground font-body">{g.count} transition{g.count !== 1 ? 's' : ''} · {relTime(g.latest.ts, now)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${sevDot[g.latest.to]}`} />
                  <span className={`text-[9px] font-tactical tracking-wider ${sevColor[g.latest.to]}`}>{g.latest.to}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live event stream */}
        <div className="p-4 lg:col-span-2">
          <p className="text-[9px] font-tactical text-muted-foreground tracking-widest mb-2">
            ▸ EVENT STREAM {filter !== 'ALL' && <span className={sevColor[filter as AnomalySeverity]}>· {filter}</span>}
          </p>
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-[10px] font-tactical text-muted-foreground/60 tracking-widest">
              NO ANOMALIES LOGGED
            </div>
          ) : (
            <div className="relative max-h-80 overflow-y-auto pr-1 space-y-1.5">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/50" aria-hidden />
              {filtered.map(e => {
                const escalation = anomalyFeed.isEscalation(e.from, e.to);
                const Arrow = escalation ? ArrowUpRight : ArrowDownRight;
                return (
                  <div key={e.id} className="relative pl-5">
                    <span className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background ${sevDot[e.to]} pulse-dot`} />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-tactical text-foreground tracking-wider flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{e.metricLabel}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] ${escalation ? 'text-tactical-red' : 'text-tactical-green'}`}>
                            <Arrow className="w-2.5 h-2.5" />
                            {e.from} → {e.to}
                          </span>
                        </p>
                        <p className="text-[9px] text-muted-foreground/80 font-body truncate">
                          {e.value.toFixed(0)}{e.unit} · {e.detail}
                        </p>
                      </div>
                      <div className="text-[9px] font-tactical text-muted-foreground tabular-nums whitespace-nowrap">
                        {relTime(e.ts, now)}
                      </div>
                    </div>
                    {e.to === 'CRITICAL' && (
                      <div className="mt-0.5 inline-flex items-center gap-1 text-[8px] font-tactical text-tactical-red tracking-widest">
                        <AlertTriangle className="w-2.5 h-2.5" /> ESCALATION FLAGGED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
