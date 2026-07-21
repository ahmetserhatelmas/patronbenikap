import { redirect } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/messaging";
import { cn } from "@/lib/utils";

export const metadata = { title: "Bildirimler" };

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/giris");

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .eq("type", "view")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Bildirimler
          </h1>
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="ghost" size="sm">
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Tümünü okundu say
            </Button>
          </form>
        </div>

        {!notifications?.length ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Bildirim yok</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Firmalar profilini görüntülediğinde burada göreceksin
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <form
                  action={async () => {
                    "use server";
                    await markNotificationRead(n.id);
                  }}
                >
                  <button
                    type="submit"
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted/50",
                      !n.is_read
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{n.title}</p>
                        {n.body && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(n.created_at).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
  );
}
