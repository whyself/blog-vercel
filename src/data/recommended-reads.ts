export interface RecommendedRead {
  // Internal: /posts/slug/
  // External: https://example.com/article
  title: string;
  href: string;
}

export const recommendedReads: RecommendedRead[] = [
  {title: "Gifted",href: "/posts/gifted"},
  {title: "个人博客搭建记",href: "/posts/个人博客搭建记"}
];
