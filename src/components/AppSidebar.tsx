import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, FolderKanban, FileSearch, Cpu,
  FlaskConical, KeyRound, ShieldCheck, Package, FileBarChart,
  ClipboardList, HardDrive, Users, LogOut, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/programs', label: 'Programs', icon: FolderKanban },
  { path: '/projects', label: 'Projects', icon: FileSearch },
  { path: '/prototypes', label: 'Prototypes', icon: Cpu },
  { path: '/field-tests', label: 'Field Tests', icon: FlaskConical },
  { path: '/clearance', label: 'Clearance', icon: KeyRound },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/assets', label: 'Assets', icon: Package },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/audit', label: 'Audit Logs', icon: ClipboardList },
  { path: '/backup', label: 'Backup', icon: HardDrive },
];

const ADMIN_ITEMS = [
  { path: '/users', label: 'User Mgmt', icon: Users },
];

export default function AppSidebar() {
  const { currentUser, currentRole, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = isSuperAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <aside className="w-60 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
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
              onClick={() => navigate(item.path)}
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
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3">
          <p className="text-xs font-tactical text-sidebar-foreground truncate">{currentUser?.username}</p>
          <p className="text-[9px] font-tactical text-sidebar-foreground/50 truncate">{currentRole?.name}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-tactical text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span>Logout</span>
        </button>
        <p className="text-[8px] text-sidebar-foreground/30 font-tactical mt-3 text-center">
          Powered by Software Vala™
        </p>
      </div>
    </aside>
  );
}
