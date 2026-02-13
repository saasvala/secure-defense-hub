import { useState } from 'react';
import { store, genId } from '@/lib/store';
import PageHeader from '@/components/PageHeader';
import { HardDrive, Download, Upload } from 'lucide-react';

export default function Backup() {
  const [backups, setBackups] = useState(store.getBackups());

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
          window.location.reload();
        } catch { alert('Invalid backup file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div>
      <PageHeader
        title="Backup / Restore"
        subtitle="System data management"
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
      <div className="p-6">
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Size</th>
                <th className="px-4 py-3 text-left text-[10px] font-tactical text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.id} className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-foreground">{new Date(b.date).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.size}</td>
                  <td className="px-4 py-3 text-xs text-tactical-green font-tactical">{b.status}</td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-xs text-muted-foreground">No backups created yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
