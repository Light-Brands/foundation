"use client";
import { useState } from "react";

const MESSAGES = {
  idle: "",
  checking: "Checking",
  wrong: "That PIN did not match. Try again.",
  busy: "Too many tries. Wait a few minutes, then try again.",
  setup: "This command center needs its PIN set up. Reload this page for the steps.",
  offline: "Could not reach your command center. Check your connection and try again.",
} as const;

export function Keypad({ next }: { next: string }) {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong" | "setup" | "busy" | "offline">("idle");
  const press = (d: string) => setPin((p) => (p.length < 12 ? p + d : p));
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
      setState(res.status === 503 ? "setup" : res.status === 429 ? "busy" : "wrong");
    } catch {
      setState("offline");
    }
  }
  return (
    <form
      className="surface w-full max-w-xs p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="pin" className="kicker">Your PIN</label>
      <input
        id="pin"
        name="pin"
        inputMode="numeric"
        autoComplete="current-password"
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 12))}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-zinc-100"
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} className="rounded-xl bg-ink-200 py-3 font-mono text-lg hover:bg-ink-300">{d}</button>
        ))}
        <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} className="rounded-xl bg-ink-200 py-3 text-sm hover:bg-ink-300">Back</button>
        <button type="button" onClick={() => press("0")} className="rounded-xl bg-ink-200 py-3 font-mono text-lg hover:bg-ink-300">0</button>
        <button type="submit" disabled={pin.length < 6 || state === "checking"} className="rounded-xl bg-violet py-3 text-sm font-medium text-white disabled:opacity-40">Open</button>
      </div>
      <p className="mt-3 min-h-5 text-sm text-mist" role="status">
        {MESSAGES[state]}
      </p>
    </form>
  );
}
