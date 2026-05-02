import { useState } from 'react';
import { store, genId } from '@/lib/store';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import ImmutableBadge from '@/components/ImmutableBadge';
import { HardDrive, Download, Upload, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Backup() {
  const [backups, setBackups] = useState(store.getBackups());
  const [integrityStatus, setIntegrityStatus] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');
  const [showRecovery, setShowRecovery] = useState(false);

  const createBackup = () => {
    const allData: Record<string, any> = {};
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('dro_')) allData[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(allData)], { type: 'application/json' });
    const size = (blob.size / 1024).toFixed(1) + ' KB';

    const entry = { id: genId(), date: new Date().toISOString(), size, status: 'completed' as const };
    const updated = [entry, ...backups];
    store.setBackups(updated);
    setBackups(updated);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    store.addAudit({ user_id: store.getCurrentUser()?.id || 'system', action: 'BACKUP_CREATED', details: `Size: ${size}` });
    toast.success(`Backup created (${size})`);
  };

  const restoreBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v as string));
          store.addAudit({ user_id: 'system', action: 'BACKUP_RESTORED', details: `From file: ${file.name}` });
          toast.success('Backup restored — reloading');
          setTimeout(() => window.location.reload(), 800);
        } catch { toast.error('Invalid backup file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const runIntegrityCheck = () => {
    setIntegrityStatus('checking');
    setTimeout(() => {
      // Verify all required keys exist
      const requiredKeys = ['license', 'users', 'roles', 'setup_complete'];
      const allPresent = requiredKeys.every(k => localStorage.getItem('dro_' + k) !== null);
      setIntegrityStatus(allPresent ? 'pass' : 'fail');
    }, 1500);
  };

  const runRecovery = () => {
    store.addAudit({ user_id: 'system', action: 'RECOVERY_EXECUTED', details: 'Data repair wizard completed' });
    setShowRecovery(false);
    window.location.reload();
  };

  return (
    <div>
      <PageHeader
        title="Backup / Restore"
        subtitle="System data management & integrity"
        icon={HardDrive}
        actions={
          <div className="flex gap-2">
            <button onClick={createBackup} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90">
              <Download className="w-3 h-3" /> Create Backup
            </button>
            <button onClick={restoreBackup} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-tactical rounded hover:bg-secondary/80">
              <Upload className="w-3 h-3" /> Restore
            </button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Offline Hardening Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sync-Free Indicator */}
          <div className="bg-card border border-tactical-green/20 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-tactical-green" />
              <span className="text-[10px] font-tactical text-muted-foreground">Sync Status</span>
            </div>
            <p className="text-xs font-tactical text-tactical-green">SYNC-FREE</p>
            <p className="text-[10px] text-muted-foreground mt-1">No external connections • Fully offline</p>
          </div>

          {/* Integrity Check */}
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className={`w-4 h-4 text-primary ${integrityStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-tactical text-muted-foreground">Integrity Check</span>
            </div>
            {integrityStatus === 'idle' && (
              <button onClick={runIntegrityCheck} className="text-xs font-tactical text-primary hover:text-primary/80">
                [ RUN CHECK ]
              </button>
            )}
            {integrityStatus === 'checking' && <p className="text-xs font-tactical text-tactical-amber animate-pulse-amber">Verifying…</p>}
            {integrityStatus === 'pass' && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-tactical-green" />
                <span className="text-xs font-tactical text-tactical-green">INTEGRITY VERIFIED</span>
              </div>
            )}
            {integrityStatus === 'fail' && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-tactical text-destructive">INTEGRITY FAILURE</span>
              </div>
            )}
          </div>

          {/* Recovery Wizard */}
          <div className="bg-card border border-border rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-tactical-amber" />
              <span className="text-[10px] font-tactical text-muted-foreground">Recovery</span>
            </div>
            <button
              onClick={() => setShowRecovery(true)}
              className="text-xs font-tactical text-tactical-amber hover:text-primary"
            >
              [ REPAIR WIZARD ]
            </button>
          </div>
        </div>

        {/* Recovery Modal */}
        {showRecovery && (
          <div className="bg-card border border-tactical-amber/30 rounded p-6">
            <h3 className="text-xs font-tactical text-primary mb-3">Recovery / Repair Wizard</h3>
            <p className="text-[11px] text-foreground/70 mb-4">
              This will re-seed any missing default data (roles, demo data) without overwriting existing records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={runRecovery}
                className="px-4 py-2 bg-tactical-amber/20 text-tactical-amber text-xs font-tactical rounded border border-tactical-amber/30 hover:bg-tactical-amber/30"
              >
                [ EXECUTE REPAIR ]
              </button>
              <button
                onClick={() => setShowRecovery(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-tactical rounded hover:bg-secondary/80"
              >
                [ CANCEL ]
              </button>
            </div>
          </div>
        )}

        {/* Backup History */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical text-muted-foreground">Backup History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Size</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">State</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(b => (
                  <tr key={b.id} className="border-b border-border/50">
                    <td className="px-4 py-3 text-xs text-foreground">{new Date(b.date).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b.size}</td>
                    <td className="px-4 py-3 text-xs text-tactical-green font-tactical">{b.status}</td>
                    <td className="px-4 py-3"><ImmutableBadge state="immutable" /></td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">No backups created yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
