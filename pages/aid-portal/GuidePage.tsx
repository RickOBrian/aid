import { useEffect, useMemo } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { DS_CHANGELOG_TABLE_STYLE, DS_PORTAL_LAYOUT_TOKENS as T } from './dsChangelogTable';
import { HUB_ROUTES } from './hubData';
import { currentAppPath, withBase } from './base';
import { productPath, resolveProductId } from './productRegistry';
import {
  GUIDE_PUBLICATION_STYLE,
  GuidePublicationBadge,
  isPendingApproval,
} from './GuidePublicationBadge';

/**
 * Страница гайда.
 *
 * Содержание не хранится здесь: тело собрано из канонического .md на сборке
 * (`scripts/build-guides.mjs`) и подключается как готовый HTML. Один движок
 * на все гайды — вместо страницы на каждый, которую приходилось вручную
 * держать в соответствии с источником (ADR-002).
 *
 * Канонические гайды приходят из нашего же репозитория и проходят
 * `check-docs`. Гайд со стороны (`chapters` в реестре) собирается по главам с
 * ограниченной разметкой — `scripts/external-guide-markdown.mjs`; ссылки
 * между главами приходят как `aid-route:/guides/...`, базу превью и продукт
 * подставляет `resolveRouteLinks`.
 */

const guideHtmlModules = import.meta.glob('./generated/guides/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

interface GuideIndexEntry {
  guideId: string;
  title: string;
  canonicalName: string;
  version: string | null;
  status: string;
  lastReviewed: string | null;
  kind: string | null;
  sourcePath: string;
  sourceDownloadUrl: string | null;
  description: string | null;
  reviewRoute: string;
  publication: string;
  author: string | null;
  chapters: GuideChapter[] | null;
}

interface GuideChapter {
  chapterId: string;
  title: string;
  route: string;
}

const guideIndexModules = import.meta.glob('./generated/guides/index.json', {
  eager: true,
  import: 'default',
}) as Record<string, GuideIndexEntry[]>;

const GUIDE_INDEX: GuideIndexEntry[] = Object.values(guideIndexModules)[0] ?? [];

interface GuideMatch {
  guide: GuideIndexEntry;
  /** Глава многоглавного гайда; у одностраничного — null. */
  chapter: GuideChapter | null;
  chapterIndex: number;
}

function guideRoute(guide: GuideIndexEntry): string {
  return guide.reviewRoute ?? `${HUB_ROUTES.guides}/${guide.guideId}`;
}

/** Гайд и глава по адресу без продукта: `/guides/versioning`, `/guides/preview/<id>/<глава>`. */
export function findGuideByPath(path: string): GuideMatch | null {
  for (const guide of GUIDE_INDEX) {
    if (guide.chapters) {
      const chapterIndex = guide.chapters.findIndex((chapter) => chapter.route === path);
      if (chapterIndex >= 0) return { guide, chapter: guide.chapters[chapterIndex], chapterIndex };
    } else if (guideRoute(guide) === path) {
      return { guide, chapter: null, chapterIndex: -1 };
    }
  }
  return null;
}

const ROUTE_HREF = /href="aid-route:([^"#]*)(#[^"]*)?"/g;

/** `href="aid-route:/guides/..."` → адрес с базой превью и продуктом. */
export function resolveRouteLinks(html: string, toHref: (route: string) => string): string {
  return html.replace(ROUTE_HREF, (_, route: string, hash = '') => `href="${toHref(route)}${hash}"`);
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  alpha: 'Альфа',
  beta: 'Бета',
  stable: 'Стабильный',
  deprecated: 'Устарел',
};

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${GUIDE_PUBLICATION_STYLE}
.dsgp, .dsgp *, .dsgp *::before, .dsgp *::after { box-sizing: border-box; }
.dsgp {
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
}
.dsgp-shell { max-width: 820px; margin: 0 auto; }
/* Мета-список — вид IslandMeta (спека presentbook-6 §2) */
.dsgp-meta {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: var(--pf-spacing-8) var(--pf-spacing-16);
  font: var(--pf-font-body-s);
  margin: 0 0 var(--pf-spacing-40);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-l);
}
.dsgp-meta dt { color: ${T.textSecondary}; }
.dsgp-meta dd { margin: 0; color: ${T.textPrimary}; }
.dsgp-meta code { font: var(--pf-font-code-s); }
/* Статус гайда — Badge Neutral */
.dsgp-status {
  display: inline-flex;
  align-items: center;
  padding: var(--pf-spacing-4) var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  background: var(--pf-bg-accent-status-neutral-main);
  font: var(--pf-font-label-s);
  color: var(--pf-text-neutral);
}
.dsgp-link { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
.dsgp-link:hover { text-decoration: underline; }
.dsgp-link:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); border-radius: var(--pf-radius-s); }

