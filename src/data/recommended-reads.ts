export interface RecommendedRead {
  // Internal: /posts/slug/
  // External: https://example.com/article
  title: string;
  href: string;
}

export const recommendedReads: RecommendedRead[] = [
  {title: "Gifted",href: "/posts/gifted"}
];
