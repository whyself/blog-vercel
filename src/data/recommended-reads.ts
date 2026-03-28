export interface RecommendedRead {
  // Internal: /posts/slug/
  // External: https://example.com/article
  title: string;
  href: string;
}

export const recommendedReads: RecommendedRead[] = [
  { title: '在复杂系统里成长：从任务执行到长期复利', href: '/posts/cn-long-essay-systems-and-growth/' },
  { title: '网页前后端指北', href: '/posts/web-fullstack-guide-cn/' },
  { title: 'The Architecture of Silence: Designing for Focus', href: '/posts/the-poetry-of-concrete-and-silence/' },
];
