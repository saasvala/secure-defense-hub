import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { can, type ModuleKey } from '@/lib/permissions';
import { store } from '@/lib/store';
import { getRoleDashboardRoute, isRouteRegistered } from '@/lib/routeRegistry';
import {
  Shield, LayoutDashboard, FolderKanban, FileSearch, Cpu,
  FlaskConical, KeyRound, ShieldCheck, Package, FileBarChart,
  ClipboardList, HardDrive, Users, LogOut, ChevronRight, ChevronDown,
  Settings, LayoutGrid, UserCog, Check,
} from 'lucide-react';

const ALL_ITEMS: { path: string; label: string; icon: typeof Shield; module: ModuleKey }[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { path: '/programs', label: 'Programs', icon: FolderKanban, module: 'programs' },
  { path: '/projects', label: 'Projects', icon: FileSearch, module: 'projects' },
  { path: '/prototypes', label: 'Prototypes', icon: Cpu, module: 'prototypes' },
  { path: '/field-tests', label: 'Field Tests', icon: FlaskConical, module: 'field-tests' },
  { path: '/clearance', label: 'Clearance', icon: KeyRound, module: 'clearance' },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck, module: 'compliance' },
  { path: '/assets', label: 'Assets', icon: Package, module: 'assets' },
  { path: '/reports', label: 'Reports', icon: FileBarChart, module: 'reports' },
  { path: '/audit', label: 'Audit Logs', icon: ClipboardList, module: 'audit' },
  { path: '/backup', label: 'Backup', icon: HardDrive, module: 'backup' },
  { path: '/users', label: 'User Mgmt', icon: Users, module: 'users' },
];

const ADMIN_ITEMS: { path: string; label: string; icon: typeof Shield }[] = [
  { path: '/admin/all-roles', label: 'All Roles Dashboard', icon: LayoutGrid },
];

interface Props {
  onNavigate?: () => void;
}

