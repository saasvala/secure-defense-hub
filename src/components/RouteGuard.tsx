import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { can, type ModuleKey } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';

interface Props { module: ModuleKey; children: ReactNode }

export default function RouteGuard({ module, children }: Props) {
  const { currentRole, realRole, impersonatedRoleName, switchRole } = useAuth();
  const navigate = useNavigate();

  // The real Super Admin is never locked out of a module — impersonation only
  // previews another role's view and must not remove owner access.
  const isRealSuperAdmin = realRole?.name === 'Super Admin';

  if (!isRealSuperAdmin && !can(currentRole?.name, module, 'view')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-card border border-destructive/30 rounded p-6">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="text-sm font-tactical text-destructive mb-2">ACCESS DENIED</h2>
          <p className="text-xs text-muted-foreground">
            Your clearance role <span className="text-foreground font-tactical">{currentRole?.name || 'UNKNOWN'}</span> is not authorized to view <span className="text-foreground font-tactical">{module.toUpperCase()}</span>.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-3 py-2 bg-primary text-primary-foreground text-[10px] font-tactical rounded hover:bg-primary/90"
          >
            [ RETURN TO DASHBOARD ]
          </button>
        </div>
      </div>
    );
  }

  // Super Admin previewing a restricted role: show the page but offer a way back.
  const previewBlocked = isRealSuperAdmin && !!impersonatedRoleName && !can(currentRole?.name, module, 'view');

  return (
    <>
      {previewBlocked && (
        <div className="mx-4 mt-4 sm:mx-6 flex flex-wrap items-center gap-3 rounded border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-[10px] font-tactical text-primary">
            PREVIEW NOTICE — {impersonatedRoleName} cannot access {module.toUpperCase()}. Viewing with Super Admin override.
          </span>
          <button
            onClick={() => switchRole(null)}
            className="text-[10px] font-tactical text-primary underline hover:no-underline"
          >
            RESTORE SUPER ADMIN VIEW
          </button>
        </div>
      )}
      {children}
    </>
  );
}
