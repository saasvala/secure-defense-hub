import { ReactNode, useState } from 'react';
import AppSidebar from './AppSidebar';
import SessionBanner from './SessionBanner';
import { Menu, Shield, X } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left">
            <div className="relative">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 z-10 p-1 rounded text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-sidebar">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded text-sidebar-foreground/80 hover:bg-sidebar-accent"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-tactical text-primary">DRO</span>
          </div>
          <div className="w-8" />
        </div>

        <SessionBanner />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
