import { redirect } from "next/navigation";
import { ChatPanel } from "@/components/messaging/chat-panel";
import { ConversationList } from "@/components/messaging/conversation-list";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Mesajlar" };

export default async function WorkerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c: activeId } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data: worker } = await supabase
    .from("workers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!worker) redirect("/isci/profil");

  const [{ data: conversations }, messagesResult] = await Promise.all([
    supabase
      .from("conversations")
      .select(`*, company:companies(id, name, logo_url, is_verified)`)
      .eq("worker_id", worker.id)
      .order("last_message_at", { ascending: false, nullsFirst: false }),
    activeId
      ? supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", activeId)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null }),
  ]);

  const active = conversations?.find((conv) => conv.id === activeId);
  const messages = active ? (messagesResult.data ?? []) : [];

  const company = active?.company as unknown as {
    name: string;
  } | null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold">
          Mesajlar
        </h1>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {!conversations?.length ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Henüz mesaj yok. Firmalar sana ulaşınca burada görünecek.
              </p>
            ) : (
              <ConversationList
                currentUserId={profile.id}
                activeId={activeId}
                items={conversations.map((conv) => {
                  const co = conv.company as unknown as { name: string };
                  return {
                    id: conv.id,
                    name: co?.name ?? "Firma",
                    lastMessageAt: conv.last_message_at,
                    href: `/isci/mesajlar?c=${conv.id}`,
                  };
                })}
              />
            )}
          </aside>

          <div>
            {active && company ? (
              <ChatPanel
                conversation={active}
                currentUserId={profile.id}
                otherName={company.name}
                initialMessages={messages}
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed text-muted-foreground">
                Bir konuşma seç
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
