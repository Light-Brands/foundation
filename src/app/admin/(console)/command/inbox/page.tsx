import { InboxList } from "./InboxList";
import { PageHeader } from "@/components/frame/PageHeader";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";

export default async function InboxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker={<DictionaryKicker page="command/inbox" fallback="Command center · Inbox" />}
        title="Handle what needs you"
        lede={<>Every message and every decision from every part of your business lands here.</>}
      />
      <InboxList />
    </div>
  );
}
