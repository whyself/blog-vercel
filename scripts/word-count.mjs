#!/usr/bin/env node
/**
 * Recompute the `wordCount` frontmatter field for every post.
 *
 * Counting rule: one word per CJK character, one word per Latin/number token.
 * Code blocks are counted too, since the author's numbers always included them;
 * inline HTML (figures) and link targets are skipped.
 *
 * Usage: node scripts/word-count.mjs [--check]
 *   --check  print the computed values without touching any file (exit 1 when a file is stale)
 */
import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/gu;
const LATIN_WORD = /[A-Za-z0-9][A-Za-z0-9'’\-]*/g;

const splitFrontmatter = (raw) => {
  const text = raw.replace(/^\uFEFF/, '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  return { frontmatter: match[1], body: text.slice(match[0].length) };
};

const countWords = (body) => {
  const text = body
    .replace(/<figure[\s\S]*?<\/figure>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  const cjk = text.match(CJK)?.length ?? 0;
  const latin = text.replace(CJK, ' ').match(LATIN_WORD)?.length ?? 0;
  return cjk + latin;
};

const formatCount = (count) => `${count.toLocaleString('en-US')} Words`;

const check = process.argv.includes('--check');
const files = fs.readdirSync(POSTS_DIR).filter((name) => name.endsWith('.md')).sort();
let changed = 0;
let stale = 0;

for (const name of files) {
  const filePath = path.join(POSTS_DIR, name);
  const raw = fs.readFileSync(filePath, 'utf8');
  const hasBom = raw.startsWith('\uFEFF');
  const parts = splitFrontmatter(raw);
  if (!parts) {
    console.warn(`skip (no frontmatter): ${name}`);
    continue;
  }

  const nextValue = formatCount(countWords(parts.body));
  const linePattern = /^wordCount:.*$/m;

  if (!linePattern.test(parts.frontmatter)) {
    console.error(`missing wordCount field: ${name}`);
    process.exitCode = 1;
    continue;
  }

  const currentValue = parts.frontmatter.match(linePattern)[0].split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
  if (currentValue === nextValue) continue;

  if (check) {
    stale += 1;
    console.log(`stale  ${name}: ${currentValue} -> ${nextValue}`);
    continue;
  }

  const nextFrontmatter = parts.frontmatter.replace(linePattern, `wordCount: "${nextValue}"`);
  fs.writeFileSync(filePath, `${hasBom ? '\uFEFF' : ''}---\n${nextFrontmatter}\n---\n${parts.body}`, 'utf8');
  changed += 1;
  console.log(`update ${name}: ${currentValue} -> ${nextValue}`);
}

if (check) {
  console.log(stale ? `${stale} file(s) need updating.` : 'All word counts are up to date.');
  if (stale) process.exitCode = 1;
} else {
  console.log(changed ? `${changed} file(s) updated.` : 'All word counts are up to date.');
}
