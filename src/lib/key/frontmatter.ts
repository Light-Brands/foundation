import { parse } from "yaml";

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function parseFrontMatter(md: string): { data: Record<string, unknown>; body: string } | null {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end < 0) return null;
  let data: unknown;
  try { data = parse(lines.slice(1, end).join("\n")); } catch { return null; }
  if (data == null) data = {};
  if (!isObj(data)) return null;
  return { data, body: lines.slice(end + 1).join("\n") };
}
