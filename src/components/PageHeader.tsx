import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-tactical text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground font-body mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
