import { useState } from 'react';
import { store, genId, type Asset, type InventoryItem } from '@/lib/store';
import { useAuth } from '@/context/useAuth';
import { can } from '@/lib/permissions';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImmutableBadge from '@/components/ImmutableBadge';
import EmptyState from '@/components/EmptyState';
import CrudModal, { type FieldDef } from '@/components/CrudModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { Package, Wrench, AlertTriangle, CheckCircle2, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';

const LIFECYCLE_FLAGS: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  operational: { icon: CheckCircle2, label: 'ACTIVE LIFECYCLE', color: 'text-tactical-green' },
  maintenance: { icon: Wrench, label: 'MAINTENANCE REQUIRED', color: 'text-tactical-amber' },
  decommissioned: { icon: XCircle, label: 'END OF LIFE', color: 'text-muted-foreground' },
};

interface AssetForm extends Partial<Asset> { qty?: number; location?: string }

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Asset Name', required: true },
  { key: 'type', label: 'Type', required: true, placeholder: 'Equipment / Computing / Facility / Vehicle' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'decommissioned', label: 'Decommissioned' },
  ]},
  { key: 'qty', label: 'Quantity', type: 'number' },
  { key: 'location', label: 'Storage Location', placeholder: 'e.g. Hangar A' },
];

export default function Assets() {
  const { currentRole, currentUser } = useAuth();
  const [assets, setAssets] = useState(store.getAssets());
  const [inventory, setInventory] = useState(store.getInventory());

  const [modal, setModal] = useState<{ open: boolean; editing?: Asset }>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const canCreate = can(currentRole?.name, 'assets', 'create');
  const canUpdate = can(currentRole?.name, 'assets', 'update');
  const canDelete = can(currentRole?.name, 'assets', 'delete');

  const refresh = () => { setAssets(store.getAssets()); setInventory(store.getInventory()); };

  const save = (vals: AssetForm) => {
    const all = store.getAssets();
    let assetId: string;
    if (modal.editing) {
      assetId = modal.editing.id;
      store.setAssets(all.map(a => a.id === assetId ? {
        ...a, name: vals.name!, type: vals.type!, status: vals.status as Asset['status'],
      } : a));
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'ASSET_UPDATED', details: `Asset: ${vals.name}` });
      toast.success(`Asset "${vals.name}" updated`);
    } else {
      const na: Asset = { id: genId(), name: vals.name!, type: vals.type!, status: vals.status as Asset['status'] };
      store.setAssets([na, ...all]);
      assetId = na.id;
      store.addAudit({ user_id: currentUser?.id || 'system', action: 'ASSET_CREATED', details: `Asset: ${na.name}` });
      toast.success(`Asset "${na.name}" registered`);
    }
    // upsert inventory
    const inv = store.getInventory();
    const existing = inv.find(i => i.asset_id === assetId);
    if (existing) {
      store.setInventory(inv.map(i => i.asset_id === assetId ? { ...i, qty: vals.qty ?? i.qty, location: vals.location ?? i.location } : i));
    } else {
      const item: InventoryItem = { id: genId(), asset_id: assetId, qty: vals.qty || 0, location: vals.location || '—' };
      store.setInventory([...inv, item]);
    }
    setModal({ open: false });
    refresh();
  };

  const del = () => {
    if (!confirmId) return;
    const target = assets.find(a => a.id === confirmId);
    store.setAssets(store.getAssets().filter(a => a.id !== confirmId));
    store.setInventory(store.getInventory().filter(i => i.asset_id !== confirmId));
    store.addAudit({ user_id: currentUser?.id || 'system', action: 'ASSET_DELETED', details: `Asset: ${target?.name}` });
    toast.success(`Asset "${target?.name}" deleted`);
    setConfirmId(null);
    refresh();
  };

  const getInitial = (a?: Asset): AssetForm | undefined => {
    if (!a) return undefined;
    const inv = inventory.find(i => i.asset_id === a.id);
    return { ...a, qty: inv?.qty, location: inv?.location };
  };

  return (
    <div>
      <PageHeader
        title="Inventory & Assets"
        subtitle={`${assets.length} assets tracked`}
        icon={Package}
        actions={canCreate && (
          <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
            <Plus className="w-3 h-3" /> New Asset
          </button>
        )}
      />
      <div className="p-4 sm:p-6">
        {assets.length === 0 && (
          <EmptyState icon={Package} title="NO ASSETS" message="No assets in inventory yet." />
        )}
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

        <div className="space-y-3">
          {assets.map(a => {
            const inv = inventory.find(i => i.asset_id === a.id);
            const lifecycle = LIFECYCLE_FLAGS[a.status] || LIFECYCLE_FLAGS.operational;
            const LcIcon = lifecycle.icon;

            return (
              <div key={a.id} className={`bg-card border rounded overflow-hidden ${
                a.status === 'maintenance' ? 'border-tactical-amber/30' : 'border-border'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-tactical text-foreground truncate">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded">{a.type}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <LcIcon className={`w-3 h-3 ${lifecycle.color}`} />
                      <span className={`text-[9px] font-tactical ${lifecycle.color}`}>{lifecycle.label}</span>
                    </div>
                    <ImmutableBadge state="versioned" />
                    {canUpdate && (
                      <button onClick={() => setModal({ open: true, editing: a })} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => setConfirmId(a.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-4 py-2 bg-secondary/10 border-t border-border/50 flex items-center gap-6 text-[10px] flex-wrap">
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

      <CrudModal
        open={modal.open}
        title={modal.editing ? 'EDIT ASSET' : 'NEW ASSET'}
        fields={FIELDS}
        initial={getInitial(modal.editing)}
        onClose={() => setModal({ open: false })}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="DELETE ASSET"
        message="Asset and its inventory record will be removed."
        destructive confirmLabel="DELETE"
        onConfirm={del}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
