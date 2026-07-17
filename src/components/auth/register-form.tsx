"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUp, signInWithGoogle, type ActionResult } from "@/lib/actions/auth";
import { useState } from "react";

const initial: ActionResult = {};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "company" ? "company" : "worker";
  const [role, setRole] = useState<"worker" | "company">(defaultRole);
  const [state, action, pending] = useActionState(signUp, initial);

  if (state.success) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="font-medium text-primary">{state.success}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/giris">Giriş sayfasına git</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("worker")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            role === "worker"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/40"
          )}
        >
          <User
            className={cn(
              "h-6 w-6",
              role === "worker" ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span className="text-sm font-medium">İşçi</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("company")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
            role === "company"
              ? "border-brand-orange bg-brand-orange/5 shadow-sm"
              : "border-border hover:border-brand-orange/40"
          )}
        >
          <Building2
            className={cn(
              "h-6 w-6",
              role === "company" ? "text-brand-orange" : "text-muted-foreground"
            )}
          />
          <span className="text-sm font-medium">Firma</span>
        </button>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={role} />
        <div className="space-y-2">
          <Label htmlFor="fullName">
            {role === "company" ? "Yetkili adı" : "Ad Soyad"}
          </Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Şifre tekrar</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
        </div>
        {typeof state.error === "string" && state.error.length > 0 && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full h-11" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kayıt Ol
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">veya</span>
        </div>
      </div>

      <form action={signInWithGoogle.bind(null, "/")}>
        <Button type="submit" variant="outline" className="w-full h-11">
          Google ile devam et
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
