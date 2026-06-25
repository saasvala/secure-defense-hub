import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { Bell, Search, ShieldCheck, Lock, Cpu, Activity, ChevronDown, Check } from 'lucide-react';
import { store } from '@/lib/store';
import { getRoleDashboardRoute } from '@/lib/routeRegistry';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function TopCommandBar() {
  const { currentUser, currentRole, realRole, isSuperAdmin, impersonatedRoleName, switchRole } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [threat] = useState<'LOW' | 'ELEVATED' | 'HIGH'>('ELEVATED');
  const allRoles = store.getRoles();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const threatColor = threat === 'HIGH'
    ? 'text-tactical-red border-tactical-red/50 bg-tactical-red/10'
    : threat === 'ELEVATED'
      ? 'text-tactical-amber border-tactical-amber/50 bg-tactical-amber/10'
      : 'text-tactical-green border-tactical-green/50 bg-tactical-green/10';

  const utc = now.toISOString().substring(11, 19);
  const local = now.toLocaleTimeString([], { hour12: false });

  return (
    <div className="glass holo-border rounded px-3 py-2 flex items-center gap-3 flex-wrap">
      {/* Clock */}
      <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/40 border border-border/60">
        <Activity className="w-3 h-3 text-tactical-blue pulse-dot" />
        <div className="leading-tight">
          <p className="text-[9px] font-tactical text-muted-foreground tracking-widest">UTC</p>
          <p className="text-[11px] font-tactical text-tactical-blue tabular-nums">{utc}</p>
        </div>
        <div className="w-px h-6 bg-border/60 mx-1" />
        <div className="leading-tight">
          <p className="text-[9px] font-tactical text-muted-foreground tracking-widest">LOCAL</p>
          <p className="text-[11px] font-tactical text-foreground tabular-nums">{local}</p>
        </div>
      </div>

      {/* Threat level */}
      <div className={`px-2.5 py-1 rounded border text-[10px] font-tactical tracking-widest flex items-center gap-1.5 ${threatColor}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
        THREAT: {threat}
      </div>

      {/* Encryption */}
      <div className="px-2.5 py-1 rounded border border-tactical-green/40 bg-tactical-green/5 text-tactical-green text-[10px] font-tactical flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        AES-256 SECURE
      </div>

      {/* AI Online */}
      <div className="px-2.5 py-1 rounded border border-tactical-blue/40 bg-tactical-blue/5 text-tactical-blue text-[10px] font-tactical flex items-center gap-1.5">
        <Cpu className="w-3 h-3 animate-flicker" />
        AI ONLINE
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[160px] relative">
        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="// EXECUTE COMMAND…"
          className="w-full bg-secondary/40 border border-border/60 rounded pl-7 pr-2 py-1.5 text-[11px] font-tactical text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-tactical-blue/60 focus:bg-secondary/60 tracking-wider"
        />
      </div>

      {/* Bell */}
      <button className="relative p-1.5 rounded border border-border/60 text-tactical-amber hover:bg-secondary/60 transition-colors" aria-label="Notifications">
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-tactical-red pulse-dot" />
      </button>

      {/* Profile */}
      <div className="flex items-center gap-2 px-2 py-1 rounded border border-border/60 bg-secondary/40">
        <div className="w-6 h-6 rounded bg-primary/15 border border-primary/40 flex items-center justify-center">
          <ShieldCheck className="w-3 h-3 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-tactical text-foreground tracking-wider truncate max-w-[100px]">{currentUser?.username ?? 'OPERATOR'}</p>
          <p className="text-[8px] font-tactical text-tactical-blue/80 tracking-widest truncate max-w-[100px]">{currentRole?.name ?? 'GUEST'}</p>
        </div>
      </div>
    </div>
  );
}
