"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUp, type ActionResult } from "@/lib/actions/auth";

const initial: ActionResult = {};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "company" ? "company" : "worker";
  const [role, setRole] = useState<"worker" | "company">(defaultRole);
  const [state, action, pending] = useActionState(signUp, initial);

  const values = state.values ?? {};

  useEffect(() => {
    if (values.role === "company" || values.role === "worker") {
      setRole(values.role);
    }
  }, [values.role]);

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

      <form
        key={state.error ? `err-${values.email}-${values.fullName}` : "idle"}
        action={action}
        className="space-y-4"
      >
        <input type="hidden" name="role" value={role} />
        <div className="space-y-2">
          <Label htmlFor="fullName">
            {role === "company" ? "Yetkili adı" : "Ad Soyad"}
          </Label>
          <Input
            id="fullName"
            name="fullName"
            required
            defaultValue={values.fullName ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={values.email ?? ""}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            defaultValue={values.password ?? ""}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Şifre tekrar</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            defaultValue={values.confirmPassword ?? ""}
            autoComplete="new-password"
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

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-medium text-primary hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
