import { store } from '@/lib/store';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { FileBarChart, Download } from 'lucide-react';

export default function Reports() {
  const programs = store.getPrograms();
  const projects = store.getProjects();
  const prototypes = store.getPrototypes();
  const tests = store.getFieldTests();

  const exportCSV = (data: readonly object[], filename: string) => {
    if (data.length === 0) { toast.error('No records to export'); return; }
    try {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(d => Object.values(d).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${filename}.csv`; a.click();
      URL.revokeObjectURL(url);
      store.addAudit({ user_id: store.getCurrentUser()?.id || 'unknown', action: 'EXPORT', details: `Exported ${filename}` });
      toast.success(`${filename}.csv exported (${data.length} records)`);
    } catch {
      toast.error('Export failed');
    }
  };

  const reports = [
    { name: 'Programs Report', count: programs.length, data: programs, file: 'programs_report' },
    { name: 'Projects Report', count: projects.length, data: projects, file: 'projects_report' },
    { name: 'Prototypes Report', count: prototypes.length, data: prototypes, file: 'prototypes_report' },
    { name: 'Field Tests Report', count: tests.length, data: tests, file: 'field_tests_report' },
  ];

  return (
    <div>
      <PageHeader title="Reports & Export" subtitle="Generate and download reports" icon={FileBarChart} />
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.name} className="bg-card border border-border rounded p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xs font-tactical text-foreground truncate">{r.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{r.count} records</p>
              </div>
              <button
                onClick={() => exportCSV(r.data, r.file)}
                disabled={r.count === 0}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-tactical rounded hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
