import { filterPostsByMajorRoute, getPublishedPosts, sortPostsByDateDesc, type MajorRoute, type PostEntry } from './posts';

export const ARCHIVE_PAGE_SIZE = 10;

interface ArchiveSeoConfig {
  sectionPath: '' | 'articles' | 'books' | 'shows-and-movies';
  indexTitle: string;
  indexDescription: string;
  pagedTitle: (page: number) => string;
  pagedDescription: (page: number) => string;
}

const archiveSeoConfig: Record<MajorRoute, ArchiveSeoConfig> = {
  all: {
    sectionPath: '',
    indexTitle: 'Blog | whyself',
    indexDescription: 'Personal blog by whyself on growth, systems thinking, reading, film, and engineering practice.',
    pagedTitle: (page) => `Blog - Page ${page} | whyself`,
    pagedDescription: (page) => `Blog archive page ${page} on whyself.`,
  },
  articles: {
    sectionPath: 'articles',
    indexTitle: 'Articles | whyself',
    indexDescription: 'Article archive by whyself.',
    pagedTitle: (page) => `Articles - Page ${page} | whyself`,
    pagedDescription: (page) => `Article archive page ${page} on whyself.`,
  },
  books: {
    sectionPath: 'books',
    indexTitle: 'Books | whyself',
    indexDescription: 'Book archive by whyself.',
    pagedTitle: (page) => `Books - Page ${page} | whyself`,
    pagedDescription: (page) => `Book archive page ${page} on whyself.`,
  },
  'shows-and-movies': {
    sectionPath: 'shows-and-movies',
    indexTitle: 'Shows and Movies | whyself',
    indexDescription: 'Shows and movies archive by whyself.',
    pagedTitle: (page) => `Shows and Movies - Page ${page} | whyself`,
    pagedDescription: (page) => `Shows and movies archive page ${page} on whyself.`,
  },
};

const toCanonicalPath = (route: MajorRoute, currentPage: number): string => {
  const config = archiveSeoConfig[route];
  if (currentPage <= 1) {
    return config.sectionPath ? `${config.sectionPath}/` : '';
  }
  if (!config.sectionPath) return `page/${currentPage}/`;
  return `${config.sectionPath}/page/${currentPage}/`;
};

export async function getArchivePostsByRoute(route: MajorRoute): Promise<{ allPosts: PostEntry[]; routePosts: PostEntry[] }> {
  const allPosts = sortPostsByDateDesc(await getPublishedPosts());
  const routePosts = filterPostsByMajorRoute(allPosts, route);
  return { allPosts, routePosts };
}

export function paginatePosts(posts: PostEntry[], currentPage: number, pageSize = ARCHIVE_PAGE_SIZE): PostEntry[] {
  const start = (currentPage - 1) * pageSize;
  return posts.slice(start, start + pageSize);
}

export function getTotalPages(posts: PostEntry[], pageSize = ARCHIVE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(posts.length / pageSize));
}

export function buildArchiveStaticPaths(routePosts: PostEntry[], pageSize = ARCHIVE_PAGE_SIZE) {
  const totalPages = getTotalPages(routePosts, pageSize);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, idx) => {
    const currentPage = idx + 2;
    return {
      params: { page: String(currentPage) },
      props: {
        currentPage,
        totalPages,
        posts: paginatePosts(routePosts, currentPage, pageSize),
      },
    };
  });
}

export function getArchiveSeo(route: MajorRoute, currentPage: number, base: string, siteOrigin: string) {
  const config = archiveSeoConfig[route];
  const canonicalPath = toCanonicalPath(route, currentPage);
  return {
    seoTitle: currentPage <= 1 ? config.indexTitle : config.pagedTitle(currentPage),
    seoDescription: currentPage <= 1 ? config.indexDescription : config.pagedDescription(currentPage),
    canonicalUrl: new URL(`${base}${canonicalPath}`, siteOrigin).toString(),
    ogImageUrl: new URL(`${base}images/hero/blog-hero-light-1920.webp`, siteOrigin).toString(),
  };
}
