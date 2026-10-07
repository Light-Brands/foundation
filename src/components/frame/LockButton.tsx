"use client";
import { useState } from "react";

export function LockButton() {
  const [failed, setFailed] = useState(false);

  const handleLock = async () => {
    setFailed(false);
    try {
      const res = await fetch("/api/gate", { method: "DELETE" });
      if (!res.ok) {
        setFailed(true);
        return;
      }
    } catch {
      setFailed(true);
      return;
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full reload on purpose drops all client state after locking
    window.location.href = "/admin/login";
  };

  return (
    <div>
      <button type="button" onClick={handleLock} className="btn-quiet w-full">
        Lock
      </button>
      {failed && (
        <p role="status" className="mt-2 text-sm text-bad">
          Could not lock. Try again.
        </p>
      )}
    </div>
  );
}
