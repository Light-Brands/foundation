import { TARGETS, type Target } from "./open-in";

const DEFAULT_KEY = "foundation.openIn.default";
const FOLDER_KEY = "foundation.openIn.folder";
const ABSOLUTE = /^(?:\/|[A-Za-z]:\\)/;

export function readDefault(store: Storage | null): Target {
  try {
    const v = store?.getItem(DEFAULT_KEY);
    return TARGETS.includes(v as Target) ? (v as Target) : "desktop";
  } catch {
    return "desktop";
  }
}

export function writeDefault(store: Storage | null, t: Target): boolean {
  try {
    if (!store) return false;
    store.setItem(DEFAULT_KEY, t);
    return true;
  } catch {
    return false;
  }
}

export function readFolder(store: Storage | null): string | null {
  try {
    const v = store?.getItem(FOLDER_KEY);
    return v && ABSOLUTE.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeFolder(store: Storage | null, folder: string): boolean {
  const v = folder.trim();
  if (!ABSOLUTE.test(v)) return false;
  try {
    if (!store) return false;
    store.setItem(FOLDER_KEY, v);
    return true;
  } catch {
    return false;
  }
}
