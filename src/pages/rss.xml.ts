import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  const baseUrl = (site?.toString() || 'http://127.0.0.1:4321').replace(/\/$/, '');
  const feedUrl = `${baseUrl}/rss.xml`;
  const now = new Date().toUTCString();

  const itemsXml = posts
    .map((post) => {
      const title = escapeXml(post.data.listTitle ?? post.data.title);
      const description = escapeXml(post.data.excerpt ?? '');
      const link = `${baseUrl}/posts/${post.slug}/`;
      const pubDate = new Date(post.data.publishDate).toUTCString();
      return `<item>
  <title>${title}</title>
  <link>${link}</link>
  <guid>${link}</guid>
  <description>${description}</description>
  <pubDate>${pubDate}</pubDate>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>whyself blog</title>
  <link>${baseUrl}/</link>
  <description>Recent posts from whyself blog</description>
  <language>zh-CN</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
${itemsXml}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
};

