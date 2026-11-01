import { filterPostsByMajorRoute, getPublishedPosts, sortPostsByDateDesc, type MajorRoute, type PostEntry } from './posts';
import { formatMomentListDate, getPublishedMoments, sortMomentsByDateDesc, type MomentEntry } from './moments';

export const ARCHIVE_PAGE_SIZE = 10;

export type ArchiveRoute = MajorRoute | 'moments';

export interface PostCardData {
  kind: 'post';
  id: string;
  title: string;
  href: string;
  listDate: string;
  wordCount: string;
  excerpt: string;
  tags: string[];
  thumbnail: string;
}

export interface MomentCardImage {
  src: string;
  alt: string;
}

export interface MomentCardData {
  kind: 'moment';
  id: string;
  title: string;
  text: string;
  listDate: string;
  tags: string[];
  images: MomentCardImage[];
}

export type ArchiveCardData = PostCardData | MomentCardData;

interface ArchiveSeoConfig {
  sectionPath: '' | 'articles' | 'moments';
  indexTitle: string;
  indexDescription: string;
  pagedTitle: (page: number) => string;
  pagedDescription: (page: number) => string;
}

const archiveSeoConfig: Record<ArchiveRoute, ArchiveSeoConfig> = {
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
  moments: {
    sectionPath: 'moments',
    indexTitle: 'Moments | whyself',
    indexDescription: 'Short notes, photos and moments from whyself.',
    pagedTitle: (page) => `Moments - Page ${page} | whyself`,
    pagedDescription: (page) => `Moments archive page ${page} on whyself.`,
  },
};

const toCanonicalPath = (route: ArchiveRoute, currentPage: number): string => {
  const config = archiveSeoConfig[route];
  if (currentPage <= 1) {
    return config.sectionPath ? `${config.sectionPath}/` : '';
  }
  if (!config.sectionPath) return `page/${currentPage}/`;
  return `${config.sectionPath}/page/${currentPage}/`;
};

export function getMomentImageAlt(moment: MomentEntry, alt: string | undefined): string {
  return alt?.trim() || moment.data.title?.trim() || 'Moment image';
}

export function toPostCardData(post: PostEntry, base: string): PostCardData {
  return {
    kind: 'post',
    id: post.id,
    title: post.data.listTitle ?? post.data.title,
    href: `${base}posts/${post.id}/`,
    listDate: post.data.listDate,
    wordCount: post.data.wordCount,
    excerpt: post.data.excerpt,
    tags: post.data.tags,
    thumbnail: post.data.thumbnail ?? '',
  };
}

export function toMomentCardData(moment: MomentEntry): MomentCardData {
  return {
    kind: 'moment',
    id: moment.id,
    title: moment.data.title?.trim() ?? '',
    text: moment.data.text.trim(),
    listDate: moment.data.listDate?.trim() || formatMomentListDate(moment.data.date),
    tags: moment.data.tags ?? [],
    images: (moment.data.images ?? []).map((image) => ({
      src: image.src,
      alt: getMomentImageAlt(moment, image.alt),
    })),
  };
}

export interface ArchiveData {
  cards: ArchiveCardData[];
  allPosts: PostEntry[];
  allMoments: MomentEntry[];
}

export async function getArchiveData(route: ArchiveRoute, base: string): Promise<ArchiveData> {
  const allPosts = sortPostsByDateDesc(await getPublishedPosts());
  const allMoments = sortMomentsByDateDesc(await getPublishedMoments());
  const postCards = allPosts.map((post) => toPostCardData(post, base));
  const momentCards = allMoments.map(toMomentCardData);

  if (route === 'moments') {
    return { cards: momentCards, allPosts, allMoments };
  }

  if (route === 'all') {
    const datedCards = [
      ...allPosts.map((post, index) => ({ date: post.data.publishDate.valueOf(), card: postCards[index] })),
      ...allMoments.map((moment, index) => ({ date: moment.data.date.valueOf(), card: momentCards[index] })),
    ];
    return {
      cards: datedCards.sort((a, b) => b.date - a.date).map((entry) => entry.card),
      allPosts,
      allMoments,
    };
  }

  const routePosts = filterPostsByMajorRoute(allPosts, route);
  return { cards: routePosts.map((post) => toPostCardData(post, base)), allPosts, allMoments };
}

export function paginateCards(cards: ArchiveCardData[], currentPage: number, pageSize = ARCHIVE_PAGE_SIZE): ArchiveCardData[] {
  const start = (currentPage - 1) * pageSize;
  return cards.slice(start, start + pageSize);
}

export function getTotalPages(cards: ArchiveCardData[], pageSize = ARCHIVE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(cards.length / pageSize));
}

export function buildArchiveStaticPaths(cards: ArchiveCardData[], pageSize = ARCHIVE_PAGE_SIZE) {
  const totalPages = getTotalPages(cards, pageSize);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, idx) => {
    const currentPage = idx + 2;
    return {
      params: { page: String(currentPage) },
      props: {
        currentPage,
        totalPages,
        cards: paginateCards(cards, currentPage, pageSize),
      },
    };
  });
}

export function getArchiveSeo(route: ArchiveRoute, currentPage: number, base: string, siteOrigin: string) {
  const config = archiveSeoConfig[route];
  const canonicalPath = toCanonicalPath(route, currentPage);
  return {
    seoTitle: currentPage <= 1 ? config.indexTitle : config.pagedTitle(currentPage),
    seoDescription: currentPage <= 1 ? config.indexDescription : config.pagedDescription(currentPage),
    canonicalUrl: new URL(`${base}${canonicalPath}`, siteOrigin).toString(),
    ogImageUrl: new URL(`${base}images/hero/blog-hero-light-1920.webp`, siteOrigin).toString(),
  };
}
