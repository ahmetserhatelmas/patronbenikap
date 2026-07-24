import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kayit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/giris`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/firma/ara`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${base}/blog/kategori/meslek-rehberi`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${base}/blog/kategori/maas-rehberi`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${base}/blog/kategori/kariyer-ipuclari`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${base}/blog/kategori/is-arama`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${base}/blog/kategori/firma-rehberi`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
  ];

  try {
    const supabase = await createClient();
    const [{ data: workers }, { data: posts }] = await Promise.all([
      supabase
        .from("workers")
        .select("slug, updated_at")
        .eq("is_visible", true)
        .limit(1000),
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("is_published", true)
        .limit(200),
    ]);

    const workerPages: MetadataRoute.Sitemap =
      workers?.map((w) => ({
        url: `${base}/isci/${w.slug}`,
        lastModified: new Date(w.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) ?? [];

    const blogPages: MetadataRoute.Sitemap =
      posts?.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })) ?? [];

    return [...staticPages, ...workerPages, ...blogPages];
  } catch {
    return staticPages;
  }
}
