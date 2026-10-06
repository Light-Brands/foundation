import { getDb } from "@/lib/db";
import { keyRoot } from "@/lib/key/write";
import { receiveWebhook } from "@/lib/hooks/receive";

export const dynamic = "force-dynamic";

// Public on purpose: providers call this without a session. receiveWebhook answers 404 for a connection
// the installed Key does not declare and verifies the signature on the raw body before writing anything.
export async function POST(req: Request, { params }: { params: Promise<{ connection: string }> }) {
  const { connection } = await params;
  try {
    const out = await receiveWebhook({ db: await getDb(), root: keyRoot(), env: process.env }, { connection, req }, new Date());
    return new Response(out.body, { status: out.status, headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (err) {
    console.error("webhook receive failed", err);
    return new Response("Not handled", { status: 500 });
  }
}
