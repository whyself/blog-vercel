import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

const site = process.env.SITE_URL || process.env.URL || 'http://127.0.0.1:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
    },
  },
});
