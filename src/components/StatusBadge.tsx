const STATUS_STYLES: Record<string, string> = {
  active: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
  operational: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
  success: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
  pass: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
  completed: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
  in_progress: 'bg-tactical-blue/10 text-tactical-blue border-tactical-blue/30',
  testing: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  review: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  pending: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  planning: 'bg-muted text-muted-foreground border-border',
  partial: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  suspended: 'bg-destructive/10 text-destructive border-destructive/30',
  fail: 'bg-destructive/10 text-destructive border-destructive/30',
  failure: 'bg-destructive/10 text-destructive border-destructive/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  locked: 'bg-destructive/10 text-destructive border-destructive/30',
  maintenance: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  decommissioned: 'bg-muted text-muted-foreground border-border',
  archived: 'bg-muted text-muted-foreground border-border',
  'TOP SECRET': 'bg-destructive/10 text-destructive border-destructive/30',
  SECRET: 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/30',
  CONFIDENTIAL: 'bg-tactical-blue/10 text-tactical-blue border-tactical-blue/30',
  UNCLASSIFIED: 'bg-tactical-green/10 text-tactical-green border-tactical-green/30',
};

import { forwardRef } from 'react';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className = '', ...rest }, ref) => {
    const style = STATUS_STYLES[status] || 'bg-muted text-muted-foreground border-border';
    return (
      <span
        ref={ref}
        className={`inline-flex px-2 py-0.5 text-[10px] font-tactical rounded border ${style} ${className}`}
        {...rest}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
