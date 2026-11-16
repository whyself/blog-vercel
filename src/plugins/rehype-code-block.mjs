const CODE_LANGUAGES = new Set([
  'ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript', 'mjs', 'cjs',
  'json', 'jsonc', 'toml', 'yaml', 'yml', 'css', 'scss', 'less', 'html', 'xml', 'svg',
  'sql', 'python', 'py', 'rust', 'rs', 'go', 'java', 'c', 'cpp', 'c++', 'cs', 'csharp',
  'swift', 'kotlin', 'dart', 'php', 'ruby', 'rb', 'lua', 'r', 'cangjie', 'cj', 'astro', 'vue', 'svelte',
]);

const SHELL_LANGUAGES = new Set([
  'bash', 'sh', 'shell', 'zsh', 'fish', 'console', 'terminal', 'powershell', 'pwsh', 'ps1', 'cmd', 'bat',
]);

const LANG_DISPLAY_MAP = {
  ts: 'TYPESCRIPT',
  tsx: 'TSX',
  typescript: 'TYPESCRIPT',
  js: 'JAVASCRIPT',
  jsx: 'JSX',
  javascript: 'JAVASCRIPT',
  mjs: 'ESM',
  cjs: 'CJS',
  cj: 'CANGJIE',
  cangjie: 'CANGJIE',
  py: 'PYTHON',
  rs: 'RUST',
  yml: 'YAML',
  sh: 'SHELL',
  zsh: 'ZSH',
  pwsh: 'POWERSHELL',
  ps1: 'POWERSHELL',
  md: 'MARKDOWN',
  plaintext: 'TEXT',
  txt: 'TEXT',
  plain: 'TEXT',
};

const CANGJIE_KEYWORDS = new Set([
  'package', 'import', 'public', 'private', 'protected', 'internal', 'open', 'abstract', 'sealed',
  'class', 'struct', 'interface', 'enum', 'extend', 'func', 'let', 'var', 'const',
  'if', 'else', 'for', 'in', 'while', 'do', 'match', 'case', 'return', 'break', 'continue',
  'throw', 'try', 'catch', 'finally', 'where', 'is', 'as', 'true', 'false', 'null', 'this', 'super', 'init',
]);

const CANGJIE_TYPES = new Set([
  'Int8', 'Int16', 'Int32', 'Int64', 'IntNative',
  'UInt8', 'UInt16', 'UInt32', 'UInt64', 'UIntNative',
  'Float16', 'Float32', 'Float64', 'Bool', 'Rune', 'String', 'Unit', 'Nothing', 'Any',
  'Array', 'ArrayList', 'HashMap', 'HashSet', 'Option',
  'JsonValue', 'JsonObject', 'JsonArray', 'JsonFloat', 'IllegalArgumentException',
  'GeoPosition', 'CRSType', 'GeoJSON', 'Position', 'Solution',
]);

const COLLAPSE_LINE_THRESHOLD = 22;
const WRAP_LINE_LENGTH_THRESHOLD = 52;

/**
 * Shiki transformer that preserves fenced code block metastring on the rendered <pre> node.
 */
export function shikiMetaTransformer() {
  return {
    name: 'preserve-code-meta',
    pre(node) {
      const rawMeta = this.options?.meta?.__raw;
      if (typeof rawMeta === 'string' && rawMeta.trim()) {
        node.properties = node.properties || {};
        node.properties['data-meta'] = rawMeta.trim();
      }
    },
  };
}

function getTextContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(getTextContent).join('');
}

function hasClass(node, targetClass) {
  const cls = node?.properties?.className;
  if (Array.isArray(cls)) return cls.includes(targetClass);
  if (typeof cls === 'string') return cls.split(/\s+/).includes(targetClass);
  return false;
}

function parseMetaAttributes(meta) {
  const result = { title: '', collapse: null, wrap: null };
  if (!meta) return result;

  const titleMatch = meta.match(/(?:title|file|filename)=["']([^"']+)["']/) || meta.match(/(?:title|file|filename)=(\S+)/);
  if (titleMatch) result.title = titleMatch[1].trim();

  if (/\bcollapse=false\b|\bno-collapse\b/i.test(meta)) result.collapse = false;
  else if (/\bcollapse=true\b|\bcollapse\b/i.test(meta)) result.collapse = true;

  if (/\bwrap=false\b|\bno-wrap\b/i.test(meta)) result.wrap = false;
  else if (/\bwrap=true\b|\bwrap\b/i.test(meta)) result.wrap = true;

  return result;
}

