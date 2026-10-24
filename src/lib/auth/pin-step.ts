/** Which setup prompt the sign-in page offers. No PIN at all means setup is unfinished, so it points at step 0.3.4, Connect Vercel. An invalid PIN only needs the quick change. */
export function pinStep(problem: "missing" | "invalid"): { name: string; title: string } {
  return problem === "missing"
    ? { name: "setup/connect-vercel", title: "Connect Vercel and set your PIN with Claude" }
    : { name: "setup/change-my-pin", title: "Set your PIN with Claude" };
}
