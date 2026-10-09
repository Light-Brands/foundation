export function browserStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Remembered choices live in the browser and are read as an external store. Writes in this tab notify the listeners;
// writes in another tab arrive as storage events.
const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
export const notify = () => listeners.forEach((fn) => fn());
