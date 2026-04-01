import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import { Package, Wrench, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const LIFECYCLE_FLAGS: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  operational: { icon: CheckCircle2, label: 'ACTIVE LIFECYCLE', color: 'text-tactical-green' },
  maintenance: { icon: Wrench, label: 'MAINTENANCE REQUIRED', color: 'text-tactical-amber' },
  decommissioned: { icon: XCircle, label: 'END OF LIFE', color: 'text-muted-foreground' },
};

export default function Assets() {
  const assets = store.getAssets();
  const inventory = store.getInventory();

  return (
    <div>
      <PageHeader title="Inventory & Assets" subtitle={`${assets.length} assets tracked`} icon={Package} />
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-tactical-green/20 rounded p-3">
            <p className="text-[10px] font-tactical text-muted-foreground">Operational</p>
            <p className="text-xl font-tactical text-tactical-green">{assets.filter(a => a.status === 'operational').length}</p>
          </div>
          <div className="bg-card border border-tactical-amber/20 rounded p-3">
            <p className="text-[10px] font-tactical text-muted-foreground">Maintenance</p>
            <p className="text-xl font-tactical text-tactical-amber">{assets.filter(a => a.status === 'maintenance').length}</p>
          </div>
          <div className="bg-card border border-border rounded p-3">
            <p className="text-[10px] font-tactical text-muted-foreground">Decommissioned</p>
            <p className="text-xl font-tactical text-muted-foreground">{assets.filter(a => a.status === 'decommissioned').length}</p>
          </div>
        </div>

        {/* Assets with Lifecycle */}
        <div className="space-y-3">
          {assets.map(a => {
            const inv = inventory.find(i => i.asset_id === a.id);
            const lifecycle = LIFECYCLE_FLAGS[a.status] || LIFECYCLE_FLAGS.operational;
            const LcIcon = lifecycle.icon;

            return (
              <div key={a.id} className={`bg-card border rounded overflow-hidden ${
                a.status === 'maintenance' ? 'border-tactical-amber/30' :
                a.status === 'decommissioned' ? 'border-border' :
                'border-border'
              }`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-xs font-tactical text-foreground">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded">{a.type}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Lifecycle Flag */}
                    <div className="flex items-center gap-1.5">
                      <LcIcon className={`w-3 h-3 ${lifecycle.color}`} />
                      <span className={`text-[9px] font-tactical ${lifecycle.color}`}>{lifecycle.label}</span>
                    </div>
                    <ImmutableBadge state="versioned" />
                  </div>
                </div>
                <div className="px-4 py-2 bg-secondary/10 border-t border-border/50 flex items-center gap-6 text-[10px]">
                  <span className="text-muted-foreground">QTY: <strong className="text-foreground">{inv?.qty || 0}</strong></span>
                  <span className="text-muted-foreground">LOC: <strong className="text-foreground">{inv?.location || '—'}</strong></span>
                  {a.status === 'maintenance' && (
                    <span className="flex items-center gap-1 text-tactical-amber">
                      <AlertTriangle className="w-3 h-3" /> Maintenance flag active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
