import { type LucideIcon, Inbox } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title = 'NO DATA', message = 'No records to display', action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border rounded bg-secondary/10">
      <div className="w-12 h-12 rounded border border-border bg-card flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground/60" />
      </div>
      <p className="text-xs font-tactical text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
