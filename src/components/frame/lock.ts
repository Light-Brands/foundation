/**
 * Locks the gate and reloads into the chamber. A full load on purpose: it drops every cached screen and all client
 * state once the gate is locked. Resolves false when the lock did not take, so the caller can say so.
 */
export async function lockGate(): Promise<boolean> {
  try {
    const res = await fetch("/api/gate", { method: "DELETE" });
    if (!res.ok) return false;
  } catch {
    return false;
  }
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full reload on purpose drops all client state after locking
  window.location.href = "/admin/login";
  return true;
}
