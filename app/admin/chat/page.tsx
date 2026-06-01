import { requireAdmin } from "@/lib/adminAuth";
import { adminClient } from "@/lib/supabase/admin";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

type RawConversation = {
  id: string;
  client_id: string | null;
  channel: "email" | "sms" | "phone";
  last_message_at: string | null;
  unread_count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chat_messages: any[];
};

export default async function ChatPage() {
  await requireAdmin();

  const { data: rawConversations } = await adminClient
    .from("chat_conversations")
    .select("*, client:clients(name), chat_messages(id, conversation_id, direction, body, created_at)")
    .order("last_message_at", { ascending: false });

  const conversations = ((rawConversations ?? []) as RawConversation[]).map((c) => {
    const msgs = (c.chat_messages ?? []).sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const lastMsg = msgs[msgs.length - 1];
    return {
      id: c.id,
      client_id: c.client_id,
      channel: c.channel,
      last_message_at: c.last_message_at,
      unread_count: c.unread_count ?? 0,
      client_name: c.client?.name ?? null,
      last_message_body: lastMsg?.body ?? null,
      messages: msgs,
    };
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatClient conversations={conversations} />
    </div>
  );
}
