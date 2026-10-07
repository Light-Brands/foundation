"use client";

export function LockButton() {
  const handleLock = async () => {
    await fetch("/api/gate", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <button onClick={handleLock} className="btn-quiet w-full">
      Lock
    </button>
  );
}
