import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title = 'CONFIRM ACTION', message, confirmLabel = 'CONFIRM', destructive, onConfirm, onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm bg-card border border-destructive/30 rounded p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className={`w-5 h-5 shrink-0 ${destructive ? 'text-destructive' : 'text-tactical-amber'}`} />
          <div>
            <h3 className="text-xs font-tactical text-foreground mb-1">[ {title} ]</h3>
            <p className="text-[11px] text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button onClick={onCancel} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-[11px] font-tactical rounded hover:bg-secondary/80">
            [ CANCEL ]
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-[11px] font-tactical rounded ${
              destructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            [ {confirmLabel} ]
          </button>
        </div>
      </div>
    </div>
  );
}
