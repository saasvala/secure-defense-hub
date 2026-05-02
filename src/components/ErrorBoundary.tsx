import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-destructive/30 rounded p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h1 className="text-sm font-tactical text-destructive mb-2">SYSTEM FAULT</h1>
            <p className="text-xs text-muted-foreground font-body mb-4 break-words">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.reset(); window.location.href = '/dashboard'; }}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90"
            >
              [ RETURN TO DASHBOARD ]
            </button>
            <p className="text-[9px] text-muted-foreground/50 font-tactical mt-4">Powered by Software Vala™</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
