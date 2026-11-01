import type { APIRoute } from 'astro';
import { getArchiveData, type ArchiveRoute } from '../../utils/archive';

const VALID_ROUTES: ArchiveRoute[] = ['all', 'articles', 'books', 'shows-and-movies', 'moments'];

export async function getStaticPaths() {
  return VALID_ROUTES.map((route) => ({ params: { route } }));
}

export const GET: APIRoute = async ({ params }) => {
  const route = (params.route ?? 'all') as ArchiveRoute;
  if (!VALID_ROUTES.includes(route)) {
    return new Response(JSON.stringify([]), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const base = import.meta.env.BASE_URL;
  const { cards } = await getArchiveData(route, base);

  return new Response(JSON.stringify(cards), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
