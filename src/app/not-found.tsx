import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-mesh px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 text-muted-foreground">
        Aradığın sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
