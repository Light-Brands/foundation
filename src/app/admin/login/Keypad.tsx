"use client";
import { useEffect, useRef, useState } from "react";
import { Delete } from "@/components/frame/icons";

// Every key is 56px on a phone, a calm 48px on a desk.
const KEY = "flex min-h-14 items-center justify-center rounded-control border border-admin-line-strong bg-admin-surface text-admin-ink transition-colors duration-200 ease-breath hover:bg-admin-hover active:bg-admin-hover lg:min-h-12";

const MESSAGES = {
  idle: "",
  checking: "Checking",
  wrong: "That PIN did not match. Try again.",
  busy: "",
  setup: "This command center needs its PIN set up. Reload this page for the steps.",
  unavailable: "Your command center could not check that just now. Try again in a moment.",
  offline: "Could not reach your command center. Check your connection and try again.",
} as const;

/** What the page says while sign-in waits after too many tries, with the wait rounded up. */
export function waitMessage(seconds: number | undefined): string {
  const lead = "Too many tries for now. Try again in";
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return `${lead} a few minutes.`;
  if (seconds > 90 * 60) {
    const hours = Math.ceil(seconds / 3600);
    return `${lead} ${hours} hours.`;
  }
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${lead} ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}

export function Keypad({ next }: { next: string }) {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<keyof typeof MESSAGES>("idle");
  const [wait, setWait] = useState<number | undefined>(undefined);
  const press = (d: string) => setPin((p) => (p.length < 12 ? p + d : p));
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // At a desk the PIN box takes the cursor, so the owner can type and press Enter. On a touch screen it waits,
    // so the phone's own keyboard never covers the keypad.
    if (window.matchMedia("(pointer: fine)").matches) field.current?.focus();
  }, []);
  async function submit() {
    setState("checking");
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        window.location.assign(next);
        return;
      }
      setPin("");
      const data = (await res.json().catch(() => null)) as { error?: string; retryAfter?: number } | null;
      setWait(data?.retryAfter ?? (Number(res.headers.get("Retry-After")) || undefined));
      setState(res.status === 503 ? (data?.error === "unavailable" ? "unavailable" : "setup") : res.status === 429 ? "busy" : "wrong");
    } catch {
      setState("offline");
    }
  }
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="pin" className="kicker">Your PIN</label>
      <input
        ref={field}
        id="pin"
        name="pin"
        inputMode="numeric"
        autoComplete="current-password"
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 12))}
        placeholder="••••••"
        className="field mt-2 py-3 text-center font-mono text-2xl tracking-[0.4em]"
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} className={`${KEY} font-mono text-lg`}>{d}</button>
        ))}
        <button type="button" aria-label="Delete last digit" onClick={() => setPin((p) => p.slice(0, -1))} className={`${KEY} text-admin-muted`}><Delete size={20} aria-hidden /></button>
        <button type="button" onClick={() => press("0")} className={`${KEY} font-mono text-lg`}>0</button>
        <button type="submit" disabled={pin.length < 6 || state === "checking"} className="btn-primary min-h-14 lg:min-h-12">Open</button>
      </div>
      <p className="mt-3 min-h-5 text-sm text-admin-muted" role="status">
        {state === "busy" ? waitMessage(wait) : MESSAGES[state]}
      </p>
    </form>
  );
}