export default function AppSidebar({ onNavigate }: Props) {
  const { currentUser, currentRole, realRole, logout, isSuperAdmin, impersonatedRoleName, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = ALL_ITEMS.filter(i => can(currentRole?.name, i.module, 'view'));
  const adminActive = ADMIN_ITEMS.some(a => location.pathname === a.path);
  const [adminOpen, setAdminOpen] = useState(adminActive);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement | null>(null);

  const allRoles = useMemo(() => store.getRoles(), []);

  // Verify every role-switch target route is registered before enabling the dropdown.
  const switchableRoles = useMemo(
    () => allRoles
      .filter(r => r.name !== 'Super Admin')
      .map(r => ({ role: r, target: getRoleDashboardRoute(r.name), ok: isRouteRegistered(getRoleDashboardRoute(r.name)) })),
    [allRoles],
  );
  const defaultTarget = getRoleDashboardRoute('Super Admin');
  const defaultOk = isRouteRegistered(defaultTarget);
  const switcherEnabled = defaultOk && switchableRoles.some(r => r.ok);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const bad = switchableRoles.filter(r => !r.ok);
    if (!defaultOk) console.error('[RouteMap] Default dashboard route missing:', defaultTarget);
    if (bad.length) console.error('[RouteMap] Unregistered role-switch targets:', bad.map(b => `${b.role.name}→${b.target}`));
  }, [switchableRoles, defaultOk, defaultTarget]);

  useEffect(() => {
    if (!switcherOpen) return;
    const onClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [switcherOpen]);

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSwitch = (roleName: string | null) => {
    switchRole(roleName);
    setSwitcherOpen(false);
    navigate('/dashboard');
    onNavigate?.();
  };


  return (
    <aside className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-sidebar-primary" />
          <div>
            <h2 className="text-xs font-tactical text-sidebar-primary leading-none">DRO</h2>
            <p className="text-[9px] font-tactical text-sidebar-foreground/50 mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {items.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-tactical transition-all group ${
                active
                  ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </button>
          );
        })}

        {/* Admin Panel dropdown — Super Admin only */}
        {isSuperAdmin && (
          <div className="mt-2 border-t border-sidebar-border/60 pt-2">
            <button
              onClick={() => setAdminOpen(o => !o)}
              aria-expanded={adminOpen}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-tactical transition-all border-l-2 ${
                adminActive
                  ? 'text-sidebar-primary border-sidebar-primary bg-sidebar-accent/40'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-transparent'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Admin Panel</span>
              {adminOpen
                ? <ChevronDown className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />}
            </button>

            {adminOpen && (
              <div className="bg-sidebar-accent/20 border-l-2 border-sidebar-primary/30 ml-2">
                {ADMIN_ITEMS.map(a => {
                  const active = location.pathname === a.path;
                  return (
                    <button
                      key={a.path}
                      onClick={() => handleNav(a.path)}
                      className={`w-full flex items-center gap-3 pl-6 pr-4 py-2 text-[11px] font-tactical transition-colors ${
                        active
                          ? 'text-sidebar-primary bg-sidebar-accent'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
                      }`}
                    >
                      <a.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 text-left truncate">{a.label}</span>
                      {active && <ChevronRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-tactical text-sidebar-foreground truncate">{currentUser?.username}</p>
            <p className="text-[9px] font-tactical text-sidebar-foreground/50 truncate">
              {currentRole?.name}
              {impersonatedRoleName && (
                <span className="ml-1 text-tactical-amber">(view)</span>
              )}
            </p>
          </div>

          {/* Role switcher — Super Admin only */}
          {isSuperAdmin && (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(o => !o)}
                aria-label="Switch role view"
                aria-expanded={switcherOpen}
                title="Switch role dashboard"
                className={`p-1.5 rounded border text-[10px] font-tactical transition-colors ${
                  impersonatedRoleName
                    ? 'border-tactical-amber/50 text-tactical-amber bg-tactical-amber/10'
                    : 'border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <UserCog className="w-3.5 h-3.5" />
              </button>

              {switcherOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-56 max-h-72 overflow-y-auto bg-sidebar border border-sidebar-border rounded shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-sidebar-border">
                    <p className="text-[9px] font-tactical text-sidebar-foreground/60 uppercase tracking-wider">
                      Switch Dashboard View
                    </p>
                  </div>
                  <button
                    onClick={() => handleSwitch(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-tactical text-left transition-colors ${
                      !impersonatedRoleName
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
                    }`}
                  >
                    <Shield className="w-3 h-3 shrink-0" />
                    <span className="flex-1 truncate">Super Admin (Default)</span>
                    {!impersonatedRoleName && <Check className="w-3 h-3" />}
                  </button>
                  {allRoles
                    .filter(r => r.name !== 'Super Admin')
                    .map(r => {
                      const active = impersonatedRoleName === r.name;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSwitch(r.name)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-tactical text-left transition-colors ${
                            active
                              ? 'bg-sidebar-accent text-sidebar-primary'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60'
                          }`}
                        >
                          <LayoutDashboard className="w-3 h-3 shrink-0" />
                          <span className="flex-1 truncate">{r.name}</span>
                          {active && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick restore banner when impersonating */}
        {isSuperAdmin && impersonatedRoleName && (
          <button
            onClick={() => handleSwitch(null)}
            className="w-full mb-2 px-2 py-1.5 rounded border border-tactical-amber/40 bg-tactical-amber/10 text-tactical-amber text-[10px] font-tactical hover:bg-tactical-amber/20 transition-colors"
          >
            ↺ Restore Super Admin View
          </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-tactical text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Logout</span>
        </button>
        <p className="text-[8px] text-sidebar-foreground/30 font-tactical mt-3 text-center">
          Powered by Software Vala™ {realRole && realRole.name !== currentRole?.name ? '• Role View Active' : ''}
        </p>
      </div>
    </aside>
  );
}
