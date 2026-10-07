import Link from "next/link";

export function PreviewBanner() {
  return (
    <div className="border-b border-warn/20 bg-warn-soft px-4 py-2 text-sm text-warn">
      Live preview. Everything opens, and saving starts once your database is connected.{" "}
      <Link href="/system/setup" className="underline underline-offset-4">See Setup</Link>
    </div>
  );
}
