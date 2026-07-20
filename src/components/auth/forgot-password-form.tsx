"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, type ActionResult } from "@/lib/actions/auth";

const initial: ActionResult = {};

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error");
  const [state, action, pending] = useActionState(forgotPassword, initial);
  const values = state.values ?? {};

  if (state.success) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-4">
        <p className="font-medium text-primary">{state.success}</p>
        <Button asChild variant="outline">
          <Link href="/giris">Girişe dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      key={state.error ? `err-${values.email}` : "idle"}
      action={action}
      className="space-y-4"
    >
      {(linkError === "expired" || linkError === "auth") && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Link geçersiz veya süresi dolmuş. Yeni bir sıfırlama maili iste.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={values.email ?? ""}
        />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full h-11" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sıfırlama linki gönder
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/giris" className="text-primary hover:underline">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
