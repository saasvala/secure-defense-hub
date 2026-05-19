import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-border bg-gradient-to-r from-background via-secondary/20 to-background overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-tactical-blue/60 to-transparent" />
      <div className="flex items-center gap-3 min-w-0 relative z-10">
        <div className="w-11 h-11 rounded bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0 glow-amber">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-tactical text-foreground truncate tracking-widest">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-tactical-blue/80 font-tactical mt-0.5 truncate">// {subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap relative z-10">{actions}</div>}
    </div>
  );
}
