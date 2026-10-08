"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { browserStore, subscribe } from "@/lib/claude/browser-store";
import { readOpened } from "@/lib/claude/default";

// Visible on the server, hidden once this browser has opened a prompt in Claude.
const readSeen = () => readOpened(browserStore());
const serverSeen = () => false;

export function LearnClaudeCard() {
  const opened = useSyncExternalStore(subscribe, readSeen, serverSeen);
  if (opened) return null;
  return (
    <p data-learn-claude className="surface p-card text-sm text-admin-muted">
      <Link href="/admin/system/setup#work-with-claude" className="inline-flex min-h-11 items-center font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent">New here? Learn how Claude opens your Foundation.</Link>
    </p>
  );
}
