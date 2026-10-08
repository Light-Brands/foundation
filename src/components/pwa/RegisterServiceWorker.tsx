"use client";
import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // Scoped to the command center, so the public pages and links (/, /contact, /f/*, /u/*) are never under it.
    navigator.serviceWorker.register("/sw.js", { scope: "/admin" }).catch(() => {
      // The app still works without it; it only loses the offline page and the faster start.
    });
  }, []);
  return null;
}
