import { InboxList } from "./InboxList";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function InboxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Command center · What needs you"
        title="Inbox"
        lede={<>Every message and every decision from every part of your business lands here.</>}
      />
      <InboxList />
    </div>
  );
}
