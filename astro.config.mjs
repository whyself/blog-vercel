import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { rehypeCodeBlock, shikiMetaTransformer } from './src/plugins/rehype-code-block.mjs';

const site = process.env.SITE_URL || process.env.URL || 'https://blog.whyself.cn';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeCodeBlock],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      transformers: [shikiMetaTransformer()],
    },
  },
});
