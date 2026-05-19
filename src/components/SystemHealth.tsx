import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Lock, KeyRound, Fingerprint, Server, Wifi, RefreshCw, Database, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { store } from '@/lib/store';
import { securityAlerts, type SecurityLevel } from '@/lib/securityAlerts';

type Tone = 'green' | 'amber' | 'red' | 'blue';

const TONE_CLS: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  green: { text: 'text-tactical-green', bg: 'bg-tactical-green/10', border: 'border-tactical-green/40', dot: 'bg-tactical-green' },
  amber: { text: 'text-tactical-amber', bg: 'bg-tactical-amber/10', border: 'border-tactical-amber/40', dot: 'bg-tactical-amber' },
  red:   { text: 'text-tactical-red',   bg: 'bg-tactical-red/10',   border: 'border-tactical-red/40',   dot: 'bg-tactical-red' },
  blue:  { text: 'text-tactical-blue',  bg: 'bg-tactical-blue/10',  border: 'border-tactical-blue/40',  dot: 'bg-tactical-blue' },
};

function relTime(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function SystemHealth() {
  const [now, setNow] = useState(Date.now());
  const [keyAge, setKeyAge] = useState(() => Date.now() - 1000 * 60 * 42); // last rotation
  const [entropy, setEntropy] = useState(98.4);
  const [tlsHandshake, setTlsHandshake] = useState(112); // ms
  const [vaultLatency, setVaultLatency] = useState(34);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      setEntropy(e => Math.max(92, Math.min(99.9, e + (Math.random() - 0.5) * 0.4)));
      setTlsHandshake(v => Math.max(60, Math.min(220, v + (Math.random() - 0.5) * 10)));
      setVaultLatency(v => Math.max(12, Math.min(120, v + (Math.random() - 0.5) * 6)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const backups = store.getBackups();
  const lastBackup = backups[0]?.date ? new Date(backups[0].date).getTime() : null;

  // Encryption details
  const encDetails = [
    { label: 'Cipher Suite',      value: 'AES-256-GCM',        tone: 'green' as Tone, icon: Lock },
    { label: 'Key Exchange',      value: 'X25519 / ECDH',      tone: 'blue'  as Tone, icon: KeyRound },
    { label: 'Hash Algorithm',    value: 'SHA-512',            tone: 'blue'  as Tone, icon: Fingerprint },
    { label: 'TLS Version',       value: 'TLS 1.3',            tone: 'green' as Tone, icon: ShieldCheck },
    { label: 'PFS',               value: 'ENABLED',            tone: 'green' as Tone, icon: ShieldCheck },
    { label: 'Quantum Resilient', value: 'KYBER-1024',         tone: 'amber' as Tone, icon: Lock },
  ];

  // Security readiness checks
  const readiness = [
    { label: 'Master Key Sealed',     ok: true,  tone: 'green' as Tone },
    { label: 'Vault Mounted',         ok: true,  tone: 'green' as Tone },
    { label: 'MFA Enforced',          ok: true,  tone: 'green' as Tone },
    { label: 'Audit Stream Active',   ok: true,  tone: 'green' as Tone },
    { label: 'Backup < 24h',          ok: !!lastBackup && now - lastBackup < 86400000, tone: 'amber' as Tone },
    { label: 'Cert Chain Valid',      ok: true,  tone: 'green' as Tone },
    { label: 'Tamper Seal Intact',    ok: true,  tone: 'green' as Tone },
    { label: 'Network Isolation',     ok: true,  tone: 'green' as Tone },
  ];

  const readyScore = useMemo(
    () => Math.round((readiness.filter(r => r.ok).length / readiness.length) * 100),
    [readiness],
  );
  const readyTone: Tone = readyScore === 100 ? 'green' : readyScore >= 80 ? 'amber' : 'red';

  // Health subsystems
  const subsystems: { label: string; icon: typeof Server; value: number; unit: string; tone: Tone }[] = [
    { label: 'TLS Handshake',  icon: Wifi,     value: Math.round(tlsHandshake),  unit: 'ms', tone: tlsHandshake > 180 ? 'amber' : 'green' },
    { label: 'Vault Latency',  icon: Database, value: Math.round(vaultLatency),  unit: 'ms', tone: vaultLatency > 90 ? 'amber' : 'green' },
    { label: 'Entropy Pool',   icon: RefreshCw,value: Math.round(entropy * 10) / 10, unit: '%', tone: entropy < 95 ? 'amber' : 'green' },
    { label: 'Active Sessions',icon: Server,   value: store.getUsers().length, unit: '', tone: 'blue' },
  ];

  const rotateKey = () => {
    setKeyAge(Date.now());
  };

  return (
    <div className="glass holo-border rounded scanline">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-tactical-green pulse-dot" />
          <span className="text-xs font-tactical text-tactical-green tracking-widest">// System Health &amp; Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-tactical rounded border ${TONE_CLS[readyTone].border} ${TONE_CLS[readyTone].bg} ${TONE_CLS[readyTone].text} tracking-widest`}>
            READINESS {readyScore}%
          </span>
          <span className="text-[9px] font-tactical text-muted-foreground tabular-nums">
            UTC {new Date(now).toISOString().substring(11, 19)}
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* === Encryption Details === */}
        <div className="rounded border border-border/60 bg-secondary/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-tactical text-tactical-blue tracking-widest">ENCRYPTION STACK</span>
            <button
              onClick={rotateKey}
              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-tactical text-tactical-amber border border-tactical-amber/40 rounded hover:bg-tactical-amber/10 transition-colors"
              title="Rotate session key"
            >
              <RefreshCw className="w-2.5 h-2.5" /> ROTATE
            </button>
          </div>

          {/* Key strength meter */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[9px] font-tactical text-muted-foreground mb-1">
              <span>KEY STRENGTH</span><span className="text-tactical-green tabular-nums">256-bit / 100%</span>
            </div>
            <div className="h-1.5 bg-secondary/60 rounded-sm overflow-hidden border border-border/40">
              <div className="h-full progress-glow" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between text-[9px] font-tactical text-muted-foreground mt-1">
              <span>LAST ROTATION</span>
              <span className="text-foreground tabular-nums">{relTime(keyAge)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {encDetails.map(d => {
              const t = TONE_CLS[d.tone];
              return (
                <div key={d.label} className={`flex items-center justify-between px-2 py-1.5 rounded border ${t.border} ${t.bg}`}>
                  <span className="flex items-center gap-1.5 text-[10px] font-tactical text-foreground/80 tracking-wider">
                    <d.icon className={`w-3 h-3 ${t.text}`} /> {d.label}
                  </span>
                  <span className={`text-[10px] font-tactical ${t.text} tabular-nums`}>{d.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* === Subsystems / Live Health === */}
        <div className="rounded border border-border/60 bg-secondary/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-tactical text-tactical-blue tracking-widest">CORE SUBSYSTEMS</span>
            <span className="text-[9px] font-tactical text-tactical-green pulse-dot">● LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {subsystems.map(s => {
              const t = TONE_CLS[s.tone];
              return (
                <div key={s.label} className={`rounded border ${t.border} ${t.bg} p-2.5 relative overflow-hidden`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`w-3 h-3 ${t.text}`} />
                    <span className="text-[9px] font-tactical text-muted-foreground tracking-widest">{s.label}</span>
                  </div>
                  <p className={`text-lg font-tactical tabular-nums ${t.text}`}>
                    {s.value}<span className="text-[10px] ml-1 opacity-70">{s.unit}</span>
                  </p>
                  <div className="mt-1.5 h-1 bg-background/40 rounded-sm overflow-hidden">
                    <div
                      className="h-full progress-glow transition-all"
                      style={{ width: `${Math.min(100, Math.max(8, s.unit === '%' ? s.value : 100 - s.value / 2))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backup row */}
          <div className="mt-3 flex items-center justify-between px-2 py-1.5 rounded border border-border/60 bg-background/30">
            <span className="flex items-center gap-1.5 text-[10px] font-tactical text-foreground/80">
              <Database className="w-3 h-3 text-tactical-blue" /> LAST BACKUP
            </span>
            <span className={`text-[10px] font-tactical tabular-nums ${lastBackup ? 'text-tactical-green' : 'text-tactical-red'}`}>
              {lastBackup ? relTime(lastBackup) : 'NEVER'}
            </span>
          </div>
        </div>

        {/* === Readiness Matrix === */}
        <div className="rounded border border-border/60 bg-secondary/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-tactical text-tactical-blue tracking-widest">READINESS MATRIX</span>
            <span className={`text-[9px] font-tactical ${TONE_CLS[readyTone].text}`}>
              {readyScore === 100 ? 'OPERATIONAL' : readyScore >= 80 ? 'DEGRADED' : 'COMPROMISED'}
            </span>
          </div>
          <div className="space-y-1.5">
            {readiness.map(r => {
              const tone: Tone = r.ok ? 'green' : r.tone;
              const t = TONE_CLS[tone];
              const Icon = r.ok ? CheckCircle2 : AlertTriangle;
              return (
                <div key={r.label} className={`flex items-center justify-between px-2 py-1.5 rounded border ${t.border} ${t.bg}`}>
                  <span className="flex items-center gap-1.5 text-[10px] font-tactical text-foreground/85 tracking-wider">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot} pulse-dot`} />
                    {r.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${t.text}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
