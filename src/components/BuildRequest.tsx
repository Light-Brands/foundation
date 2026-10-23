"use client";
import { useId, useRef, useState } from "react";
import { copyText } from "@/lib/copy-text";
import {
  ANSWER_MAX, BUILD_REQUEST_TO, QUESTIONS, WORTH_PICKS, buildRequestMailto, buildRequestText,
  type BuildRequest, type WorthPick,
} from "@/lib/build-request";

const LABEL = "Have Light Brands build it for you";

type Field = { key: Exclude<keyof BuildRequest, "worth" | "worthNote">; type?: string; required?: boolean; long?: boolean; auto?: string };

// The questions before the worth question. Business and what it does come filled from the profile.
const FIELDS: Field[] = [
  { key: "name", required: true, auto: "name" },
  { key: "business", required: true, auto: "organization" },
  { key: "whatItDoes", long: true },
  { key: "email", type: "email", required: true, auto: "email" },
  { key: "phone", type: "tel", auto: "tel" },
  { key: "want", required: true, long: true },
  { key: "when" },
];

/**
 * The build request: a button that opens a short form in a dialog. Its answers open in the owner's own email app,
 * addressed to Light Brands, or are copied for a device with no email app. Nothing is sent from here. The trigger
 * wears the className passed, so the same request sits in the sidebar and on Today.
 */
export function BuildRequestButton({ business, whatItDoes, className = "btn-quiet", title, children }: {
  business: string;
  whatItDoes: string;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const read = (form: HTMLFormElement): BuildRequest => {
    const data = new FormData(form);
    const value = (k: keyof BuildRequest) => String(data.get(k) ?? "");
    return {
      name: value("name"), business: value("business"), whatItDoes: value("whatItDoes"), email: value("email"),
      phone: value("phone"), want: value("want"), when: value("when"), worth: value("worth") as WorthPick, worthNote: value("worthNote"),
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNote("");
    const answers = read(e.currentTarget);
    const via = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (via === "copy") {
      const r = await copyText(buildRequestText(answers));
      if (!r.ok) { setNote(r.message); return; }
      setCopied(true);
      setNote(`Copied. Paste it into an email to ${BUILD_REQUEST_TO}.`);
      setTimeout(() => setCopied(false), 1600);
      return;
    }
    window.location.href = buildRequestMailto(answers);
    setNote(`Your email app opens with the message ready. Press send there.`);
  };

  const input = "field mt-1 bg-admin-canvas";

  return (
    <>
      <button type="button" className={className} title={title} onClick={() => { setNote(""); dialog.current?.showModal(); }}>
        {children ?? LABEL}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${uid}-title`}
        className="surface m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto p-card text-admin-ink backdrop:bg-admin-ink/40 md:p-card-lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <h2 id={`${uid}-title`} className="text-lg font-semibold tracking-tight">{LABEL}</h2>
            <p className="mt-1 text-sm text-admin-muted">
              Tell us what you would like built. Your answers open as an email to {BUILD_REQUEST_TO} from your own address, ready to send.
            </p>
          </div>
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="kicker">{QUESTIONS[f.key]}</span>
              {f.long ? (
                <textarea
                  name={f.key}
                  rows={3}
                  required={f.required}
                  maxLength={ANSWER_MAX[f.key]}
                  defaultValue={f.key === "whatItDoes" ? whatItDoes : undefined}
                  className={input}
                />
              ) : (
                <input
                  name={f.key}
                  type={f.type ?? "text"}
                  required={f.required}
                  maxLength={ANSWER_MAX[f.key]}
                  autoComplete={f.auto}
                  defaultValue={f.key === "business" ? business : undefined}
                  className={input}
                />
              )}
            </label>
          ))}
          <fieldset>
            <legend className="kicker">{QUESTIONS.worth}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {WORTH_PICKS.map((pick) => (
                <label key={pick} className="flex min-h-11 items-center gap-2.5 rounded-control border border-admin-line px-3 text-sm has-[:checked]:border-accent md:min-h-10">
                  <input type="radio" name="worth" value={pick} required className="accent-accent" />
                  {pick}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="kicker">{QUESTIONS.worthNote}</span>
            <textarea name="worthNote" rows={2} maxLength={ANSWER_MAX.worthNote} className={input} />
          </label>
          <div className="flex flex-wrap items-center gap-3 border-t border-admin-line pt-4">
            <button type="submit" value="email" className="btn-primary">Open email</button>
            <button type="submit" value="copy" className="btn-quiet">{copied ? "Copied" : "Copy message"}</button>
            <button type="button" className="btn-quiet ml-auto" onClick={() => dialog.current?.close()}>Close</button>
          </div>
          <p role="status" className="text-sm text-admin-muted">
            {note || `No email app on this device? Copy the message and send it to ${BUILD_REQUEST_TO} from any email.`}
          </p>
        </form>
      </dialog>
    </>
  );
}
