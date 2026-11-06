import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.journalPost.findUnique({ where: { slug } });
  if (!post) return { title: "Essay not found" };
  return {
    title: `${post.title} — Journal`,
    description: post.excerpt,
    alternates: { canonical: `/journal/${slug}` },
  };
}

export default async function JournalPostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = await db.journalPost.findUnique({ where: { slug } });
  if (!post) notFound();
  const others = await db.journalPost.findMany({
    where: { slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  return (
    <div className="section-dark min-h-dvh pb-24">
      <header className="relative overflow-hidden">
        <TexturePreview texture={post.cover} tileSize={300} className="absolute inset-0 opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
        <div className="container-wv relative pt-[calc(var(--header-h)+6rem)] pb-16 max-w-4xl">
          <nav aria-label="Breadcrumb" className="label opacity-60 mb-6">
            <Link href="/journal" className="hover:text-citron transition-colors">
              Journal
            </Link>{" "}
            / <span aria-current="page">{post.title}</span>
          </nav>
          <h1 className="display text-4xl md:text-6xl">{post.title}</h1>
          <p className="label opacity-60 mt-6">
            {formatDate(post.publishedAt)} · {post.tags.split(",").join(" · ")}
          </p>
        </div>
      </header>
      <article className="container-wv mt-12 max-w-3xl">
        <div className="prose-wv">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
      {others.length > 0 ? (
        <aside className="container-wv mt-20 border-t border-ivory/10 pt-10 max-w-3xl" aria-label="More essays">
          <p className="label opacity-50 mb-6">Keep reading</p>
          <div className="flex flex-col gap-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/journal/${o.slug}`} className="group flex items-center gap-5">
                <TexturePreview texture={o.cover} tileSize={100} className="h-14 w-20 shrink-0 border border-ivory/10" />
                <span className="font-serif text-xl group-hover:text-citron transition-colors">{o.title}</span>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
