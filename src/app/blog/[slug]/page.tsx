import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("title, excerpt")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return { title: "Yazı bulunamadı" };
    return {
      title: data.title,
      description: data.excerpt ?? undefined,
      openGraph: { title: data.title, description: data.excerpt ?? undefined },
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

  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/blog"
          className="text-sm text-primary hover:underline"
        >
          ← Blog
        </Link>
        <article className="mt-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("tr-TR")}
          </p>
          {post.excerpt && (
            <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
