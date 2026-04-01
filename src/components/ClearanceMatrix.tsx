import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

const CLEARANCE_LEVELS = [
  { level: 'L5', name: 'TOP SECRET / SCI', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  { level: 'L4', name: 'TOP SECRET', color: 'text-tactical-red', bg: 'bg-tactical-red/10 border-tactical-red/30' },
  { level: 'L3', name: 'SECRET', color: 'text-tactical-amber', bg: 'bg-tactical-amber/10 border-tactical-amber/30' },
  { level: 'L2', name: 'CONFIDENTIAL', color: 'text-tactical-blue', bg: 'bg-tactical-blue/10 border-tactical-blue/30' },
  { level: 'L1', name: 'UNCLASSIFIED', color: 'text-tactical-green', bg: 'bg-tactical-green/10 border-tactical-green/30' },
];

const MODULES = ['Programs', 'Projects', 'Prototypes', 'Field Tests', 'Assets', 'Clearance', 'Audit'];

const ACCESS_MATRIX: Record<string, Record<string, 'full' | 'read' | 'masked' | 'denied'>> = {
  L5: { Programs: 'full', Projects: 'full', Prototypes: 'full', 'Field Tests': 'full', Assets: 'full', Clearance: 'full', Audit: 'full' },
  L4: { Programs: 'full', Projects: 'full', Prototypes: 'full', 'Field Tests': 'full', Assets: 'read', Clearance: 'read', Audit: 'read' },
  L3: { Programs: 'read', Projects: 'read', Prototypes: 'read', 'Field Tests': 'read', Assets: 'read', Clearance: 'masked', Audit: 'denied' },
  L2: { Programs: 'read', Projects: 'masked', Prototypes: 'masked', 'Field Tests': 'denied', Assets: 'read', Clearance: 'denied', Audit: 'denied' },
  L1: { Programs: 'masked', Projects: 'denied', Prototypes: 'denied', 'Field Tests': 'denied', Assets: 'masked', Clearance: 'denied', Audit: 'denied' },
};

const ACCESS_STYLES: Record<string, string> = {
  full: 'bg-tactical-green/20 text-tactical-green',
  read: 'bg-tactical-blue/15 text-tactical-blue',
  masked: 'bg-tactical-amber/15 text-tactical-amber',
  denied: 'bg-destructive/10 text-destructive/60',
};

interface Props {
  compact?: boolean;
}

export default function ClearanceMatrix({ compact = false }: Props) {
  const [secureView, setSecureView] = useState(false);

  return (
    <div className="bg-card border border-border rounded">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-tactical text-muted-foreground">Clearance Access Matrix</span>
        </div>
        <button
          onClick={() => setSecureView(!secureView)}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-tactical rounded border border-border hover:border-primary/30 transition-colors text-muted-foreground hover:text-primary"
        >
          {secureView ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {secureView ? 'MASKED' : 'VISIBLE'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-tactical text-muted-foreground">Level</th>
              {MODULES.map(m => (
                <th key={m} className="px-3 py-2 text-center text-[10px] font-tactical text-muted-foreground">{compact ? m.slice(0, 4) : m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLEARANCE_LEVELS.map(cl => (
              <tr key={cl.level} className="border-b border-border/30">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-tactical rounded border ${cl.bg}`}>{cl.level}</span>
                    {!compact && <span className={`text-[10px] font-tactical ${cl.color}`}>{secureView ? '██████' : cl.name}</span>}
                  </div>
                </td>
                {MODULES.map(mod => {
                  const access = ACCESS_MATRIX[cl.level][mod];
                  return (
                    <td key={mod} className="px-3 py-2 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-tactical rounded ${ACCESS_STYLES[access]}`}>
                        {secureView && access !== 'denied' ? '███' : access.toUpperCase()}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
