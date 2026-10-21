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
 * `check-docs`. Гайд со стороны (`source` в реестре) собирается по главам с
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
  source: { label: string; url: string; commit: string } | null;
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
.dsgp-meta {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 8px 16px;
  font-size: 13px;
  line-height: 20px;
  margin: 0 0 40px;
  padding: 16px 20px;
  border: 1px solid ${T.border};
  border-radius: 12px;
}
.dsgp-meta dt { color: ${T.textSecondary}; }
.dsgp-meta dd { margin: 0; }
.dsgp-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${T.surfaceMuted};
  font-size: 12px;
  line-height: 18px;
}
.dsgp-link { color: var(--ds-accent); text-decoration: none; }
.dsgp-link:hover { text-decoration: underline; }
.dsgp-link:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; border-radius: 4px; }

.dsgp-body h2 {
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  margin: 48px 0 16px;
  padding-top: 24px;
  border-top: 1px solid ${T.border};
}
.dsgp-body h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
.dsgp-body h3 { font-size: 16px; line-height: 24px; font-weight: 600; margin: 28px 0 12px; }
.dsgp-body p, .dsgp-body li { font-size: 14px; line-height: 22px; }
.dsgp-body ul, .dsgp-body ol { padding-left: 22px; }
.dsgp-body li { margin: 6px 0; }
.dsgp-body a { color: var(--ds-accent); }
.dsgp-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  background: ${T.surfaceMuted};
  padding: 2px 5px;
  border-radius: 4px;
}
.dsgp-body pre {
  background: ${T.surfaceZebra};
  border: 1px solid ${T.border};
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
}
.dsgp-body pre code { background: none; padding: 0; font-size: 12.5px; line-height: 20px; }
.dsgp-body blockquote {
  margin: 20px 0;
  padding: 12px 18px;
  border-left: 3px solid ${T.border};
  background: ${T.surfaceZebra};
  border-radius: 0 8px 8px 0;
}
.dsgp-body blockquote p { margin: 6px 0; }
.dsgp-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
  font-size: ${T.tableFontSize};
  line-height: ${T.tableLineHeight};
}
.dsgp-body th, .dsgp-body td {
  border: 1px solid ${T.border};
  padding: ${T.tableCellPadding};
  text-align: left;
  vertical-align: top;
}
.dsgp-body th {
  background: ${T.surfaceMuted};
  font-size: ${T.tableHeadFontSize};
  letter-spacing: ${T.tableHeadLetterSpacing};
  text-transform: uppercase;
  color: ${T.textSecondary};
}
.dsgp-body hr { border: none; border-top: 1px solid ${T.border}; margin: 32px 0; }
.dsgp-missing { padding: 40px 0; font-size: 14px; line-height: 22px; }

.dsgp-body details {
  margin: 8px 0 0;
  padding: 8px 12px;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surfaceZebra};
}
.dsgp-body summary { cursor: pointer; color: ${T.textSecondary}; }
.dsgp-body small { font-size: 12px; color: ${T.textSecondary}; }
.dsgp-diagram {
  margin: 20px 0;
  padding: 12px 18px;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surfaceZebra};
}
.dsgp-diagram figcaption {
  font-size: ${T.tableHeadFontSize};
  letter-spacing: ${T.tableHeadLetterSpacing};
  text-transform: uppercase;
  color: ${T.textSecondary};
  margin-bottom: 6px;
}
.dsgp-diagram ol { margin: 0; }

.dsgp-chapter-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 48px 0 0;
  padding-top: 24px;
  border-top: 1px solid ${T.border};
}
.dsgp-chapter-link {
  display: block;
  padding: 12px 16px;
  border: 1px solid ${T.border};
  border-radius: ${T.cardRadius};
  text-decoration: none;
  color: ${T.textPrimary};
  font-size: 14px;
  line-height: 20px;
}
.dsgp-chapter-link:hover { background: ${T.surfaceZebra}; }
.dsgp-chapter-link:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }
.dsgp-chapter-link span { display: block; font-size: 12px; color: ${T.textSecondary}; }
.dsgp-chapter-link--next { grid-column: 2; text-align: right; }


@media (max-width: 900px) { .dsgp { padding: ${T.pagePaddingTablet}; } }
@media (max-width: 600px) {
  .dsgp { padding: ${T.pagePaddingMobile}; }
  .dsgp-meta { grid-template-columns: 1fr; gap: 4px 0; }
  .dsgp-meta dt { margin-top: 8px; }
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
                  {meta.source ? (
                    <>
                      <a className="dsgp-link" href={meta.source.url} rel="noopener noreferrer">
                        {meta.source.label}
                      </a>
                      {' · снимок '}
                      <code>{meta.source.commit.slice(0, 7)}</code>
                    </>
                  ) : (
                    <code>{meta.sourcePath}</code>
                  )}
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
