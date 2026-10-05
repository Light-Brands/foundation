import Link from "next/link";

export function PreviewBanner() {
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
      Live preview. Everything opens, and saving starts once your database is connected.{" "}
      <Link href="/system/setup" className="underline underline-offset-4">See Setup</Link>
    </div>
  );
}
