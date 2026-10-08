import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-admin-canvas px-6 text-center">
      <p className="kicker">Not here</p>
      <h1 className="page-title mt-2 max-w-xl">There is nothing at this address.</h1>
      <p className="mt-3 max-w-sm leading-relaxed text-admin-muted">Everything you run lives in your command center.</p>
      <Link href="/admin" className="btn-primary mt-6">Back to your command center</Link>
    </main>
  );
}
