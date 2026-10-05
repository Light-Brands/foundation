import "server-only";
import { BUILD_SECRET } from "@/generated/build-secret";

export type FoundationEnv = {
  pin: string | null;
  pinProblem: "missing" | "invalid" | null;
  secret: string;
  onVercel: boolean;
  businessName: string;
  dataDir: string;
};

const PIN_FORMAT = /^\d{6,12}$/;

export function readEnv(e: Record<string, string | undefined> = process.env, buildSecret: string = BUILD_SECRET): FoundationEnv {
  const raw = e.FOUNDATION_PIN?.trim() ?? "";
  const pinProblem = raw === "" ? "missing" : PIN_FORMAT.test(raw) ? null : "invalid";
  return {
    pin: pinProblem ? null : raw,
    pinProblem,
    secret: e.FOUNDATION_SECRET?.trim() || buildSecret,
    onVercel: e.VERCEL === "1",
    businessName: e.FOUNDATION_BUSINESS_NAME?.trim() || "Your business",
    dataDir: e.FOUNDATION_DATA_DIR?.trim() || ".data/pglite",
  };
}
