import { useEffect, useMemo } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { DS_CHANGELOG_TABLE_STYLE, DS_PORTAL_LAYOUT_TOKENS as T } from './dsChangelogTable';
import { HUB_ROUTES } from './hubData';

/**
 * Страница гайда.
 *
 * Содержание не хранится здесь: тело собрано из канонического .md на сборке
 * (`scripts/build-guides.mjs`) и подключается как готовый HTML. Один движок
 * на все гайды — вместо страницы на каждый, которую приходилось вручную
 * держать в соответствии с источником (ADR-002).
 *
 * Разметка приходит из нашего же репозитория и проходит `check-docs`,
 * внешнего содержимого здесь не бывает.
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
}

const guideIndexModules = import.meta.glob('./generated/guides/index.json', {
  eager: true,
  import: 'default',
}) as Record<string, GuideIndexEntry[]>;

const GUIDE_INDEX: GuideIndexEntry[] = Object.values(guideIndexModules)[0] ?? [];

export function guideExists(guideId: string): boolean {
  return GUIDE_INDEX.some((guide) => guide.guideId === guideId);
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

@media (max-width: 900px) { .dsgp { padding: ${T.pagePaddingTablet}; } }
@media (max-width: 600px) {
  .dsgp { padding: ${T.pagePaddingMobile}; }
  .dsgp-meta { grid-template-columns: 1fr; gap: 4px 0; }
  .dsgp-meta dt { margin-top: 8px; }
}
`;

export function GuidePage({ guideId }: { guideId: string }) {
  const meta = useMemo(() => GUIDE_INDEX.find((guide) => guide.guideId === guideId), [guideId]);
  const html = useMemo(() => {
    const key = Object.keys(guideHtmlModules).find((path) => path.endsWith(`/${guideId}.html`));
    return key ? guideHtmlModules[key] : null;
  }, [guideId]);

  useEffect(() => {
    document.title = meta?.title ?? 'Гайд';
  }, [meta]);

  return (
    <div className="dsgp">
      <style>{PAGE_STYLE}</style>
      <DsPageHeader title={meta?.title ?? guideId} backHref={HUB_ROUTES.guides} showSearch={false} />

      <div className="dsgp-shell">
        {!html || !meta ? (
          <p className="dsgp-missing">
            Гайд «{guideId}» не собран. Проверь запись в <code>guide-registry.json</code> и запусти{' '}
            <code>node scripts/build-guides.mjs</code>.
          </p>
        ) : (
          <>
            <dl className="dsgp-meta">
              <dt>Версия</dt>
              <dd>{meta.version ?? '—'}</dd>
              <dt>Статус</dt>
              <dd>
                <span className="dsgp-status">{STATUS_LABEL[meta.status] ?? meta.status}</span>
              </dd>
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
                    <a className="dsgp-link" href={meta.sourceDownloadUrl} download>
                      скачать .md
                    </a>
                  </>
                ) : null}
              </dd>
            </dl>

            <div className="dsgp-body" dangerouslySetInnerHTML={{ __html: html }} />
          </>
        )}
      </div>
    </div>
  );
}
