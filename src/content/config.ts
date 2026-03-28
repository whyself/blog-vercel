import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    listTitle: z.string().optional(),
    subtitle: z.string().optional(),
    excerpt: z.string(),
    publishDate: z.date(),
    listDate: z.string(),
    articleDate: z.string().optional(),
    wordCount: z.string(),
    tags: z.array(z.string()),
    majorCategory: z.enum(['Articles', 'Books', 'Shows and Movies']),
    thumbnail: z.string().optional(),
    heroImage: z.string().optional(),
    author: z.string().default('whyself'),
    authorAvatar: z.string().optional(),
    toc: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const pages = defineCollection({
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts, pages };
