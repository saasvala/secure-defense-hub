import { type ReactNode } from 'react';
import { useAuth } from '@/context/useAuth';
import { can, type ModuleKey } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';

interface Props { module: ModuleKey; children: ReactNode }

export default function RouteGuard({ module, children }: Props) {
  const { currentRole } = useAuth();
  if (!can(currentRole?.name, module, 'view')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-card border border-destructive/30 rounded p-6">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="text-sm font-tactical text-destructive mb-2">ACCESS DENIED</h2>
          <p className="text-xs text-muted-foreground">
            Your clearance role <span className="text-foreground font-tactical">{currentRole?.name || 'UNKNOWN'}</span> is not authorized to view <span className="text-foreground font-tactical">{module.toUpperCase()}</span>.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
