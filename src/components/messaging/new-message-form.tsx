"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/actions/messaging";
import type { ActionResult } from "@/lib/actions/auth";

const initial: ActionResult = {};

export function NewMessageForm({ workerId }: { workerId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(sendMessage, initial);

  useEffect(() => {
    if (state.success) {
      toast.success("Mesaj gönderildi");
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form
      action={action}
      className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4"
    >
      <input type="hidden" name="worker_id" value={workerId} />
      <h2 className="font-semibold">Yeni mesaj</h2>
      <Textarea
        name="content"
        placeholder="Merhaba, profilinizi beğendik..."
        rows={4}
        required
      />
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Gönder
      </Button>
    </form>
  );
}
