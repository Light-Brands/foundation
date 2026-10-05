import { readEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth/gate";
import { Keypad } from "./Keypad";
import { PromptBox } from "@/components/PromptBox";

export const dynamic = "force-dynamic";

export default async function GatePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const env = readEnv();
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl text-zinc-100">{env.businessName}</h1>
      {env.pinProblem ? (
        <div className="w-full max-w-xl space-y-4">
          <p className="text-mist">
            {env.pinProblem === "missing"
              ? "Your command center is deployed. One step left: set your PIN."
              : "Your PIN needs to be 6 to 12 digits. One quick change and you are in."}
          </p>
          <PromptBox name="setup/set-pin" title="Set your PIN with Claude" />
        </div>
      ) : (
        <Keypad next={safeNext(next)} />
      )}
    </main>
  );
}