function looksLikeDirectoryTree(text) {
  const treeGlyphs = /[├└]─|\|--|`--|\|\s{2,}[├└|`]/m;
  return treeGlyphs.test(text);
}

function extractTreeRootTitle(lines) {
  const first = (lines[0]?.text || '').trim();
  if (!first) return '';
  if (/^[/.~\w-]+(?:\/[.\w-]+)*\/$/.test(first)) {
    return first;
  }
  return '';
}

function looksLikeCangjie(rawLang, text) {
  if (rawLang === 'cj' || rawLang === 'cangjie') return true;
  if (rawLang && rawLang !== 'text' && rawLang !== 'plaintext' && rawLang !== 'plain' && rawLang !== 'txt') {
    return false;
  }
  const signals = [
    /^\s*package\s+[\w.]+/m,
    /\bpublic\s+(?:func|class|struct|interface|enum)\b/,
    /\bfunc\s+\w+\s*\([^)]*\)\s*:/,
    /\b(?:Int64|Float64|JsonValue|JsonObject|HashMap<)\b/,
    /^\s*import\s+[\w.]+\.\*\s*$/m,
    /\bmatch\s*\([^)]+\)\s*\{[\s\S]*?\bcase\s+/,
  ];
  let matched = 0;
  for (const re of signals) {
    if (re.test(text)) matched += 1;
  }
  return matched >= 2 || (/^\s*import\s+[\w.]+\.\*\s*$/m.test(text) && text.trim().split('\n').length <= 3);
}

function looksLikePromptTemplate(text) {
  return (
    /personalization-guidance-template|<!--\s*section:|【request\/header|【DSH|【MEMORY_GUIDANCE|【SOUL\.md|【USER\.md|<system-reminder>/.test(text)
  );
}

function looksLikeMarkdownProse(text) {
  return /^#{1,4}\s+\S+/m.test(text) && (/[\u4e00-\u9fff]{6,}/.test(text) || /^-\s+/m.test(text));
}

function classifyCodeBlock(rawLang, rawText, lines, metaAttrs) {
  const normalizedLang = (rawLang || '').toLowerCase();

  if (SHELL_LANGUAGES.has(normalizedLang)) {
    return {
      kind: 'shell',
      langTag: LANG_DISPLAY_MAP[normalizedLang] || normalizedLang.toUpperCase(),
      subtitle: metaAttrs.title,
      showLineNumbers: false,
      defaultWrap: metaAttrs.wrap ?? false,
      highlightCangjie: false,
    };
  }

  if ((!normalizedLang || normalizedLang === 'text' || normalizedLang === 'plaintext' || normalizedLang === 'plain') && looksLikeDirectoryTree(rawText)) {
    return {
      kind: 'structure',
      langTag: 'STRUCTURE',
      subtitle: metaAttrs.title || extractTreeRootTitle(lines),
      showLineNumbers: false,
      defaultWrap: metaAttrs.wrap ?? false,
      highlightCangjie: false,
    };
  }

  if (looksLikeCangjie(normalizedLang, rawText)) {
    return {
      kind: 'code',
      langTag: 'CANGJIE',
      subtitle: metaAttrs.title,
      showLineNumbers: lines.length >= 2,
      defaultWrap: metaAttrs.wrap ?? false,
      highlightCangjie: true,
    };
  }

  if (CODE_LANGUAGES.has(normalizedLang)) {
    return {
      kind: 'code',
      langTag: LANG_DISPLAY_MAP[normalizedLang] || normalizedLang.toUpperCase(),
      subtitle: metaAttrs.title,
      showLineNumbers: lines.length >= 2,
      defaultWrap: metaAttrs.wrap ?? false,
      highlightCangjie: false,
    };
  }

  if (normalizedLang === 'markdown' || normalizedLang === 'md') {
    return {
      kind: 'prompt',
      langTag: 'MARKDOWN',
      subtitle: metaAttrs.title,
      showLineNumbers: false,
      defaultWrap: metaAttrs.wrap ?? true,
      highlightCangjie: false,
    };
  }

  if (looksLikePromptTemplate(rawText)) {
    return {
      kind: 'prompt',
      langTag: 'PROMPT',
      subtitle: metaAttrs.title,
      showLineNumbers: false,
      defaultWrap: metaAttrs.wrap ?? true,
      highlightCangjie: false,
    };
  }

  if (looksLikeMarkdownProse(rawText)) {
    return {
      kind: 'prompt',
      langTag: 'MARKDOWN',
      subtitle: metaAttrs.title,
      showLineNumbers: false,
      defaultWrap: metaAttrs.wrap ?? true,
      highlightCangjie: false,
    };
  }

  return {
    kind: 'prompt',
    langTag: LANG_DISPLAY_MAP[normalizedLang] || (normalizedLang ? normalizedLang.toUpperCase() : 'TEXT'),
    subtitle: metaAttrs.title,
    showLineNumbers: false,
    defaultWrap: metaAttrs.wrap ?? true,
    highlightCangjie: false,
  };
}