/* h2 — HeaderSection: heading-l, линия сверху line-default */
.dsgp-body h2 {
  font: var(--pf-font-heading-l);
  letter-spacing: var(--pf-tracking-heading-l);
  margin: var(--pf-spacing-48) 0 var(--pf-spacing-16);
  padding-top: var(--pf-spacing-24);
  border-top: 1px solid ${T.border};
}
.dsgp-body h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
.dsgp-body h3 { font: var(--pf-font-heading-m); margin: var(--pf-spacing-32) 0 var(--pf-spacing-12); }
.dsgp-body h4 { font: var(--pf-font-heading-s); margin: var(--pf-spacing-24) 0 var(--pf-spacing-8); }
.dsgp-body p, .dsgp-body li { font: var(--pf-font-body-m); }
.dsgp-body ul, .dsgp-body ol { padding-left: var(--pf-spacing-24); }
.dsgp-body li { margin: var(--pf-spacing-6) 0; }
.dsgp-body a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
.dsgp-body a:hover { text-decoration: underline; }
.dsgp-body a:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); border-radius: var(--pf-radius-s); }
.dsgp-body code {
  font: var(--pf-font-code-s);
  background: ${T.surfaceMuted};
  padding: var(--pf-spacing-2) var(--pf-spacing-4);
  border-radius: var(--pf-radius-s);
}
/* Блок кода — вид IslandCode */
.dsgp-body pre {
  background: ${T.surfaceZebra};
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-16);
  overflow-x: auto;
}
.dsgp-body pre code { background: none; padding: 0; font: var(--pf-font-code-m); }
/* Цитата — вид Banner Info */
.dsgp-body blockquote {
  margin: var(--pf-spacing-20) 0;
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
  border: none;
  background: var(--pf-bg-accent-status-info-main);
  color: var(--pf-text-primary);
  border-radius: var(--pf-radius-m);
}
.dsgp-body blockquote p { margin: var(--pf-spacing-6) 0; }
/* Таблица — рамка таблицы и линии строк, без вертикальных линий (§2) */
.dsgp-body table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: var(--pf-spacing-16) 0;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  font: var(--pf-font-body-s);
}
.dsgp-body th, .dsgp-body td {
  border: none;
  border-bottom: 1px solid ${T.border};
  padding: ${T.tableCellPadding};
  text-align: left;
  vertical-align: top;
}
.dsgp-body tr:last-child > td { border-bottom: none; }
.dsgp-body th {
  background: ${T.surfaceMuted};
  font: var(--pf-font-label-xs-caps);
  letter-spacing: ${T.tableHeadLetterSpacing};
  text-transform: uppercase;
  color: ${T.textPrimary};
}
.dsgp-body tr:first-child > th:first-child { border-top-left-radius: ${T.tableWrapRadius}; }
.dsgp-body tr:first-child > th:last-child { border-top-right-radius: ${T.tableWrapRadius}; }
.dsgp-body hr { border: none; border-top: 1px solid ${T.border}; margin: var(--pf-spacing-32) 0; }
.dsgp-missing { padding: var(--pf-spacing-40) 0; font: var(--pf-font-body-m); }

.dsgp-body details {
  margin: var(--pf-spacing-8) 0 0;
  padding: var(--pf-spacing-8) var(--pf-spacing-12);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  background: ${T.surfaceZebra};
}
.dsgp-body summary {
  cursor: pointer;
  color: ${T.textSecondary};
  font-family: var(--pf-type-family-sans-1);
  font-size: 14px; /* pf-gap: label-m 14/20·500 */
  line-height: 20px; /* pf-gap: label-m */
  font-weight: var(--pf-type-weight-500);
}
.dsgp-body summary:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); }
.dsgp-body small { font-size: 12px; /* pf-gap: body-xs 12/16·400 */ color: ${T.textSecondary}; }
.dsgp-diagram {
  margin: var(--pf-spacing-20) 0;
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  background: ${T.surfaceZebra};
}
.dsgp-diagram figcaption {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: ${T.textSecondary};
  margin-bottom: var(--pf-spacing-6);
}
.dsgp-diagram ol { margin: 0; }

.dsgp-chapter-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--pf-spacing-16);
  margin: var(--pf-spacing-48) 0 0;
  padding-top: var(--pf-spacing-24);
  border-top: 1px solid ${T.border};
}
/* Навигация по главам — вид IslandLink */
.dsgp-chapter-link {
  display: block;
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  background: ${T.surface};
  text-decoration: none;
  color: ${T.textPrimary};
  font: var(--pf-font-body-m);
  transition: border-color 150ms ease, background-color 150ms ease;
}
.dsgp-chapter-link:hover {
  border-color: ${T.borderHover};
  background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */
}
.dsgp-chapter-link:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); }
.dsgp-chapter-link span {
  display: block;
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  line-height: 16px; /* pf-gap: body-xs */
  color: ${T.textSecondary};
}
.dsgp-chapter-link--next { grid-column: 2; text-align: right; }


