import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { Shield, Lock, AlertTriangle } from 'lucide-react';



export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    // Pre-login integrity check: guarantees the default Super Admin exists.
    ensureSuperAdminExists();
    setTimeout(() => {
      const result = login(username, password);
      if (!result) setError(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded border border-primary/30 bg-card mb-4 glow-amber">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-tactical text-primary">DRO System</h1>
          <p className="text-xs text-muted-foreground font-tactical mt-2">Authorized Personnel Only</p>
        </div>

        <div className="bg-card border border-border p-6 rounded">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-tactical text-xs text-muted-foreground">Secure Login</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(false); }}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-body text-sm normal-case tracking-normal focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                style={{ textTransform: 'none' }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-body text-sm normal-case tracking-normal focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                style={{ textTransform: 'none' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-tactical bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                <AlertTriangle className="w-3 h-3" />
                <span>Authentication Failed — Access Denied</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!username || !password || loading}
              className="w-full bg-primary text-primary-foreground font-tactical text-sm py-3 rounded hover:bg-primary/90 disabled:opacity-50 transition-all glow-amber"
            >
              {loading ? '[ AUTHENTICATING... ]' : '[ LOGIN ]'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-3 h-3 text-primary" />
              <span className="font-tactical text-[10px] text-muted-foreground uppercase tracking-wider">
                Default Super Admin
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-foreground/90 bg-input/50 border border-border/60 rounded px-3 py-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">user:</span>
                <span className="truncate">{DEFAULT_SUPER_ADMIN.username}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">pass:</span>
                <span className="truncate">{DEFAULT_SUPER_ADMIN.password}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername(DEFAULT_SUPER_ADMIN.username);
                setPassword(DEFAULT_SUPER_ADMIN.password);
                setError(false);
              }}
              className="mt-2 w-full text-[10px] font-tactical text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/50 rounded py-1.5 transition-colors"
            >
              [ AUTO-FILL CREDENTIALS ]
            </button>
          </div>
        </div>


        <div className="text-center mt-6">
          <span className="text-[10px] text-muted-foreground/60 font-tactical">Powered by Software Vala™</span>
        </div>
      </div>
    </div>
  );
}
