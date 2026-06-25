import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { ensureSuperAdminExists } from '@/lib/ensureSuperAdmin';
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
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
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
        </div>

        <div className="text-center mt-6">
          <span className="text-[10px] text-muted-foreground/60 font-tactical">Powered by Software Vala™</span>
        </div>
      </div>
    </div>
  );
}
