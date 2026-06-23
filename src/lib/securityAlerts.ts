// Persisted security alert feed — captures readiness flips and other security events.
// Stored in offline localStorage with lightweight obfuscation (XOR + base64) under dro_ prefix.
import { store } from '@/lib/store';

export type SecurityLevel = 'INFO' | 'DEGRADED' | 'COMPROMISED';

export interface SecurityAlert {
  id: string;
  ts: number;
  check: string;
  level: SecurityLevel;
  message: string;
  acknowledged?: boolean;
}

const MAX = 50;
const STORAGE_KEY = 'dro_security_alerts';
const CIPHER_KEY = 'DRO-SEC-VAULT-v1';

function xorCipher(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length));
  }
  return out;
}

function encrypt(data: string): string {
  try { return btoa(unescape(encodeURIComponent(xorCipher(data)))); }
  catch { return ''; }
}

function decrypt(blob: string): string {
  try { return xorCipher(decodeURIComponent(escape(atob(blob)))); }
  catch { return ''; }
}

function load(): SecurityAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const json = decrypt(raw);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch { return []; }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(alerts))); } catch { /* ignore quota */ }
}

let alerts: SecurityAlert[] = load();
const listeners = new Set<(a: SecurityAlert[]) => void>();

function emit() {
  persist();
  listeners.forEach(l => l(alerts));
}

function actor(): string {
  try { return store.getCurrentUser()?.id || 'system'; } catch { return 'system'; }
}

export const securityAlerts = {
  push(a: Omit<SecurityAlert, 'id' | 'ts'>) {
    const full: SecurityAlert = { ...a, id: crypto.randomUUID(), ts: Date.now() };
    alerts = [full, ...alerts].slice(0, MAX);
    emit();
    return full;
  },
  ack(id: string) {
    const target = alerts.find(a => a.id === id);
    if (!target || target.acknowledged) return;
    alerts = alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
    emit();
    store.addAudit({
      user_id: actor(),
      action: 'SECURITY_ALERT_ACK',
      details: `[${target.level}] ${target.check} — ${target.message}`,
    });
  },
  ackAll() {
    const pending = alerts.filter(a => !a.acknowledged).length;
    if (!pending) return;
    alerts = alerts.map(a => ({ ...a, acknowledged: true }));
    emit();
    store.addAudit({
      user_id: actor(),
      action: 'SECURITY_ALERT_ACK_ALL',
      details: `Acknowledged ${pending} alert${pending === 1 ? '' : 's'}`,
    });
  },
  clear() {
    const count = alerts.length;
    if (!count) return;
    alerts = [];
    emit();
    store.addAudit({
      user_id: actor(),
      action: 'SECURITY_ALERTS_CLEARED',
      details: `Cleared ${count} security alert${count === 1 ? '' : 's'} from feed`,
    });
  },
  all() { return alerts; },
  unacked() { return alerts.filter(a => !a.acknowledged); },
  subscribe(fn: (a: SecurityAlert[]) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
