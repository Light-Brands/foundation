"use client";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "foundation.install-hint";

export function InstallHint() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "dismissed";
    } catch {
      // Storage can be refused; the hint simply shows.
    }
    if (standalone || !phone || dismissed) return;
    // Browser-only facts (display mode, user agent, storage) can only be read after mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setShow(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!show) return null;
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "dismissed");
    } catch {
      // Nothing to keep; it shows again next time.
    }
  };
  return (
    <div className="surface flex items-start gap-4 p-4" data-install-hint>
      <div className="flex-1">
        <p className="font-medium text-admin-ink">Put your command center on your home screen</p>
        <p className="mt-1 text-sm text-admin-muted">
          {ios ? "Tap Share, then Add to Home Screen. It opens like an app." : "Install it and it opens like an app, full screen."}
        </p>
        {deferred && (
          <button type="button" className="btn-primary mt-3" onClick={async () => {
              try {
                await deferred.prompt();
                const { outcome } = await deferred.userChoice;
                if (outcome === "accepted") dismiss();
                else setDeferred(null);
              } catch {
                setDeferred(null);
              }
            }}>
            Install the app
          </button>
        )}
      </div>
      <button type="button" className="text-sm text-admin-faint hover:text-admin-muted" onClick={dismiss}>Not now</button>
    </div>
  );
}
