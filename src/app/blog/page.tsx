import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://patronbenikap.com";

export const metadata: Metadata = {
  title: "Blog — Meslek, Maaş ve Kariyer Rehberi",
  description:
    "Meslek tanıtımları, maaş rehberleri, iş arama ipuçları ve firmalar için işçi bulma yazıları. Patron Beni Kap blog.",
  alternates: { canonical: `${baseUrl}/blog` },
  openGraph: {
    title: "Blog — Meslek, Maaş ve Kariyer Rehberi",
    description:
      "Meslek, maaş, kariyer ve iş arama yazılarıyla işçi–firma eşleşmesini güçlendir.",
    url: `${baseUrl}/blog`,
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ kategori?: string }>;
}

function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === "string" && value in BLOG_CATEGORIES;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { kategori } = await searchParams;
  const activeCategory =
    kategori && isBlogCategory(kategori) ? kategori : null;

  const profile = await getCurrentProfile().catch(() => null);
  let posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    profession_slug: string | null;
    created_at: string;
  }[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, category, profession_slug, created_at"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (activeCategory) {
      query = query.eq("category", activeCategory);
    }

    const { data } = await query;
    posts = data ?? [];
  } catch {
    posts = [];
  }

  const categoryLabel = activeCategory
    ? BLOG_CATEGORIES[activeCategory]
    : null;

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
          {categoryLabel ?? "Kariyer ve meslek blogu"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {categoryLabel
            ? `${categoryLabel} yazıları — arama niyetine uygun rehberler.`
            : "Meslek, maaş, iş arama ve firma rehberleri. SEO dostu, pratik içerikler."}
        </p>

        <nav
          aria-label="Blog kategorileri"
          className="mt-8 flex flex-wrap gap-2"
        >
          <CategoryChip href="/blog" active={!activeCategory}>
            Tümü
          </CategoryChip>
          {(
            Object.entries(BLOG_CATEGORIES) as [BlogCategory, string][]
          ).map(([slug, label]) => (
            <CategoryChip
              key={slug}
              href={`/blog/kategori/${slug}`}
              active={activeCategory === slug}
            >
              {label}
            </CategoryChip>
          ))}
        </nav>

        {!posts.length ? (
          <div className="mt-12 rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">
              {activeCategory
                ? "Bu kategoride henüz yazı yok"
                : "Yakında yazılar eklenecek"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supabase&apos;te 010_blog_seo_categories.sql dosyasını çalıştır
            </p>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {posts.map((post) => {
              const cat = post.category;
              const catLabel =
                cat && isBlogCategory(cat) ? BLOG_CATEGORIES[cat] : null;
              return (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {catLabel && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {catLabel}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}

function CategoryChip({
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
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
