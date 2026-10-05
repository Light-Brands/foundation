export type FoundationEnv = {
  pin: string | null;
  pinProblem: "missing" | "invalid" | null;
  salt: string;
  onVercel: boolean;
  businessName: string;
  dataDir: string;
};

const PIN_FORMAT = /^\d{6,12}$/;

export function readEnv(e: Record<string, string | undefined> = process.env): FoundationEnv {
  const raw = e.FOUNDATION_PIN?.trim() ?? "";
  const pinProblem = raw === "" ? "missing" : PIN_FORMAT.test(raw) ? null : "invalid";
  return {
    pin: pinProblem ? null : raw,
    pinProblem,
    salt: e.FOUNDATION_SECRET || e.VERCEL_PROJECT_PRODUCTION_URL || "local",
    onVercel: e.VERCEL === "1",
    businessName: e.FOUNDATION_BUSINESS_NAME?.trim() || "Your business",
    dataDir: e.FOUNDATION_DATA_DIR?.trim() || ".data/pglite",
  };
}
