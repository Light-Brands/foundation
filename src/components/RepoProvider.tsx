"use client";
import { createContext, useContext } from "react";

export type RepoInfo = { repo: string | null; folder: string | null; label: string };
const Ctx = createContext<RepoInfo>({ repo: null, folder: null, label: "your Foundation" });

export function RepoProvider({ value, children }: { value: RepoInfo; children?: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useRepo = () => useContext(Ctx);
