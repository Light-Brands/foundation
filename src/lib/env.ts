import "server-only";
import { BUILD_SECRET } from "@/generated/build-secret";

export type FoundationEnv = {
  pin: string | null;
  pinProblem: "missing" | "invalid" | null;
  secret: string;
  /** FOUNDATION_SECRET alone, never the build secret, or null. Keys the opt-out list, so it is fixed for the life of the Foundation. */
  fixedSecret: string | null;
  onVercel: boolean;
  businessName: string;
  dataDir: string;
  /** Lets the host's schedule run the checks. At least 16 characters, else null, and null means the cron route refuses everyone. */
  cronSecret: string | null;
};

const PIN_FORMAT = /^\d{6,12}$/;

export function readEnv(e: Record<string, string | undefined> = process.env, buildSecret: string = BUILD_SECRET): FoundationEnv {
  const raw = e.FOUNDATION_PIN?.trim() ?? "";
  const cron = e.CRON_SECRET?.trim() ?? "";
  const pinProblem = raw === "" ? "missing" : PIN_FORMAT.test(raw) ? null : "invalid";
  return {
    pin: pinProblem ? null : raw,
    pinProblem,
    secret: e.FOUNDATION_SECRET?.trim() || buildSecret,
    fixedSecret: e.FOUNDATION_SECRET?.trim() || null,
    onVercel: e.VERCEL === "1",
    businessName: e.FOUNDATION_BUSINESS_NAME?.trim() || "Your business",
    dataDir: e.FOUNDATION_DATA_DIR?.trim() || ".data/pglite",
    cronSecret: cron.length >= 16 ? cron : null,
  };
}
