import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog — Meslek Rehberi",
  description:
    "Meslek tanıtımları, kariyer ipuçları ve sektör rehberleri. Patron Beni Kap blog.",
};

export default async function BlogPage() {
  const profile = await getCurrentProfile().catch(() => null);
  let posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    profession_slug: string | null;
    created_at: string;
  }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, profession_slug, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    posts = [];
  }

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
          Meslek rehberi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Farklı meslekleri tanı, kariyerinde bir adım öne geç.
        </p>

        {!posts.length ? (
          <div className="mt-12 rounded-2xl border border-dashed py-16 text-center">
            <p className="font-medium">Yakında yazılar eklenecek</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supabase&apos;te 003_feedback_updates.sql dosyasını çalıştır
            </p>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("tr-TR")}
                    {post.profession_slug
                      ? ` · ${post.profession_slug}`
                      : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
