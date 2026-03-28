import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

const site = process.env.SITE_URL || 'https://YOUR_USERNAME.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  adapter: netlify(),
  output: 'server',
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