function makeSpan(light, dark, text) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { style: `--shiki-light:${light};--shiki-dark:${dark}` },
    children: [{ type: 'text', value: text }],
  };
}

/**
 * Lightweight single-pass tokenizer for Cangjie code blocks when Shiki has no built-in grammar.
 */
function tokenizeCangjieLine(lineText, inBlockComment) {
  const children = [];
  let i = 0;
  let blockComment = inBlockComment;
  const len = lineText.length;

  const pushPlain = (txt) => {
    if (txt) children.push(makeSpan('#24292E', '#ADBAC7', txt));
  };

  while (i < len) {
    if (blockComment) {
      const end = lineText.indexOf('*/', i);
      if (end === -1) {
        children.push(makeSpan('#6A737D', '#768390', lineText.slice(i)));
        i = len;
      } else {
        children.push(makeSpan('#6A737D', '#768390', lineText.slice(i, end + 2)));
        i = end + 2;
        blockComment = false;
      }
      continue;
    }

    if (lineText.startsWith('//', i)) {
      children.push(makeSpan('#6A737D', '#768390', lineText.slice(i)));
      break;
    }

    if (lineText.startsWith('/*', i)) {
      blockComment = true;
      const end = lineText.indexOf('*/', i + 2);
      if (end === -1) {
        children.push(makeSpan('#6A737D', '#768390', lineText.slice(i)));
        i = len;
      } else {
        children.push(makeSpan('#6A737D', '#768390', lineText.slice(i, end + 2)));
        i = end + 2;
        blockComment = false;
      }
      continue;
    }

    const ch = lineText[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < len) {
        if (lineText[j] === '\\') {
          j += 2;
          continue;
        }
        if (lineText[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      children.push(makeSpan('#032F62', '#96D0FF', lineText.slice(i, j)));
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z0-9_]/.test(lineText[i - 1]))) {
      const m = lineText.slice(i).match(/^(?:0x[0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]+)?)/);
      if (m) {
        children.push(makeSpan('#005CC5', '#6CB6FF', m[0]));
        i += m[0].length;
        continue;
      }
    }

    if (/[A-Za-z_]/.test(ch)) {
      const m = lineText.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      const word = m[0];
      const nextChar = lineText[i + word.length];
      if (CANGJIE_KEYWORDS.has(word)) {
        children.push(makeSpan('#D73A49', '#F47067', word));
      } else if (CANGJIE_TYPES.has(word) || /^[A-Z]/.test(word)) {
        children.push(makeSpan('#005CC5', '#6CB6FF', word));
      } else if (nextChar === '(') {
        children.push(makeSpan('#6F42C1', '#DCBDFB', word));
      } else {
        pushPlain(word);
      }
      i += word.length;
      continue;
    }

    const m = lineText.slice(i).match(/^[^A-Za-z0-9_"'/]+|^\/(?![/*])/);
    const chunk = m ? m[0] : ch;
    pushPlain(chunk);
    i += chunk.length;
  }

  return { children, inBlockComment: blockComment };
}

function svgEl(paths, extraProps = {}) {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      'aria-hidden': 'true',
      fill: 'none',
      viewBox: '0 0 24 24',
      ...extraProps,
    },
    children: paths,
  };
}

