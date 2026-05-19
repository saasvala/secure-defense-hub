import { useEffect, useState } from 'react';
import { Camera, Radio, Satellite, Flame, Activity, Video } from 'lucide-react';

interface Feed {
  id: string;
  label: string;
  location: string;
  icon: typeof Camera;
  hue: 'amber' | 'blue' | 'green' | 'red';
  pattern: 'thermal' | 'drone' | 'sat' | 'ir' | 'motion';
}

const FEEDS: Feed[] = [
  { id: 'CAM-01', label: 'THERMAL', location: 'SECTOR 7-G', icon: Flame, hue: 'red', pattern: 'thermal' },
  { id: 'CAM-02', label: 'DRONE-RECON', location: 'GRID 42-N', icon: Radio, hue: 'blue', pattern: 'drone' },
  { id: 'CAM-03', label: 'SATELLITE', location: 'ORBIT-3', icon: Satellite, hue: 'amber', pattern: 'sat' },
  { id: 'CAM-04', label: 'INFRARED', location: 'PERIMETER-B', icon: Camera, hue: 'green', pattern: 'ir' },
  { id: 'CAM-05', label: 'MOTION TRACK', location: 'VAULT-X', icon: Activity, hue: 'amber', pattern: 'motion' },
  { id: 'CAM-06', label: 'CCTV', location: 'CMD-CTR', icon: Video, hue: 'blue', pattern: 'thermal' },
];

const HUE: Record<Feed['hue'], string> = {
  amber: 'hsl(var(--tactical-amber))',
  blue: 'hsl(var(--tactical-blue))',
  green: 'hsl(var(--tactical-green))',
  red: 'hsl(var(--tactical-red))',
};

function FeedCanvas({ pattern, hue }: { pattern: Feed['pattern']; hue: Feed['hue'] }) {
  const color = HUE[hue];
  // Decorative SVG that hints at each feed type
  if (pattern === 'thermal') {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full">
        <defs>
          <radialGradient id={`th-${hue}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="70%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="160" height="100" fill="#0a0f1c" />
        <circle cx="60" cy="55" r="34" fill={`url(#th-${hue})`} />
        <circle cx="110" cy="40" r="22" fill={`url(#th-${hue})`} opacity="0.6" />
        <circle cx="120" cy="75" r="14" fill={`url(#th-${hue})`} opacity="0.7" />
      </svg>
    );
  }
  if (pattern === 'sat') {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full">
        <rect width="160" height="100" fill="#050a14" />
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={(i * 37) % 160} cy={(i * 23) % 100} r={Math.random() * 1.2} fill={color} opacity={0.6} />
        ))}
        <path d="M0,70 Q60,30 160,55" stroke={color} strokeWidth="0.6" fill="none" opacity="0.7" />
        <circle cx="80" cy="50" r="3" fill={color}>
          <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }
  if (pattern === 'drone') {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full">
        <rect width="160" height="100" fill="#070d1a" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1="0" x2="160" y1={i * 14} y2={i * 14} stroke={color} strokeWidth="0.3" opacity="0.25" />
        ))}
        <polygon points="80,40 95,65 65,65" fill={color} opacity="0.8" />
        <circle cx="80" cy="52" r="20" stroke={color} strokeWidth="0.8" fill="none" opacity="0.6" />
      </svg>
    );
  }
  if (pattern === 'ir') {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-full">
        <rect width="160" height="100" fill="#06120a" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={i * 14} y="0" width="6" height="100" fill={color} opacity={0.05 + (i % 4) * 0.08} />
        ))}
        <ellipse cx="100" cy="55" rx="22" ry="14" fill={color} opacity="0.4" />
      </svg>
    );
  }
  // motion
  return (
    <svg viewBox="0 0 160 100" className="w-full h-full">
      <rect width="160" height="100" fill="#0a0a14" />
      <rect x="40" y="35" width="40" height="40" stroke={color} strokeDasharray="3 2" fill="none" opacity="0.8" />
      <circle cx="60" cy="55" r="2" fill={color}>
        <animate attributeName="cx" values="60;110;60" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="44" y="32" fontSize="6" fill={color} fontFamily="monospace">TARGET LOCK</text>
    </svg>
  );
}

export default function SurveillanceFeed() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass holo-border rounded">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-tactical-blue" />
          <span className="text-xs font-tactical text-tactical-blue tracking-widest">// Live Surveillance Grid</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-tactical text-tactical-red flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tactical-red pulse-dot" /> REC
          </span>
          <span className="text-[9px] font-tactical text-muted-foreground tabular-nums">
            T+{String(tick).padStart(4, '0')}s
          </span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEEDS.map(f => (
          <div key={f.id} className="relative rounded border border-border/60 overflow-hidden group" style={{ boxShadow: `inset 0 0 0 1px ${HUE[f.hue]}22` }}>
            <div className="relative aspect-video bg-black scanline">
              <FeedCanvas pattern={f.pattern} hue={f.hue} />
              {/* HUD corners */}
              {([['top-1 left-1', 'border-t border-l'], ['top-1 right-1', 'border-t border-r'], ['bottom-1 left-1', 'border-b border-l'], ['bottom-1 right-1', 'border-b border-r']] as const).map(([pos, b], i) => (
                <span key={i} className={`absolute ${pos} w-3 h-3 ${b}`} style={{ borderColor: HUE[f.hue] }} />
              ))}
              {/* Top overlay */}
              <div className="absolute top-1.5 left-3 right-3 flex items-center justify-between text-[9px] font-tactical">
                <span className="flex items-center gap-1" style={{ color: HUE[f.hue] }}>
                  <f.icon className="w-3 h-3" /> {f.label}
                </span>
                <span className="text-tactical-red flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tactical-red pulse-dot" /> LIVE
                </span>
              </div>
              {/* Bottom overlay */}
              <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[9px] font-tactical text-foreground/80">
                <span>{f.id} • {f.location}</span>
                <span className="tabular-nums">{new Date().toISOString().substring(11, 19)}</span>
              </div>
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                <div className="w-6 h-px" style={{ background: HUE[f.hue] }} />
                <div className="h-6 w-px absolute" style={{ background: HUE[f.hue] }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
