/**
 * Разбор markdown гайда из внешнего источника (не из skills/_shared/).
 *
 * Канонические гайды пишутся в нашем репозитории и проходят check-docs,
 * поэтому их HTML идёт на страницу как есть. Гайд со стороны (например,
 * «Git for Beginners» из репозитория автора) — нет, и здесь его разметка
 * ограничивается тем, что нужно тексту:
 *
 * - сырой HTML экранируется, кроме тегов без атрибутов из белого списка
 *   (`details`, `summary`, `small`, `br`);
 * - ссылки — только http(s), mailto, якоря и соседние главы (`02-commit.md`);
 *   остальное остаётся текстом, картинки — подписью;
 * - схемы mermaid превращаются в текст: интерактива и скриптов на странице
 *   гайда нет, а исходник схемы читателю не поможет.
 *
 * Ссылка на главу пишется как `aid-route:/guides/...` — базу превью
 * (`/pr-N/`) и продукт подставляет страница при показе (`GuidePage.tsx`).
 */

import { Marked } from 'marked';

export const ROUTE_HREF_PREFIX = 'aid-route:';

const ALLOWED_TAGS = ['details', 'summary', 'small', 'br'];

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Якорь заголовка: латиница и кириллица в kebab-case (как в build-guides). */
export function slug(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Сырой HTML: всё экранируется, затем возвращаются только теги белого списка
 * без атрибутов. Внутри HTML-блока markdown не разбирается, поэтому `код` и
 * **жирный** в ответах «Проверь себя» размечаются здесь же.
 */
export function sanitizeHtml(raw) {
  let html = escapeHtml(raw);
  const tags = ALLOWED_TAGS.join('|');
  html = html.replace(new RegExp(`&lt;(/?)(${tags})\\s*/?&gt;`, 'gi'), (_, close, tag) =>
    tag.toLowerCase() === 'br' ? '<br>' : `<${close}${tag.toLowerCase()}>`,
  );
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  return html;
}

/* ---------- mermaid → текст ---------- */

function plainLabel(label) {
  return label
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Узел схемы в две строки: «Мой компьютер<br/>локальный репозиторий».
   Вторая строка — пояснение, она уходит в скобки; если она продолжает фразу
   («Merge<br/>в main», «PR открыт /<br/>…») или уже в скобках, строки
   просто склеиваются. */
const CONTINUATION = /^(и|в|во|без|на|с|со|для|к|по|из|от)\s/u;

function nodeLabel(label) {
  const [first, ...rest] = label.split(/<br\s*\/?>/i).map((part) => plainLabel(part));
  const tail = rest.filter(Boolean).join(' ');
  if (!tail) return first;
  const joins = CONTINUATION.test(tail) || tail.startsWith('(') || first.endsWith('/');
  return joins ? `${first} ${tail}` : `${first} (${tail})`;
}

const FLOW_NODE = String.raw`([\p{L}\p{N}_]+)(?:\["([^"]*)"\])?`;
const FLOW_ARROW = String.raw`(?:--\s*"([^"]*)"\s*-->|-\.\s*"([^"]*)"\s*\.->|-->|-\.->)`;
const FLOW_EDGE = new RegExp(`^${FLOW_NODE}\\s*${FLOW_ARROW}\\s*${FLOW_NODE}$`, 'u');

function flowchartSteps(lines) {
  const labels = new Map();
  const edges = [];
  for (const line of lines) {
    const m = line.match(FLOW_EDGE);
    if (!m) return null;
    const [, from, fromLabel, solidLabel, dottedLabel, to, toLabel] = m;
    if (fromLabel !== undefined) labels.set(from, nodeLabel(fromLabel));
    if (toLabel !== undefined) labels.set(to, nodeLabel(toLabel));
    edges.push({ from, to, label: solidLabel ?? dottedLabel ?? null });
  }
  return edges.map(({ from, to, label }) => {
    const text = `${labels.get(from) ?? from} → ${labels.get(to) ?? to}`;
    return label ? `${text}: ${plainLabel(label)}` : text;
  });
}

function sequenceSteps(lines) {
  const names = new Map();
  const steps = [];
  for (const line of lines) {
    const participant = line.match(/^participant\s+(\S+)(?:\s+as\s+(.+))?$/u);
    if (participant) {
      names.set(participant[1], (participant[2] ?? participant[1]).trim());
      continue;
    }
    const message = line.match(/^(\S+?)\s*-{1,2}>>?\s*(\S+?)\s*:\s*(.+)$/u);
    if (!message) return null;
    const [, from, to, text] = message;
    steps.push(`${names.get(from) ?? from} → ${names.get(to) ?? to}: ${plainLabel(text)}`);
  }
  return steps;
}

function gitGraphSteps(lines) {
  let current = 'main';
  const steps = [];
  for (const line of lines) {
    const commit = line.match(/^commit(?:\s+id:\s*"([^"]*)")?(?:\s+tag:\s*"([^"]*)")?\s*$/u);
    if (commit) {
      const [, id, tag] = commit;
      const name = id ? `коммит «${id}»` : 'коммит';
      steps.push(`${current}: ${name}${tag ? `, тег ${tag}` : ''}`);
      continue;
    }
    const branch = line.match(/^branch\s+(\S+)$/u);
    if (branch) {
      steps.push(`от ${current} создана ветка ${branch[1]}`);
      current = branch[1];
      continue;
    }
    const checkout = line.match(/^(?:checkout|switch)\s+(\S+)$/u);
    if (checkout) {
      current = checkout[1];
      continue;
    }
    const merge = line.match(/^merge\s+(\S+)(?:\s+id:\s*"([^"]*)")?\s*$/u);
    if (merge) {
      steps.push(`${merge[1]} слита в ${current}${merge[2] ? ` — «${merge[2]}»` : ''}`);
      continue;
    }
    return null;
  }
  return steps;
}

/**
 * Схема mermaid как упорядоченный список шагов. Тип, который не разобран,
 * показывается исходником — честнее, чем выдуманный пересказ.
 */
export function mermaidToHtml(source) {
  const [head = '', ...rest] = source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const kind = head.split(/\s+/)[0];
  const parsers = { flowchart: flowchartSteps, graph: flowchartSteps, sequenceDiagram: sequenceSteps, gitGraph: gitGraphSteps };
  const steps = parsers[kind]?.(rest) ?? null;

  if (!steps || steps.length === 0) {
    return `<figure class="dsgp-diagram"><figcaption>Схема</figcaption><pre><code>${escapeHtml(source)}</code></pre></figure>\n`;
  }
  const items = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  return `<figure class="dsgp-diagram"><figcaption>Схема</figcaption><ol>${items}</ol></figure>\n`;
}

/* ---------- markdown ---------- */

/**
 * @param {{ resolveChapter: (fileName: string) => string | null }} options
 *   `resolveChapter('02-commit.md')` → маршрут главы или null.
 */
export function createExternalMarked({ resolveChapter }) {
  const marked = new Marked();
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
      },
      html({ text }) {
        return sanitizeHtml(text);
      },
      code({ text, lang }) {
        if ((lang ?? '').trim() === 'mermaid') return mermaidToHtml(text);
        return `<pre><code>${escapeHtml(text)}</code></pre>\n`;
      },
      image({ text }) {
        return escapeHtml(text ?? '');
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const chapter = href.match(/^(?:\.\/)?([\w-]+\.md)(#[\w\p{L}-]*)?$/u);
        if (chapter) {
          const route = resolveChapter(chapter[1]);
          if (!route) return text;
          return `<a href="${ROUTE_HREF_PREFIX}${escapeHtml(route)}${escapeHtml(chapter[2] ?? '')}"${titleAttr}>${text}</a>`;
        }
        if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
          return `<a href="${escapeHtml(href)}"${titleAttr} rel="noopener noreferrer">${text}</a>`;
        }
        if (href.startsWith('#')) {
          return `<a href="${escapeHtml(href)}"${titleAttr}>${text}</a>`;
        }
        return text;
      },
    },
  });
  return marked;
}
