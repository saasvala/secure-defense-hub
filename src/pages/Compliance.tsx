import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ImmutableBadge from '@/components/ImmutableBadge';
import { ShieldCheck, AlertTriangle, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const COMPLIANCE_DATA = [
  { id: '1', category: 'Safety Protocol', risk: 'Medium', status: 'Compliant', lastReview: '2024-08-15', notes: 'All safety protocols met', actions: [] },
  { id: '2', category: 'Data Handling', risk: 'High', status: 'Under Review', lastReview: '2024-09-01', notes: 'Encryption upgrade pending', actions: ['Upgrade AES-256 encryption', 'Update data handling SOP'] },
  { id: '3', category: 'Environmental', risk: 'Low', status: 'Compliant', lastReview: '2024-07-20', notes: 'ISO 14001 certified', actions: [] },
  { id: '4', category: 'Export Control', risk: 'Critical', status: 'Non-Compliant', lastReview: '2024-09-10', notes: 'ITAR review needed', actions: ['Complete ITAR audit', 'Submit Form DSP-73', 'Brief legal team'] },
  { id: '5', category: 'Personnel Security', risk: 'High', status: 'Compliant', lastReview: '2024-08-25', notes: 'Background checks current', actions: [] },
  { id: '6', category: 'Cyber Operations', risk: 'Critical', status: 'Under Review', lastReview: '2024-09-05', notes: 'Penetration test scheduled', actions: ['Execute penetration test', 'Patch CVE-2024-XXXX'] },
];

const RISK_COLORS: Record<string, string> = {
  Low: 'text-tactical-green',
  Medium: 'text-tactical-amber',
  High: 'text-tactical-red',
  Critical: 'text-destructive font-bold',
};

const STATUS_COLORS: Record<string, string> = {
  Compliant: 'bg-tactical-green/10 text-tactical-green border border-tactical-green/30',
  'Under Review': 'bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/30',
  'Non-Compliant': 'bg-destructive/10 text-destructive border border-destructive/30',
};

export default function Compliance() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const violations = COMPLIANCE_DATA.filter(c => c.status === 'Non-Compliant');

  return (
    <div>
      <PageHeader title="Compliance & Risk" subtitle="Regulatory compliance monitoring" icon={ShieldCheck} />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Violation Alerts Banner */}
        {violations.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-tactical text-destructive mb-2">
                {violations.length} COMPLIANCE VIOLATION{violations.length > 1 ? 'S' : ''} DETECTED
              </p>
              {violations.map(v => (
                <div key={v.id} className="flex items-center gap-2 mb-1">
                  <Bell className="w-3 h-3 text-destructive/70" />
                  <span className="text-[11px] text-destructive/80">{v.category}: {v.notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Items */}
        <div className="space-y-3">
          {COMPLIANCE_DATA.map(c => (
            <div key={c.id} className={`bg-card border rounded overflow-hidden ${
              c.status === 'Non-Compliant' ? 'border-destructive/30' :
              c.status === 'Under Review' ? 'border-tactical-amber/20' :
              'border-border'
            }`}>
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/10"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-tactical text-foreground">{c.category}</span>
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-tactical rounded ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  <span className={`text-[10px] font-tactical ${RISK_COLORS[c.risk]}`}>RISK: {c.risk}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImmutableBadge state={c.status === 'Compliant' ? 'verified' : 'immutable'} />
                  <span className="text-[10px] text-muted-foreground">{c.lastReview}</span>
                  {expanded === c.id ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </div>
              </div>

              {expanded === c.id && (
                <div className="px-4 py-3 border-t border-border bg-secondary/5">
                  <p className="text-xs text-foreground/70 mb-2">{c.notes}</p>
                  {c.actions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-tactical text-muted-foreground mb-1">Required Actions:</p>
                      {c.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 ml-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-tactical-amber" />
                          <span className="text-[11px] text-foreground/60">{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
