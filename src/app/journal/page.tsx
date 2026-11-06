import Link from "next/link";
import type { Metadata } from "next";
import { getJournalPosts } from "@/lib/journal";
import { PageHero } from "@/components/layout/PageHero";
import { TexturePreview } from "@/components/ui/TexturePreview";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journal — notes on walls",
  description: "Essays on pattern, proportion, colour and the craft of wallcovering from the WALLVERSE studio.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="The Journal"
        title="Notes on walls."
        copy="Short essays on pattern, proportion and the quiet engineering inside every roll."
        texture="/textures/bloom-archive.svg"
      />
      <div className="container-wv mt-16 flex flex-col gap-14">
        {posts.map((post, i) => (
          <Reveal key={post.slug}>
            <article className={`grid gap-7 md:grid-cols-[1fr_1.4fr] items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <Link href={`/journal/${post.slug}`} className="group block overflow-hidden">
                <TexturePreview
                  texture={post.cover}
                  tileSize={240}
                  alt={`Cover pattern for “${post.title}”`}
                  className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </Link>
              <div>
                <p className="label opacity-50 mb-3">
                  {formatDate(post.publishedAt)} · {post.tags.split(",").join(" · ")}
                </p>
                <h2 className="display text-3xl md:text-5xl">
                  <Link href={`/journal/${post.slug}`} className="hover:text-citron transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 text-sm opacity-70 leading-relaxed max-w-xl">{post.excerpt}</p>
                <Link
                  href={`/journal/${post.slug}`}
                  className="label text-citron mt-5 inline-block hover:underline underline-offset-4"
                >
                  Read the essay →
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
