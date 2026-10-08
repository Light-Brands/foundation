import Image from "next/image";
import { readEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth/gate";
import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { getBrand } from "@/lib/data/brand";
import { PromptBox } from "@/components/PromptBox";
import { Keypad } from "./Keypad";
import { Monogram } from "@/components/frame/Monogram";
import s from "./chamber.module.css";

export const dynamic = "force-dynamic";

const SECTIONS = ["Command center", "Brand", "Agentic", "Grow", "Serve", "Run"];
const LEDE = "Your brand, your business and your AI team, in one quiet room.";

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const env = readEnv();
  const { next } = await searchParams;
  const db = await getDb();
  const [profile, brand] = await Promise.all([getProfile(db, env.businessName), getBrand(db)]);
  const logo = brand.logoLightUrl ?? brand.logoUrl;
  return (
    <div className={s.page}>
      <aside className={s.chamber} data-chamber>
        <div className={s.grain} aria-hidden />
        <div className={s.shaft} aria-hidden />
        <div className={s.floor} aria-hidden />
        <div className={`${s.content} ${s.rise}`} style={{ animationDelay: "60ms" }}>
          {logo ? (
            <Image src={logo} alt={profile.business} width={40} height={40} className="h-10 w-auto object-contain" unoptimized />
          ) : (
            <Monogram name={profile.business} size="xl" />
          )}
        </div>
        <div className={s.content}>
          <p className={`${s.eyebrow} ${s.rise}`} style={{ animationDelay: "140ms" }}>Command center</p>
          <h2 className={`${s.wordmark} ${s.rise}`} style={{ animationDelay: "220ms" }}>{profile.business}</h2>
          <p className={`${s.lede} ${s.rise}`} style={{ animationDelay: "320ms" }}>{profile.what_we_do || LEDE}</p>
        </div>
        <ul className={`${s.content} ${s.sections} ${s.rise}`} style={{ animationDelay: "420ms" }}>
          {SECTIONS.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </aside>
      <main className={s.panel}>
        <header className={s.topBar}>
          <p className={s.staff}>Owner and team</p>
        </header>
        <div className={s.formWrap}>
          <div className={s.rise} style={{ animationDelay: "180ms" }}>
            <h1 className={s.headline}>Sign in</h1>
            <p className={s.sub}>Enter your command center.</p>
          </div>
          <div className={`mt-8 ${s.rise}`} style={{ animationDelay: "260ms" }}>
            {env.pinProblem ? (
              <div className="space-y-4">
                <p className="text-admin-muted">
                  {env.pinProblem === "missing"
                    ? "Your command center is deployed. One step left: set your PIN."
                    : "Your PIN needs to be 6 to 12 digits. One quick change and you are in."}
                </p>
                <PromptBox name="setup/set-pin" title="Set your PIN with Claude" />
              </div>
            ) : (
              <Keypad next={safeNext(next)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
