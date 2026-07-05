/**
 * Super Admin provisioning is user-driven via the Setup screen after
 * license activation. No default account is auto-seeded.
 *
 * This module intentionally exports a no-op so any residual callers
 * remain safe. Prefer removing calls to it entirely.
 */
export function ensureSuperAdminExists(): boolean {
  return true;
}
