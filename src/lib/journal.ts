import "server-only";
import { db } from "@/lib/db";
import { usesDatabase } from "@/lib/data-source";
import { journalPosts } from "@/data/journal";

export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  tags: string;
  publishedAt: Date;
}

const staticPosts: JournalPost[] = journalPosts
  .map((p) => ({ ...p, publishedAt: new Date(p.publishedAt) }))
  .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

/** All posts, newest first. */
export async function getJournalPosts(): Promise<JournalPost[]> {
  if (!usesDatabase) return staticPosts;
  return db.journalPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  if (!usesDatabase) return staticPosts.find((p) => p.slug === slug) ?? null;
  return db.journalPost.findUnique({ where: { slug } });
}
