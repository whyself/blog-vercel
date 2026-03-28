import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const basePath = import.meta.env.BASE_URL || '/';
  const siteOrigin = site?.toString() ?? 'http://127.0.0.1:4321';
  const sitemapUrl = new URL(`${basePath}sitemap.xml`, siteOrigin).toString();

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
