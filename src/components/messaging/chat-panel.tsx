"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  markMessagesRead,
  type SendMessageResult,
} from "@/lib/actions/messaging";
import type { Message, Conversation } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ChatPanelProps {
  conversation: Conversation;
  currentUserId: string;
  otherName: string;
  initialMessages: Message[];
}

type PresencePayload = {
  user_id: string;
  typing?: boolean;
  online_at?: string;
};

const initial: SendMessageResult = {};

export function ChatPanel({
  conversation,
  currentUserId,
  otherName,
  initialMessages,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, action, pending] = useActionState(sendMessage, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    markMessagesRead(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      // Realtime gecikse bile gönderilen mesajı hemen göster
      const sent = state.message;
      if (sent) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      }
    }
  }, [state]);

  useEffect(() => {
    const supabase = createClient();
    joinedRef.current = false;

    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.sender_id !== currentUserId) {
            markMessagesRead(conversation.id);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const presence = channel.presenceState();
        const others = Object.values(presence)
          .flat()
          .map((p) => p as unknown as PresencePayload)
          .filter((p) => p.user_id !== currentUserId);
        setOnline(others.length > 0);
        setTyping(others.some((p) => p.typing === true));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          joinedRef.current = true;
          channelRef.current = channel;
          await channel.track({
            user_id: currentUserId,
            typing: false,
            online_at: new Date().toISOString(),
          });
        } else {
          joinedRef.current = false;
        }
      });

    channelRef.current = channel;

    return () => {
      joinedRef.current = false;
      channelRef.current = null;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  function handleTyping() {
    const channel = channelRef.current;
    if (!channel || !joinedRef.current) return;

    void channel.track({
      user_id: currentUserId,
      typing: true,
      online_at: new Date().toISOString(),
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (!channelRef.current || !joinedRef.current) return;
      void channelRef.current.track({
        user_id: currentUserId,
        typing: false,
        online_at: new Date().toISOString(),
      });
    }, 2000);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials(otherName.split(" ")[0], otherName.split(" ")[1])}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{otherName}</p>
          <p className="text-xs text-muted-foreground">
            {online ? (
              <span className="text-primary">● Çevrimiçi</span>
            ) : (
              "Çevrimdışı"
            )}
            {typing && " · yazıyor..."}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const mine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        ref={formRef}
        action={action}
        className="flex gap-2 border-t border-border/60 p-4"
      >
        <input type="hidden" name="conversation_id" value={conversation.id} />
        <Textarea
          name="content"
          placeholder="Mesaj yaz..."
          rows={1}
          required
          className="min-h-[44px] resize-none"
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
