import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { Shield, KeyRound, AlertTriangle } from 'lucide-react';

export default function LicenseScreen() {
  const { activateLicense } = useAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setTimeout(() => {
      const result = activateLicense(key);
      if (!result) setError(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded border border-primary/30 bg-card mb-4 glow-amber">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-tactical text-primary animate-flicker">
            Defense Research Org
          </h1>
          <p className="text-sm text-muted-foreground font-tactical mt-2">
            Management System v1.0
          </p>
        </div>

        {/* License Input */}
        <div className="bg-card border border-border p-6 rounded">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="font-tactical text-xs text-muted-foreground">License Activation Required</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-tactical text-muted-foreground mb-2">
                Enter License Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(false); }}
                placeholder="DRO-XXXX-XXXXX-XXXX"
                className="w-full bg-input border border-border rounded px-4 py-3 text-foreground font-tactical text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs font-tactical bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                <AlertTriangle className="w-3 h-3" />
                <span>Invalid License Key — Access Denied</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!key.trim() || loading}
              className="w-full bg-primary text-primary-foreground font-tactical text-sm py-3 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-amber"
            >
              {loading ? '[ VERIFYING... ]' : '[ ACTIVATE SYSTEM ]'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-tactical text-center">
              Device-bound activation • Offline verified • Encrypted storage
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <span className="text-[10px] text-muted-foreground/60 font-tactical">
            Powered by Software Vala™
          </span>
        </div>
      </div>
    </div>
  );
}
