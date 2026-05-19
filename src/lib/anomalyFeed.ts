// Lightweight in-memory anomaly/event feed for system monitoring.
// Tracks metric status transitions and notifies subscribers.

export type AnomalySeverity = 'NOMINAL' | 'ACTIVE' | 'WARN' | 'CRITICAL';

export interface AnomalyEvent {
  id: string;
  ts: number;
  metricKey: string;
  metricLabel: string;
  from: AnomalySeverity;
  to: AnomalySeverity;
  value: number;
  unit: string;
  detail: string;
}

const MAX_EVENTS = 60;
let events: AnomalyEvent[] = [];
const listeners = new Set<(e: AnomalyEvent[]) => void>();

const severityRank: Record<AnomalySeverity, number> = {
  NOMINAL: 0, ACTIVE: 1, WARN: 2, CRITICAL: 3,
};

export const anomalyFeed = {
  push(ev: Omit<AnomalyEvent, 'id' | 'ts'>) {
    const full: AnomalyEvent = { ...ev, id: crypto.randomUUID(), ts: Date.now() };
    events = [full, ...events].slice(0, MAX_EVENTS);
    listeners.forEach(l => l(events));
  },
  all(): AnomalyEvent[] {
    return events;
  },
  forMetric(key: string): AnomalyEvent[] {
    return events.filter(e => e.metricKey === key);
  },
  subscribe(fn: (e: AnomalyEvent[]) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  clear() {
    events = [];
    listeners.forEach(l => l(events));
  },
  isEscalation(from: AnomalySeverity, to: AnomalySeverity) {
    return severityRank[to] > severityRank[from];
  },
};
