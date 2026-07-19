"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/lib/actions/auth";
import type { Message } from "@/types/database";

export type SendMessageResult = ActionResult & { message?: Message };

export async function sendMessage(
  _prev: SendMessageResult,
  formData: FormData
): Promise<SendMessageResult> {
  const parsed = messageSchema.safeParse({
    content: formData.get("content"),
    conversation_id: formData.get("conversation_id") || undefined,
    worker_id: formData.get("worker_id") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz mesaj" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };

  let conversationId = parsed.data.conversation_id;

  if (!conversationId && parsed.data.worker_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("profile_id", user.id)
      .single();

    if (!company) return { error: "Firma profili gerekli" };

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("company_id", company.id)
      .eq("worker_id", parsed.data.worker_id)
      .maybeSingle();

    if (existing) {
      conversationId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          company_id: company.id,
          worker_id: parsed.data.worker_id,
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) return { error: error.message };
      conversationId = created.id;
    }
  }

  if (!conversationId) return { error: "Konuşma bulunamadı" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: parsed.data.content,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/firma/mesajlar");
  revalidatePath("/isci/mesajlar");
  return { success: "Gönderildi", message: message as Message };
}

export async function markMessagesRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("type", "view");

  revalidatePath("/isci/bildirimler");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("type", "view")
    .eq("is_read", false);

  revalidatePath("/isci/bildirimler");
}
