import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ChatPanel } from "@/components/messaging/chat-panel";
import { ConversationList } from "@/components/messaging/conversation-list";
import { NewMessageForm } from "@/components/messaging/new-message-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";

export const metadata = { title: "Mesajlar" };

export default async function CompanyMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; worker?: string }>;
}) {
  const { c, worker: workerId } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!company) redirect("/firma/profil");

  let activeId = c;
  if (workerId && !c) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("company_id", company.id)
      .eq("worker_id", workerId)
      .maybeSingle();

    if (existing) {
      activeId = existing.id;
    }
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `*, worker:workers(id, first_name, last_name, slug, profile:profiles(avatar_url))`
    )
    .eq("company_id", company.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const active = conversations?.find((conv) => conv.id === activeId);

  let messages: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
  }[] = [];
  if (active) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", active.id)
      .order("created_at", { ascending: true });
    messages = data ?? [];
  }

  const worker = active?.worker as unknown as {
    id: string;
    first_name: string;
    last_name: string;
  } | null;

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold">
          Mesajlar
        </h1>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {!conversations?.length ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Henüz konuşma yok
              </p>
            ) : (
              <ConversationList
                currentUserId={profile.id}
                activeId={activeId}
                items={conversations.map((conv) => {
                  const w = conv.worker as unknown as {
                    first_name: string;
                    last_name: string;
                  };
                  return {
                    id: conv.id,
                    name: `${w?.first_name ?? ""} ${w?.last_name ?? ""}`.trim() || "İşçi",
                    lastMessageAt: conv.last_message_at,
                    href: `/firma/mesajlar?c=${conv.id}`,
                  };
                })}
              />
            )}
          </aside>

          <div>
            {active && worker ? (
              <ChatPanel
                conversation={active}
                currentUserId={profile.id}
                otherName={`${worker.first_name} ${worker.last_name}`}
                initialMessages={messages}
              />
            ) : workerId ? (
              <NewMessageForm workerId={workerId} />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed text-muted-foreground">
                Bir konuşma seç veya işçiden mesaj başlat
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
