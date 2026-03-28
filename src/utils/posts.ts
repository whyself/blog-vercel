import { getCollection, type CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

export interface SearchItem {
  title: string;
  href: string;
  tags?: string[];
  excerpt?: string;
}

export async function getPublishedPosts(): Promise<PostEntry[]> {
  return getCollection('posts', ({ data }) => !data.draft);
}

export function sortPostsByDateDesc(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function sortPostsByDateAsc(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => a.data.publishDate.valueOf() - b.data.publishDate.valueOf());
}

export function buildSearchItems(posts: PostEntry[], base: string): SearchItem[] {
  return sortPostsByDateDesc(posts).map((entry) => ({
    title: entry.data.listTitle ?? entry.data.title,
    href: `${base}posts/${entry.slug}/`,
    tags: entry.data.tags ?? [],
    excerpt: entry.data.excerpt ?? '',
  }));
}
