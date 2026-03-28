# Stitch Astro Blog

A lightweight Astro blog powered by Astro Content Collections, while preserving the original Stitch visual style.

## Project structure

- `src/content/posts/*.md`: post content and metadata
- `src/content/config.ts`: content schema
- `src/pages/index.astro`: blog home page (renders latest posts)
- `src/pages/posts/[slug].astro`: dynamic post page route
- `astro.config.mjs`: Astro config with `site` and `base` support for GitHub Pages
- `.github/workflows/deploy.yml`: optional GitHub Pages deployment workflow

## Local development

```bash
npm install --cache .npm-cache --ignore-scripts
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages notes

Set these repository variables before enabling the workflow:

- `SITE_URL`: e.g. `https://yourname.github.io`
- `BASE_PATH`:
  - user/organization site: `/`
  - project site: `/<repo-name>/`

This keeps internal links working correctly on Pages.