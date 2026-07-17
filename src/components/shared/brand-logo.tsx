"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 36,
  showText = true,
}: {
  className?: string;
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Patron Beni Kap"
        width={size}
        height={size}
        className="rounded-lg object-contain"
        priority
      />
      {showText && (
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Patron <span className="text-primary">Beni</span>{" "}
          <span className="text-brand-orange">Kap</span>
        </span>
      )}
    </span>
  );
}
