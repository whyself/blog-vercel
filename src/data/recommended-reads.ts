export interface RecommendedRead {
  // Internal: /posts/slug/
  // External: https://example.com/article
  title: string;
  href: string;
}

export const recommendedReads: RecommendedRead[] = [
  {title: "玄武湖旁的柳树",href: "/posts/玄武湖旁的柳树"},
  {title: "个人博客搭建记",href: "/posts/个人博客搭建记"},
  {title: "Gifted",href: "/posts/gifted"},
];
