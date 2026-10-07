import { InboxList } from "./InboxList";

export default async function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Command center · Handle what needs you</p>
        <h1 className="mt-1 text-3xl text-admin-ink">Inbox</h1>
        <p className="mt-2 text-admin-muted">Every message and every decision from every part of your business lands here.</p>
      </div>
      <InboxList />
    </div>
  );
}
