"use client";
import { OpenIn } from "@/components/OpenIn";

// The frame's Claude button: a quiet split button that opens a blank session on the owner's own Foundation. On a
// desktop it reads Claude; on a phone header it is the Claude icon. Copy and the repo line live in its menu.
export function ClaudeButton({ prompt, icon = false }: { prompt: string; icon?: boolean }) {
  return <OpenIn prompt={prompt} compact icon={icon} learn={false} align="right" />;
}
