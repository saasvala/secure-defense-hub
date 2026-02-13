import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserCog } from 'lucide-react';

export default function SetupScreen() {
  const { completeSetup } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    completeSetup(username, password);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded border border-accent/30 bg-card mb-4 glow-green">
            <UserCog className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl font-tactical text-accent">System Initialized</h1>
          <p className="text-xs text-muted-foreground font-tactical mt-2">Configure Super Admin Account</p>
        </div>

        <div className="bg-card border border-border p-6 rounded">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
            <Shield className="w-4 h-4 text-accent" />
            <span className="font-tactical text-xs text-muted-foreground">First-Time Setup</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-destructive text-xs font-tactical">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-tactical text-sm py-3 rounded hover:bg-accent/90 transition-all glow-green"
            >
              [ CREATE SUPER ADMIN ]
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
