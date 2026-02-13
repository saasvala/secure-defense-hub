import { store } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Package } from 'lucide-react';

export default function Assets() {
  const assets = store.getAssets();
  const inventory = store.getInventory();

  return (
    <div>
      <PageHeader title="Inventory & Assets" subtitle={`${assets.length} assets tracked`} icon={Package} />
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Asset Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Qty</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Location</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const inv = inventory.find(i => i.asset_id === a.id);
                return (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 text-xs font-tactical text-foreground">{a.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-xs text-foreground">{inv?.qty || 0}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv?.location || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
