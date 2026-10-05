import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="kicker">Not here</p>
      <h1 className="text-2xl text-zinc-100">That page is not part of your command center.</h1>
      <Link href="/" className="btn-quiet">Back to Home</Link>
    </main>
  );
}
