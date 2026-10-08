"use client";
import { useEffect } from "react";
import Link from "next/link";

// A page that could not load its data shows this inside the frame, so the sidebar and tab bar stay and the owner
// can try again or go back to Today. The error itself stays in the server log, named by its digest.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("command center page failed", error.digest ?? error.message);
  }, [error]);
  return (
    <section role="alert" className="surface mx-auto max-w-xl p-card md:p-card-lg">
      <h1 className="kicker">Something paused</h1>
      <p className="mt-4 text-lg text-admin-ink">Your command center could not reach its data. Try again in a moment.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/admin" className="btn-quiet">Back to Today</Link>
      </div>
    </section>
  );
}
