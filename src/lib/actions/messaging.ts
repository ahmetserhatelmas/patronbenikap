"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/lib/actions/auth";

export async function sendMessage(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
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

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: parsed.data.content,
  });

  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  const { data: conv } = await supabase
    .from("conversations")
    .select("company_id, worker_id, company:companies(profile_id, name), worker:workers(profile_id, first_name)")
    .eq("id", conversationId)
    .single();

  if (conv) {
    const company = conv.company as unknown as { profile_id: string; name: string };
    const worker = conv.worker as unknown as { profile_id: string; first_name: string };
    const recipientId =
      user.id === company.profile_id ? worker.profile_id : company.profile_id;

    await supabase.from("notifications").insert({
      user_id: recipientId,
      type: "message",
      title: "Yeni mesaj",
      body: parsed.data.content.slice(0, 100),
      link: `/mesajlar?c=${conversationId}`,
    });
  }

  revalidatePath("/firma/mesajlar");
  revalidatePath("/isci/mesajlar");
  return { success: "Gönderildi" };
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
    .eq("user_id", user.id);

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
    .eq("is_read", false);

  revalidatePath("/isci/bildirimler");
}
