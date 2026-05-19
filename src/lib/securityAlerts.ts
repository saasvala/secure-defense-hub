// In-memory security alert feed — captures readiness flips and other security events.
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
let alerts: SecurityAlert[] = [];
const listeners = new Set<(a: SecurityAlert[]) => void>();

export const securityAlerts = {
  push(a: Omit<SecurityAlert, 'id' | 'ts'>) {
    const full: SecurityAlert = { ...a, id: crypto.randomUUID(), ts: Date.now() };
    alerts = [full, ...alerts].slice(0, MAX);
    listeners.forEach(l => l(alerts));
    return full;
  },
  ack(id: string) {
    alerts = alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a);
    listeners.forEach(l => l(alerts));
  },
  clear() {
    alerts = [];
    listeners.forEach(l => l(alerts));
  },
  all() { return alerts; },
  unacked() { return alerts.filter(a => !a.acknowledged); },
  subscribe(fn: (a: SecurityAlert[]) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
