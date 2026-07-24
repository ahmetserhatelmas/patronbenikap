import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://patronbenikap.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === "string" && value in BLOG_CATEGORIES;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("title, excerpt, meta_title, meta_description, category")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return { title: "Yazı bulunamadı" };

    const title = data.meta_title || data.title;
    const description =
      data.meta_description || data.excerpt || undefined;
    const url = `${baseUrl}/blog/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        siteName: "Patron Beni Kap",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "Blog" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getCurrentProfile().catch(() => null);
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  const category: BlogCategory | null = isBlogCategory(post.category)
    ? post.category
    : null;
  const categoryLabel = category ? BLOG_CATEGORIES[category] : null;

  let related: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
  }[] = [];

  if (category) {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category")
      .eq("is_published", true)
      .eq("category", category)
      .neq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(3);
    related = data ?? [];
  }

  const articleUrl = `${baseUrl}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Organization",
      name: "Patron Beni Kap",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Patron Beni Kap",
      url: baseUrl,
    },
    mainEntityOfPage: articleUrl,
    articleSection: categoryLabel ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href={category ? `/blog/kategori/${category}` : "/blog"}
          className="text-sm text-primary hover:underline"
        >
          ← {categoryLabel ?? "Blog"}
        </Link>
        <article className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {categoryLabel && (
              <Link
                href={`/blog/kategori/${category}`}
                className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/15"
              >
                {categoryLabel}
              </Link>
            )}
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString("tr-TR")}
            </time>
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-10">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              İlgili yazılar
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="block rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/30"
                  >
                    <p className="font-medium">{item.title}</p>
                    {item.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <p className="font-medium">Profilini tamamla, iş seni bulsun</p>
          <p className="mt-1 text-sm text-muted-foreground">
            İşçiysen görünür profil oluştur; firmaysan filtreleyip doğru adaya
            ulaş.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/kayit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Ücretsiz kayıt ol
            </Link>
            <Link
              href="/blog"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              Tüm yazılar
            </Link>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
