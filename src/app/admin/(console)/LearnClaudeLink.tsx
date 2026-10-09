"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { browserStore, subscribe } from "@/lib/claude/browser-store";
import { readOpened } from "@/lib/claude/default";

// Visible on the server, hidden once this browser has opened a prompt in Claude. It sits in the Set up card's footer
// as a quiet text link, so Today keeps its calm for a member who already knows the way.
const readSeen = () => readOpened(browserStore());
const serverSeen = () => false;

export function LearnClaudeLink() {
  const opened = useSyncExternalStore(subscribe, readSeen, serverSeen);
  if (opened) return null;
  return (
    <p data-learn-claude className="text-xs leading-5 text-admin-muted">
      New here?{" "}
      <Link href="/admin/system/setup#work-with-claude" className="-my-3.5 inline-flex min-h-11 items-center font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent">Learn how Claude opens your Foundation</Link>
    </p>
  );
}