function buildKindIcon(kind) {
  if (kind === 'shell') {
    return svgEl([
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'm5 7 5 5-5 5M12 17h7', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        children: [],
      },
    ], { className: ['cb-type-icon'] });
  }
  if (kind === 'structure') {
    return svgEl([
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linejoin': 'round' },
        children: [],
      },
    ], { className: ['cb-type-icon'] });
  }
  if (kind === 'prompt') {
    return svgEl([
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M7 4h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linejoin': 'round' },
        children: [],
      },
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M9 13h6M9 17h4', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' },
        children: [],
      },
    ], { className: ['cb-type-icon'] });
  }
  return svgEl([
    {
      type: 'element',
      tagName: 'path',
      properties: { d: 'm8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      children: [],
    },
  ], { className: ['cb-type-icon'] });
}

function buildWrapIcon() {
  return svgEl([
    {
      type: 'element',
      tagName: 'path',
      properties: { d: 'M4 6h16M4 12h11a3 3 0 1 1 0 6h-3m0 0 2-2m-2 2 2 2M4 18h5', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      children: [],
    },
  ]);
}

function buildCopyIcon() {
  return svgEl([
    {
      type: 'element',
      tagName: 'rect',
      properties: { x: '8.2', y: '7.2', width: '10.5', height: '12', rx: '1.8', stroke: 'currentColor', 'stroke-width': '1.8' },
      children: [],
    },
    {
      type: 'element',
      tagName: 'path',
      properties: { d: 'M5.3 15.3H4.8a1.8 1.8 0 0 1-1.8-1.8V4.8A1.8 1.8 0 0 1 4.8 3h8.7a1.8 1.8 0 0 1 1.8 1.8v.5', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' },
      children: [],
    },
  ]);
}

function buildChevronIcon() {
  return svgEl([
    {
      type: 'element',
      tagName: 'path',
      properties: { d: 'm6 9 6 6 6-6', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      children: [],
    },
  ]);
}

function extractLinesFromCodeElement(codeEl) {
  const spanLines = (codeEl.children || []).filter((child) => child?.type === 'element' && child.tagName === 'span' && hasClass(child, 'line'));
  if (spanLines.length > 0) {
    return spanLines.map((lineNode) => ({
      text: getTextContent(lineNode),
      children: Array.isArray(lineNode.children) ? lineNode.children : [],
    }));
  }
  const raw = getTextContent(codeEl).replace(/\r\n?/g, '\n');
  const trimmed = raw.endsWith('\n') ? raw.slice(0, -1) : raw;
  return trimmed.split('\n').map((line) => ({
    text: line,
    children: [{ type: 'text', value: line }],
  }));
}

function sanitizePreProperties(preNode) {
  const props = { ...(preNode.properties || {}) };
  if (typeof props.style === 'string') {
    props.style = props.style
      .replace(/overflow-x\s*:\s*[^;]+;?/gi, '')
      .trim();
  }
  delete props.tabIndex;
  delete props.tabindex;
  preNode.properties = props;
}

function buildRowElement(lineObj, idx, config, state) {
  const rowChildren = [];

  if (config.showLineNumbers) {
    rowChildren.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['cb-ln'], 'aria-hidden': 'true' },
      children: [{ type: 'text', value: String(idx + 1) }],
    });
  } else if (config.kind === 'shell') {
    const trimmed = lineObj.text.trim();
    const shouldPrompt = trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('$ ') && !trimmed.startsWith('>');
    rowChildren.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['cb-shell-prompt', shouldPrompt ? '' : 'is-empty'].filter(Boolean), 'aria-hidden': 'true' },
      children: [{ type: 'text', value: shouldPrompt ? '$' : '' }],
    });
  }

  let lineChildren = lineObj.children;
  if (config.highlightCangjie) {
    const tokenized = tokenizeCangjieLine(lineObj.text, state.inBlockComment);
    state.inBlockComment = tokenized.inBlockComment;
    lineChildren = tokenized.children;
  }

  if (!lineChildren || lineChildren.length === 0) {
    lineChildren = [{ type: 'text', value: '' }];
  }

  rowChildren.push({
    type: 'element',
    tagName: 'span',
    properties: { className: ['cb-lc'] },
    children: lineChildren,
  });

  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['cb-row'] },
    children: rowChildren,
  };
}

