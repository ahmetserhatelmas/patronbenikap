"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X, Bell, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { signOut } from "@/lib/actions/auth";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

interface HeaderProps {
  profile?: Profile | null;
  /** Direct profile URL — skip /profil redirect hop */
  profileHref?: string;
  unreadNotifications?: number;
  unreadMessages?: number;
}

export function Header({
  profile,
  profileHref: profileHrefProp,
  unreadNotifications = 0,
  unreadMessages = 0,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const liveNotifs = useUnreadNotifications(
    profile?.role === "worker" ? profile.id : null
  );
  const notifCount =
    profile?.role === "worker"
      ? Math.max(unreadNotifications, liveNotifs)
      : unreadNotifications;
  const liveMessages = useUnreadMessages(profile?.id);
  const messageCount = Math.max(unreadMessages, liveMessages);

  const panelHref =
    profile?.role === "company"
      ? "/firma/panel"
      : profile?.role === "admin"
        ? "/admin"
        : "/isci/panel";

  const profileHref =
    profileHrefProp ??
    (profile?.role === "company"
      ? "/firma/profil"
      : profile?.role === "admin"
        ? "/admin"
        : profile?.role === "worker"
          ? "/isci/profil"
          : "/profil");

  const profileActive =
    pathname === profileHref ||
    pathname === "/profil" ||
    pathname.startsWith("/isci/profil") ||
    pathname.startsWith("/firma/profil");

  const messagesHref =
    profile?.role === "company" ? "/firma/mesajlar" : "/isci/mesajlar";

  const showWorkerSearch = !profile || profile.role === "company";

  const workerSearchHref =
    profile?.role === "company" ? "/firma/ara" : "/kayit?role=company";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={profile ? panelHref : "/"} className="group">
          <BrandLogo
            size={36}
            className="transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!profile && (
            <>
              <NavLink href="/#nasil-calisir" active={false}>
                Nasıl Çalışır
              </NavLink>
              <NavLink href="/blog" active={pathname.startsWith("/blog")}>
                Blog
              </NavLink>
            </>
          )}
          {showWorkerSearch && (
            <NavLink
              href={workerSearchHref}
              active={pathname.startsWith("/firma/ara")}
            >
              İşçi Ara
            </NavLink>
          )}
          {profile ? (
            <>
              <NavLink href={panelHref} active={pathname.includes("/panel")}>
                Panel
              </NavLink>
              <NavLink href={profileHref} active={profileActive}>
                Profil
              </NavLink>
              <Link
                href={messagesHref}
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageSquare className="h-5 w-5" />
                {messageCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
                    {messageCount}
                  </span>
                )}
              </Link>
              {profile.role === "worker" && (
                <Link
                  href="/isci/bildirimler"
                  className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {notifCount}
                    </span>
                  )}
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Çıkış
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/giris">Giriş</Link>
              </Button>
              <Button size="sm" className="shadow-md shadow-primary/20" asChild>
                <Link href="/kayit">Profil Oluştur</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema değiştir"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Tema"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-label="Menü"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border/60 bg-background/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {!profile && (
              <>
                <Link
                  href="/#nasil-calisir"
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Nasıl Çalışır
                </Link>
                <Link
                  href="/blog"
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Blog
                </Link>
              </>
            )}
            {showWorkerSearch && (
              <Link
                href={workerSearchHref}
                className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                İşçi Ara
              </Link>
            )}
            {profile ? (
              <>
                <Link
                  href={panelHref}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Panel
                </Link>
                <Link
                  href={profileHref}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Profil
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    Çıkış
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Giriş
                </Link>
                <Button asChild className="mt-1">
                  <Link href="/kayit" onClick={() => setOpen(false)}>
                    Profil Oluştur
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
