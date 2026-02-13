import PageHeader from '@/components/PageHeader';
import { ShieldCheck } from 'lucide-react';

const COMPLIANCE_DATA = [
  { id: '1', category: 'Safety Protocol', risk: 'Medium', status: 'Compliant', lastReview: '2024-08-15', notes: 'All safety protocols met' },
  { id: '2', category: 'Data Handling', risk: 'High', status: 'Under Review', lastReview: '2024-09-01', notes: 'Encryption upgrade pending' },
  { id: '3', category: 'Environmental', risk: 'Low', status: 'Compliant', lastReview: '2024-07-20', notes: 'ISO 14001 certified' },
  { id: '4', category: 'Export Control', risk: 'Critical', status: 'Non-Compliant', lastReview: '2024-09-10', notes: 'ITAR review needed' },
  { id: '5', category: 'Personnel Security', risk: 'High', status: 'Compliant', lastReview: '2024-08-25', notes: 'Background checks current' },
  { id: '6', category: 'Cyber Operations', risk: 'Critical', status: 'Under Review', lastReview: '2024-09-05', notes: 'Penetration test scheduled' },
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
  return (
    <div>
      <PageHeader title="Compliance & Risk" subtitle="Regulatory compliance monitoring" icon={ShieldCheck} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Risk Level</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Last Review</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_DATA.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs font-tactical text-foreground">{c.category}</td>
                  <td className={`px-4 py-3 text-xs font-tactical ${RISK_COLORS[c.risk]}`}>{c.risk}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-tactical rounded ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastReview}</td>
                  <td className="px-4 py-3 text-xs text-foreground/70">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
