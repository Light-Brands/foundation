import { CopyButton } from "@/components/CopyButton";

// Desktop only. Check my system is the Ninja verb that reads everything installed and ranks the next moves.
export function TopBar() {
  return (
    <div className="mb-6 hidden flex-wrap items-center justify-end gap-2 md:flex">
      <CopyButton text="Check my system." label="Check my system" />
      <a href="/" target="_blank" rel="noreferrer" className="btn-quiet">View my site</a>
    </div>
  );
}
