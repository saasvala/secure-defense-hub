import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

type FieldValue = string | number;

interface Props<T extends Record<string, unknown>> {
  open: boolean;
  title: string;
  fields: FieldDef[];
  initial?: Partial<T>;
  onClose: () => void;
  onSubmit: (values: T) => void;
  submitLabel?: string;
  children?: ReactNode;
}

export default function CrudModal<T extends Record<string, unknown>>({
  open, title, fields, initial, onClose, onSubmit, submitLabel = 'SAVE',
}: Props<T>) {
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const init: Record<string, FieldValue> = {};
      fields.forEach(f => {
        const v = (initial as Record<string, unknown> | undefined)?.[f.key];
        if (typeof v === 'string' || typeof v === 'number') {
          init[f.key] = v;
        } else {
          init[f.key] = f.type === 'number' ? 0 : '';
        }
      });
      setValues(init);
      setError('');
    }
  }, [open, initial, fields]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (values[f.key] === '' || values[f.key] === undefined || values[f.key] === null)) {
        setError(`${f.label} is required`);
        return;
      }
    }
    onSubmit(values as T);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-primary/30 rounded shadow-xl glow-amber max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-xs font-tactical text-primary">[ {title} ]</h3>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/30" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-tactical text-muted-foreground mb-1">
                {f.label}{f.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={values[f.key] ?? ''}
                  onChange={e => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-tactical text-foreground focus:outline-none focus:border-primary resize-none"
                />
              ) : f.type === 'select' ? (
                <select
                  value={values[f.key] ?? ''}
                  onChange={e => setValues({ ...values, [f.key]: e.target.value })}
                  className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">— Select —</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={e => setValues({ ...values, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-tactical text-foreground focus:outline-none focus:border-primary"
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-destructive text-[11px] font-tactical bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-tactical rounded hover:bg-secondary/80"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90"
            >
              [ {submitLabel} ]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
