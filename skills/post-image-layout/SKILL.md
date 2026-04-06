---
name: post-image-layout
description: Use when editing blog posts in this Astro project and you need images to feel embedded in the reading flow instead of large isolated blocks.
---

# Post Image Layout

## Overview
This skill keeps blog images readable and narrative-first.  
Default strategy for short essays is: one small floating image near the opening, then one centered narrow image at a scene transition.

## When to Use
- You are editing files in `src/content/posts/*.md`.
- The article feels visually broken by large full-width images.
- Text is short-to-medium length and should remain the focus.

## Class Reference (This Project)
These classes are implemented in `src/pages/posts/[slug].astro`:

- `post-media post-media--float post-media--float-right`
Used for one small right-floated image near the beginning.

- `post-media post-media--float post-media--float-left`
Left-floated variant (use sparingly).

- `post-media-clear`
Clears float before switching back to full-width text or centered media.

- `post-media post-media--center-narrow`
Centered medium-width image for section/scene transition.

- `post-media-pair post-media-pair--left` + `post-media-pair__text`
Left image + right text block with bottom alignment on desktop.

- `post-media-pair--balanced`
Makes the left image larger, increases gap, and stretches right text so top/bottom align with image.

## Default Pattern
1. Put one floating image in the first 1-3 paragraphs.
2. Keep only one float in short essays.
3. Insert `post-media-clear` before the next media block.
4. Use one `post-media--center-narrow` image in the middle or near ending.
5. Do not stack multiple large images back-to-back.

If the user asks for "left image with right text top/bottom flush", use `post-media-pair--balanced`.

## Copyable Snippet
```html
<figure class="post-media post-media--float post-media--float-right">
  <img src="/images/posts/your-post/cover.jpg" alt="图片描述" />
</figure>

<div class="post-media-clear"></div>
<figure class="post-media post-media--center-narrow">
  <img src="/images/posts/your-post/scene.jpg" alt="图片描述" />
</figure>
```

```html
<div class="post-media-pair post-media-pair--left post-media-pair--balanced">
  <figure class="post-media">
    <img src="/images/posts/your-post/ending.jpg" alt="图片描述" />
    <figcaption>一句简短收束语。</figcaption>
  </figure>
  <div class="post-media-pair__text">
    <p>右侧段落 1。</p>
    <p>右侧段落 2。</p>
  </div>
</div>
```

## Quick Review Checklist
- Is there at most one floating image in a short post?
- Does text still dominate the viewport on desktop?
- Is there clear visual breathing room around float images?
- On mobile, does layout collapse to centered blocks naturally?
