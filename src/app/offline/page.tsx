export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-admin-canvas px-6 text-center">
      <p className="kicker">Command center</p>
      <h1 className="page-title mt-2">You are offline</h1>
      <p className="mt-3 max-w-sm leading-relaxed text-admin-muted">Your command center opens again as soon as you are back online.</p>
      {/* A plain link, so it works without the app's scripts: a full page load asks for the command center again. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/admin" className="btn-primary mt-6">Try again</a>
    </main>
  );
}
