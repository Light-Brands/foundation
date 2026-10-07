export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-admin-canvas px-6 text-center">
      <p className="kicker">Command center</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-admin-ink">You are offline</h1>
      <p className="mt-2 max-w-sm text-admin-muted">Your command center opens again as soon as you are back online.</p>
    </main>
  );
}
