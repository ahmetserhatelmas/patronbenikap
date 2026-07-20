"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type ActionResult } from "@/lib/actions/auth";

const initial: ActionResult = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);

  if (state.success) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-4">
        <p className="font-medium text-primary">{state.success}</p>
        <Button asChild>
          <Link href="/giris">Giriş yap</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Yeni şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Yeni şifre tekrar</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full h-11" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Şifreyi güncelle
      </Button>
    </form>
  );
}
