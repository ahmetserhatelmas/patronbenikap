"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type ConversationListItem = {
  id: string;
  name: string;
  lastMessageAt: string | null;
  href: string;
};

type Props = {
  items: ConversationListItem[];
  activeId?: string;
  currentUserId: string;
};

export function ConversationList({ items, activeId, currentUserId }: Props) {
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
  const conversationIds = items.map((i) => i.id).join(",");

  useEffect(() => {
    if (!conversationIds) return;
    const supabase = createClient();
    const ids = conversationIds.split(",");

    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", ids)
        .eq("is_read", false)
        .neq("sender_id", currentUserId);

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.conversation_id] = (counts[row.conversation_id] ?? 0) + 1;
      }
      setUnreadByConv(counts);
    }

    void load();

    const channel = supabase
      .channel(`conversation-unread:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationIds, currentUserId]);

  return (
    <ul className="divide-y divide-border/60">
      {items.map((item) => {
        const unread = unreadByConv[item.id] ?? 0;
        const isActive = activeId === item.id;

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                isActive && "bg-primary/5"
              )}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm",
                    unread > 0 ? "font-semibold text-foreground" : "font-medium"
                  )}
                >
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.lastMessageAt
                    ? new Date(item.lastMessageAt).toLocaleDateString("tr-TR")
                    : "Yeni"}
                </p>
              </div>
              {unread > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange px-1.5 text-[11px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
