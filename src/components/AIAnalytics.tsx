import { useEffect, useState } from 'react';
import { Brain, ShieldAlert, Server, Radar, Users2 } from 'lucide-react';

interface Ring {
  key: string;
  label: string;
  value: number;
  unit: string;
  icon: typeof Brain;
  color: string;
}

const COLORS: Record<string, string> = {
  amber: 'hsl(var(--tactical-amber))',
  blue: 'hsl(var(--tactical-blue))',
  green: 'hsl(var(--tactical-green))',
  red: 'hsl(var(--tactical-red))',
};

function RingChart({ value, color, size = 92 }: { value: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border))" strokeWidth={4} fill="none" opacity={0.4} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={COLORS[color]} strokeWidth={4} fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        style={{ filter: `drop-shadow(0 0 6px ${COLORS[color]})`, transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 100, h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7">
      <polyline
        fill="none" stroke={COLORS[color]} strokeWidth={1.2}
        points={pts}
        style={{ filter: `drop-shadow(0 0 3px ${COLORS[color]})` }}
      />
    </svg>
  );
}

export default function AIAnalytics() {
  const [metrics, setMetrics] = useState<Ring[]>([
    { key: 'threat', label: 'Threat Detection', value: 87, unit: '%', icon: ShieldAlert, color: 'red' },
    { key: 'devices', label: 'Connected Devices', value: 64, unit: '', icon: Radar, color: 'blue' },
    { key: 'servers', label: 'Secure Servers', value: 92, unit: '%', icon: Server, color: 'green' },
    { key: 'scan', label: 'AI Scan Coverage', value: 78, unit: '%', icon: Brain, color: 'amber' },
    { key: 'agents', label: 'Active Agents', value: 41, unit: '', icon: Users2, color: 'blue' },
  ]);
  const [series, setSeries] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(['threat', 'devices', 'servers', 'scan', 'agents'].map(k => [k, Array.from({ length: 20 }, () => 30 + Math.random() * 50)])),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        const delta = (Math.random() - 0.5) * 6;
        const cap = m.unit === '%' ? 100 : 200;
        const next = Math.max(5, Math.min(cap, m.value + delta));
        return { ...m, value: Math.round(next) };
      }));
      setSeries(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          next[k] = [...next[k].slice(1), 30 + Math.random() * 60];
        });
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass holo-border rounded scanline">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-tactical-blue animate-flicker" />
          <span className="text-xs font-tactical text-tactical-blue tracking-widest">// AI Command Analytics</span>
        </div>
        <span className="text-[9px] font-tactical text-tactical-green pulse-dot">● NEURAL LINK STABLE</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
        {metrics.map(m => (
          <div key={m.key} className="relative rounded border border-border/60 bg-secondary/20 p-3 overflow-hidden hover:border-tactical-blue/40 transition-colors group">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <div className="relative flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <m.icon className="w-3 h-3" style={{ color: COLORS[m.color] }} />
                  <p className="text-[9px] font-tactical text-muted-foreground tracking-widest">{m.label}</p>
                </div>
                <p className="text-2xl font-tactical tabular-nums" style={{ color: COLORS[m.color] }}>
                  {String(m.value).padStart(2, '0')}{m.unit}
                </p>
              </div>
              <div className="relative">
                <RingChart value={m.unit === '%' ? m.value : Math.min(100, m.value / 2)} color={m.color} size={64} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-tactical text-foreground/80">
                  {m.unit === '%' ? `${m.value}%` : m.value}
                </span>
              </div>
            </div>
            <Sparkline data={series[m.key]} color={m.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