@media (max-width: 1023px) { .dsgp { padding: ${T.pagePaddingTablet}; } }
@media (max-width: 767px) {
  .dsgp { padding: ${T.pagePaddingMobile}; }
  .dsgp-meta { grid-template-columns: 1fr; gap: var(--pf-spacing-4) 0; }
  .dsgp-meta dt { margin-top: var(--pf-spacing-8); }
  .dsgp-body table { display: block; overflow-x: auto; }
  .dsgp-chapter-nav { grid-template-columns: 1fr; }
  .dsgp-chapter-link--next { grid-column: 1; }
}
`;

function ChapterNav({ chapters, index, toHref }: { chapters: GuideChapter[]; index: number; toHref: (route: string) => string }) {
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;
  return (
    <nav className="dsgp-chapter-nav" aria-label="Главы гайда">
      {prev ? (
        <a className="dsgp-chapter-link" href={withBase(toHref(prev.route))}>
          <span>← Назад</span>
          {prev.title}
        </a>
      ) : null}
      {next ? (
        <a className="dsgp-chapter-link dsgp-chapter-link--next" href={withBase(toHref(next.route))}>
          <span>Дальше →</span>
          {next.title}
        </a>
      ) : null}
    </nav>
  );
}

export function GuidePage({ path }: { path: string }) {
  const match = useMemo(() => findGuideByPath(path), [path]);
  const meta = match?.guide;
  const chapter = match?.chapter ?? null;
  const chapters = meta?.chapters ?? null;
  const productId = resolveProductId(currentAppPath());
  const toHref = (route: string) => productPath(productId, route);

  const html = useMemo(() => {
    if (!meta) return null;
    const fileName = chapter ? `${meta.guideId}--${chapter.chapterId}` : meta.guideId;
    const key = Object.keys(guideHtmlModules).find((modulePath) => modulePath.endsWith(`/${fileName}.html`));
    return key ? resolveRouteLinks(guideHtmlModules[key], (route) => withBase(productPath(productId, route))) : null;
  }, [meta, chapter, productId]);

  const isLanding = Boolean(chapters && match?.chapterIndex === 0);
  const title = chapter && !isLanding ? chapter.title : (meta?.title ?? path);
  const pending = isPendingApproval(meta?.publication);
  const backHref = chapters && !isLanding ? meta!.reviewRoute : HUB_ROUTES.guides;

  useEffect(() => {
    document.title = title || 'Гайд';
  }, [title]);

  return (
    <div className="dsgp">
      <style>{PAGE_STYLE}</style>
      <DsPageHeader title={title} backHref={backHref} showSearch={false} />

      <div className="dsgp-shell">
        {!html || !meta ? (
          <p className="dsgp-missing">
            Гайд по адресу «{path}» не собран. Проверь запись в <code>guide-registry.json</code> и запусти{' '}
            <code>node scripts/build-guides.mjs</code>.
          </p>
        ) : (
          <>
            {pending ? (
              <div className="ds-publication-note" role="note">
                <p className="ds-publication-note-title">Ждёт согласования</p>
                <p>
                  Черновик для согласования: гайд ещё не принят в Presentbook и не сверен со стандартами
                  дизайн-системы. Текст может измениться.
                </p>
              </div>
            ) : null}

            {isLanding || !chapters ? (
              <dl className="dsgp-meta">
                {meta.version || !pending ? (
                  <>
                    <dt>Версия</dt>
                    <dd>{meta.version ?? '—'}</dd>
                  </>
                ) : null}
                <dt>Статус</dt>
                <dd>
                  {pending ? (
                    <GuidePublicationBadge />
                  ) : (
                    <span className="dsgp-status">{STATUS_LABEL[meta.status] ?? meta.status}</span>
                  )}
                </dd>
                {meta.author ? (
                  <>
                    <dt>Автор</dt>
                    <dd>{meta.author}</dd>
                  </>
                ) : null}
                {meta.lastReviewed ? (
                  <>
                    <dt>Сверено</dt>
                    <dd>{meta.lastReviewed}</dd>
                  </>
                ) : null}
                <dt>Источник</dt>
                <dd>
                  <code>{meta.sourcePath}</code>
                  {meta.sourceDownloadUrl ? (
                    <>
                      {' · '}
                      <a className="dsgp-link" href={withBase(meta.sourceDownloadUrl)} download>
                        скачать .md
                      </a>
                    </>
                  ) : null}
                </dd>
              </dl>
            ) : null}

            {chapters && !isLanding ? (
              <dl className="dsgp-meta">
                <dt>Гайд</dt>
                <dd>
                  <a className="dsgp-link" href={withBase(toHref(meta.reviewRoute))}>
                    {meta.title}
                  </a>
                </dd>
                <dt>Автор</dt>
                <dd>{meta.author ?? '—'}</dd>
              </dl>
            ) : null}

            <div className="dsgp-body" dangerouslySetInnerHTML={{ __html: html }} />

            {chapters && match ? <ChapterNav chapters={chapters} index={match.chapterIndex} toHref={toHref} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
