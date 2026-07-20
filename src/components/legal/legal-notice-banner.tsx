"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "pbk-legal-notice-dismissed";

export function LegalNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-foreground text-background shadow-lg">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:items-center sm:px-6">
        <p className="flex-1 text-sm leading-relaxed">
          Bu siteyi kullanmadan önce verileriniz hakkında{" "}
          <Link
            href="/aydinlatma-metni"
            className="font-semibold underline underline-offset-2 hover:opacity-90"
          >
            aydınlatma metnini
          </Link>
          {", "}
          <Link
            href="/gizlilik"
            className="font-semibold underline underline-offset-2 hover:opacity-90"
          >
            gizlilik
          </Link>{" "}
          ve{" "}
          <Link
            href="/kullanim-kosullari"
            className="font-semibold underline underline-offset-2 hover:opacity-90"
          >
            üyelik koşullarını
          </Link>{" "}
          inceleyebilirsiniz.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1.5 hover:bg-background/10"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
