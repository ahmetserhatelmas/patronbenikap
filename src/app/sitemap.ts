import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kayit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/giris`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/firma/ara`, changeFrequency: "hourly", priority: 0.9 },
  ];

  try {
    const supabase = await createClient();
    const { data: workers } = await supabase
      .from("workers")
      .select("slug, updated_at")
      .eq("is_visible", true)
      .limit(1000);

    const workerPages: MetadataRoute.Sitemap =
      workers?.map((w) => ({
        url: `${base}/isci/${w.slug}`,
        lastModified: new Date(w.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) ?? [];

    return [...staticPages, ...workerPages];
  } catch {
    return staticPages;
  }
}
