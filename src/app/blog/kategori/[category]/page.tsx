import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPage from "../../page";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://patronbenikap.com";

interface PageProps {
  params: Promise<{ category: string }>;
}

function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === "string" && value in BLOG_CATEGORIES;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isBlogCategory(category)) return { title: "Blog" };
  const label = BLOG_CATEGORIES[category];
  const title = `${label} — Blog | Patron Beni Kap`;
  const description = `${label} yazıları: meslek, kariyer ve iş piyasası rehberleri.`;
  const url = `${baseUrl}/blog/kategori/${category}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isBlogCategory(category)) notFound();
  return (
    <BlogPage searchParams={Promise.resolve({ kategori: category })} />
  );
}
