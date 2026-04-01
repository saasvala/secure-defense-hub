import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Wifi, WifiOff, Activity } from 'lucide-react';
import { store } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';

export default function SessionBanner() {
  const { currentUser, currentRole } = useAuth();
  const [sessionIntegrity, setSessionIntegrity] = useState<'secure' | 'warning'>('secure');
  const [time, setTime] = useState(new Date());
  const license = store.getLicense();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check session integrity
    const storedUser = store.getCurrentUser();
    if (currentUser && storedUser && storedUser.id !== currentUser.id) {
      setSessionIntegrity('warning');
    }
  }, [currentUser]);

  const isSecure = sessionIntegrity === 'secure';

  return (
    <div className={`flex items-center justify-between px-4 py-1.5 border-b text-[10px] font-tactical ${
      isSecure
        ? 'bg-tactical-green/5 border-tactical-green/20 text-tactical-green'
        : 'bg-destructive/5 border-destructive/20 text-destructive'
    }`}>
      <div className="flex items-center gap-4">
        {/* Session Status */}
        <div className="flex items-center gap-1.5">
          {isSecure ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
          <span>{isSecure ? 'SESSION SECURE' : 'SESSION COMPROMISED'}</span>
        </div>

        {/* Device Bind */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>DEVICE-BOUND</span>
        </div>

        {/* Offline Indicator */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <WifiOff className="w-3 h-3" />
          <span>OFFLINE MODE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* License Info */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>KEY: {license?.key?.slice(0, 12)}…</span>
        </div>

        {/* Clearance Level */}
        <span className="text-primary">{currentRole?.name || '—'}</span>

        {/* Clock */}
        <span className="text-muted-foreground tabular-nums">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  );
}
