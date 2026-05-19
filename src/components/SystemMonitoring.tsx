import { useEffect, useState } from 'react';
import { Cpu, HardDrive, Network, Shield, Radio, Database, Activity, Zap } from 'lucide-react';
import { store } from '@/lib/store';

interface Metric {
  key: string;
  label: string;
  icon: typeof Cpu;
  value: number; // 0-100
  unit: string;
  color: 'blue' | 'green' | 'amber' | 'red';
  status: 'NOMINAL' | 'ACTIVE' | 'WARN' | 'CRITICAL';
  detail: string;
}

const colorMap = {
  blue:  { stroke: 'hsl(var(--tactical-blue))',  text: 'text-tactical-blue',  bg: 'bg-tactical-blue',  glow: 'glow-blue' },
  green: { stroke: 'hsl(var(--tactical-green))', text: 'text-tactical-green', bg: 'bg-tactical-green', glow: 'glow-green' },
  amber: { stroke: 'hsl(var(--tactical-amber))', text: 'text-tactical-amber', bg: 'bg-tactical-amber', glow: 'glow-amber' },
  red:   { stroke: 'hsl(var(--tactical-red))',   text: 'text-tactical-red',   bg: 'bg-tactical-red',   glow: 'glow-red' },
};

function ring(value: number, color: string, size = 64) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90 drop-shadow-[0_0_8px_currentColor]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border))" strokeWidth="3" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

function jitter(base: number, range: number) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range));
}

function statusFor(v: number, invert = false): Metric['status'] {
  const x = invert ? 100 - v : v;
  if (x >= 90) return 'CRITICAL';
  if (x >= 70) return 'WARN';
  if (x >= 30) return 'ACTIVE';
  return 'NOMINAL';
}

function buildMetrics(seed: { proj: number; assets: number; backups: number; audit: number }): Metric[] {
  const cpu = jitter(46, 18);
  const mem = jitter(62, 14);
  const net = jitter(73, 22);
  const enc = 99;
  const sig = jitter(88, 10);
  const storage = jitter(54, 8);
  const threat = jitter(18, 24);
  const sync = seed.backups > 0 ? jitter(96, 6) : jitter(40, 20);

  return [
    { key: 'cpu', label: 'CPU Core Load', icon: Cpu, value: cpu, unit: '%', color: cpu > 80 ? 'red' : cpu > 60 ? 'amber' : 'blue', status: statusFor(cpu), detail: `${seed.proj} ops running` },
    { key: 'mem', label: 'Memory Buffer', icon: Database, value: mem, unit: '%', color: mem > 85 ? 'red' : mem > 70 ? 'amber' : 'green', status: statusFor(mem), detail: `${(mem * 0.16).toFixed(1)} GB / 16 GB` },
    { key: 'net', label: 'Network Throughput', icon: Network, value: net, unit: 'Mb', color: 'blue', status: statusFor(net), detail: `${(net * 12.4).toFixed(0)} Mbps tactical link` },
    { key: 'enc', label: 'Encryption Channel', icon: Shield, value: enc, unit: '%', color: 'green', status: 'ACTIVE', detail: 'AES-256 / handshake OK' },
    { key: 'sig', label: 'Signal Integrity', icon: Radio, value: sig, unit: '%', color: sig > 80 ? 'green' : 'amber', status: statusFor(sig), detail: 'SAT-LINK · BAND-7' },
    { key: 'storage', label: 'Vault Storage', icon: HardDrive, value: storage, unit: '%', color: storage > 85 ? 'red' : 'blue', status: statusFor(storage), detail: `${seed.assets} assets indexed` },
    { key: 'threat', label: 'Threat Level', icon: Zap, value: threat, unit: '%', color: threat > 60 ? 'red' : threat > 30 ? 'amber' : 'green', status: statusFor(threat), detail: threat > 60 ? 'Elevated — review' : 'Stable perimeter' },
    { key: 'sync', label: 'Vault Sync', icon: Activity, value: sync, unit: '%', color: sync > 90 ? 'green' : 'amber', status: statusFor(sync), detail: `${seed.backups} backups · ${seed.audit} logs` },
  ];
}

export default function SystemMonitoring() {
  const seed = {
    proj: store.getProjects().length,
    assets: store.getAssets().length,
    backups: store.getBackups().length,
    audit: store.getAudit().length,
  };
  const [metrics, setMetrics] = useState<Metric[]>(() => buildMetrics(seed));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(buildMetrics(seed));
      setTick(t => t + 1);
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass holo-border rounded scanline">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-tactical-blue" />
          <span className="text-xs font-tactical text-tactical-blue tracking-widest">// Real-Time System Monitoring</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tactical-green pulse-dot" />
          <span className="text-[9px] font-tactical text-tactical-green tracking-widest">TELEMETRY · T+{String(tick).padStart(4, '0')}</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => {
          const c = colorMap[m.color];
          return (
            <div
              key={m.key}
              className={`relative rounded border border-border/60 bg-secondary/20 p-3 overflow-hidden transition-all hover:border-current ${c.text} hover:${c.glow}`}
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.07] blur-2xl bg-current pointer-events-none" />
              <div className="flex items-start gap-3 relative">
                <div className="relative shrink-0">
                  {ring(m.value, c.stroke, 60)}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <m.icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-tactical text-muted-foreground tracking-widest truncate">{m.label}</p>
                  <p className={`text-xl font-tactical font-bold tabular-nums leading-tight ${c.text}`}>
                    {m.value.toFixed(0)}<span className="text-[10px] ml-0.5 opacity-70">{m.unit}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${c.bg}`} />
                    <span className={`text-[9px] font-tactical tracking-wider ${c.text}`}>{m.status}</span>
                  </div>
                </div>
              </div>

              {/* Animated bar */}
              <div className="mt-3 relative h-1.5 rounded-sm bg-background/60 overflow-hidden border border-border/40">
                <div
                  className={`h-full ${c.bg} transition-all duration-700`}
                  style={{ width: `${m.value}%`, boxShadow: `0 0 10px ${c.stroke}` }}
                />
                <div
                  className="absolute inset-y-0 w-8 opacity-40"
                  style={{
                    left: `${(tick * 13) % 100}%`,
                    background: `linear-gradient(90deg, transparent, ${c.stroke}, transparent)`,
                    transition: 'left 700ms linear',
                  }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground/80 mt-1.5 truncate font-body">▸ {m.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