function transformPreToShell(preNode) {
  const codeNode = (preNode.children || []).find((child) => child?.type === 'element' && child.tagName === 'code');
  if (!codeNode) return null;

  const lines = extractLinesFromCodeElement(codeNode);
  const rawText = lines.map((l) => l.text).join('\n');
  const rawLang = String(preNode.properties?.['data-language'] || preNode.properties?.dataLanguage || '').trim();
  const meta = String(preNode.properties?.['data-meta'] || preNode.properties?.dataMeta || '').trim();
  const metaAttrs = parseMetaAttributes(meta);
  const config = classifyCodeBlock(rawLang, rawText, lines, metaAttrs);

  const maxLineLength = lines.reduce((max, l) => Math.max(max, l.text.length), 0);
  const isCollapsible = metaAttrs.collapse !== null ? metaAttrs.collapse : lines.length > COLLAPSE_LINE_THRESHOLD;
  const showWrapButton = config.kind === 'prompt' || maxLineLength > WRAP_LINE_LENGTH_THRESHOLD;

  sanitizePreProperties(preNode);

  const tokenizeState = { inBlockComment: false };
  codeNode.children = lines.map((lineObj, idx) => buildRowElement(lineObj, idx, config, tokenizeState));

  const metaChildren = [
    buildKindIcon(config.kind),
    {
      type: 'element',
      tagName: 'span',
      properties: { className: ['code-block-lang'] },
      children: [{ type: 'text', value: config.langTag }],
    },
  ];
  if (config.subtitle) {
    metaChildren.push(
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['code-block-dot'], 'aria-hidden': 'true' },
        children: [{ type: 'text', value: '·' }],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['code-block-file'] },
        children: [{ type: 'text', value: config.subtitle }],
      }
    );
  }

  const actionButtons = [];
  if (showWrapButton) {
    actionButtons.push({
      type: 'element',
      tagName: 'button',
      properties: {
        type: 'button',
        className: ['code-block-action-btn', 'code-block-wrap', ...(config.defaultWrap ? ['is-active'] : [])],
        title: 'Toggle word wrap',
        'aria-label': 'Toggle word wrap',
        'aria-pressed': config.defaultWrap ? 'true' : 'false',
      },
      children: [buildWrapIcon()],
    });
  }

  actionButtons.push({
    type: 'element',
    tagName: 'button',
    properties: {
      type: 'button',
      className: ['code-block-action-btn', 'code-block-copy'],
      title: 'Copy code',
      'aria-label': 'Copy code',
    },
    children: [buildCopyIcon()],
  });

  if (isCollapsible) {
    actionButtons.push({
      type: 'element',
      tagName: 'button',
      properties: {
        type: 'button',
        className: ['code-block-action-btn', 'code-block-toggle'],
        title: 'Expand code block',
        'aria-label': 'Expand code block',
        'aria-expanded': 'false',
      },
      children: [buildChevronIcon()],
    });
  }

  const bodyChildren = [preNode];
  if (isCollapsible) {
    bodyChildren.push({
      type: 'element',
      tagName: 'div',
      properties: { className: ['code-block-fade'], 'aria-hidden': 'true' },
      children: [],
    });
  }

  const shellClasses = [
    'code-block-shell',
    `cb-kind-${config.kind}`,
    ...(config.showLineNumbers ? ['has-line-numbers'] : []),
    ...(config.defaultWrap ? ['is-wrapped'] : []),
    ...(isCollapsible ? ['is-collapsible', 'is-collapsed'] : []),
  ];

  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: shellClasses,
      'data-cb-kind': config.kind,
      ...(isCollapsible ? { 'data-cb-collapsible': 'true' } : {}),
      'data-raw-code': rawText,
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block-head'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block-meta'] },
            children: metaChildren,
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block-actions'] },
            children: actionButtons,
          },
        ],
      },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block-body'] },
        children: bodyChildren,
      },
    ],
  };
}

function visitAndTransform(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];
    if (child?.type !== 'element') continue;
    if (child.tagName === 'div' && hasClass(child, 'code-block-shell')) continue;
    if (child.tagName === 'pre') {
      const wrapped = transformPreToShell(child);
      if (wrapped) {
        node.children[i] = wrapped;
        continue;
      }
    }
    visitAndTransform(child);
  }
}

/**
 * Rehype plugin that wraps Markdown code blocks into Monochrome Editorial shells at build time.
 */
export function rehypeCodeBlock() {
  return (tree) => {
    visitAndTransform(tree);
  };
}
