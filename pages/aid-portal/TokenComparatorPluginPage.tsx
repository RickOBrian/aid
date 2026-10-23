import { DsPageHeader } from './DsPageHeader';
import { useMemo } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DS_CHANGELOG_TABLE_STYLE, DS_PORTAL_LAYOUT_TOKENS, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { ProductAccentScope } from './ProductAccentScope';
import { HUB_ROUTES } from './hubData';
import { resolveProductId } from './productRegistry';
import toolsRegistry from './tools-registry.json';
import { pluginChangelog } from './pluginChangelog';
import { formatReleaseDate, usePluginRelease } from './pluginRelease';
import { parseReleaseNotes, type NoteInline } from './releaseNotes';
import { currentAppPath } from './base';

interface RegistryPlugin {
  pluginId: string;
  canonicalName: string;
  reviewRoute: string;
  pluginsGroup: string;
  description?: string;
  sourcePath?: string;
  downloadUrl: string;
  downloadLabel: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isRegistryPlugin(value: unknown): value is RegistryPlugin {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isNonEmptyString(record.pluginId) &&
    isNonEmptyString(record.canonicalName) &&
    isNonEmptyString(record.downloadUrl) &&
    isNonEmptyString(record.downloadLabel) &&
    isHttpsUrl(record.downloadUrl)
  );
}

function resolveTokenComparatorPlugin(): RegistryPlugin | null {
  const { plugins } = toolsRegistry;

  if (!Array.isArray(plugins)) {
    return null;
  }

  const found = plugins.find((plugin) => plugin?.pluginId === 'token-comparator');
  return isRegistryPlugin(found) ? found : null;
}

const pluginMeta = resolveTokenComparatorPlugin();

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_PRODUCT_ACCENT_STYLE}
${DS_CHANGELOG_TABLE_STYLE}
${DS_TOKEN_TABLE_STYLE}
.dstp,
.dstp *,
.dstp *::before,
.dstp *::after {
  box-sizing: border-box;
}
.dstp {
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
}
.dstp-shell {
  max-width: 760px;
  margin: 0 auto;
}
.dstp-lede {
  margin: 0 0 var(--pf-spacing-40);
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
.dstp-section {
  margin-bottom: var(--pf-spacing-48);
}
.dstp-section-title {
  margin: 0 0 var(--pf-spacing-20);
  font: var(--pf-font-heading-m);
}
.dstp-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 var(--pf-spacing-12);
  padding: var(--pf-spacing-10) var(--pf-spacing-20);
  border-radius: var(--pf-radius-m);
  background: var(--ds-accent);
  color: var(--pf-text-inverse);
  font-family: var(--pf-type-family-sans-1);
  font-size: 14px; /* pf-gap: label-m 14/20·500 */
  font-weight: var(--pf-type-weight-500);
  line-height: 20px; /* pf-gap: label-m */
  text-decoration: none;
  transition: filter 150ms ease;
}
.dstp-download-version {
  margin-left: var(--pf-spacing-8);
  opacity: 0.8; /* pf-gap: вторичный текст на заливке ButtonText Primary */
  font-variant-numeric: tabular-nums;
}
.dstp-download:hover {
  filter: brightness(0.95); /* pf-gap: bg-accent-states-hover (пачка №0) */
  text-decoration: none;
}
.dstp-download:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dstp-download-note {
  margin: 0 0 var(--pf-spacing-24);
  font: var(--pf-font-body-s);
  color: ${T.textSecondary};
}
.dstp-install-steps {
  margin: 0;
  padding: var(--pf-spacing-20) var(--pf-spacing-20) var(--pf-spacing-20) 36px;
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  background: ${T.surfaceZebra};
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
.dstp-install-steps li + li {
  margin-top: var(--pf-spacing-8);
}
.dstp-unavailable {
  margin: 0;
  padding: var(--pf-spacing-24);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  background: ${T.surfaceZebra};
}
.dstp-unavailable-title {
  margin: 0 0 var(--pf-spacing-12);
  font: var(--pf-font-heading-m);
}
.dstp-unavailable-text {
  margin: 0;
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
.dstp-notes {
  font: var(--pf-font-body-m);
  color: ${T.textPrimary};
}
.dstp-notes p,
.dstp-notes ul,
.dstp-notes ol {
  margin: 0 0 var(--pf-spacing-12);
}
.dstp-notes ul,
.dstp-notes ol {
  padding-left: var(--pf-spacing-20);
}
.dstp-notes li + li {
  margin-top: var(--pf-spacing-6);
}
.dstp-notes h3 {
  margin: var(--pf-spacing-24) 0 var(--pf-spacing-8);
  font: var(--pf-font-heading-s);
}
.dstp-notes code {
  padding: var(--pf-spacing-2) var(--pf-spacing-4);
  border-radius: var(--pf-radius-s);
  background: ${T.surfaceMuted};
  font: var(--pf-font-code-s);
}
.dstp-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-8) var(--pf-spacing-24);
  margin: var(--pf-spacing-20) 0 0;
  padding: var(--pf-spacing-16) 0 0;
  border-top: 1px solid ${T.border};
  font: var(--pf-font-body-m);
}
.dstp-links a {
  color: var(--ds-accent);
  text-decoration: var(--ds-link-decoration);
}
.dstp-links a:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dstp-links a:hover {
  text-decoration: underline;
}
@media (max-width: 767px) {
  .dstp {
    padding: ${T.pagePaddingMobile};
  }
}
`;

const INSTALL_STEPS = [
  'Скачайте ZIP и распакуйте архив.',
  'В Figma Desktop откройте Plugins → Development → Import plugin from manifest…',
  'Выберите token-comparator/manifest.json в распакованной папке.',
  'Для обновления повторите импорт manifest из новой распакованной версии.',
] as const;

function Inline({ parts }: { parts: NoteInline[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.kind === 'code' ? <code key={index}>{part.text}</code> : part.text,
      )}
    </>
  );
}

function ReleaseNotes({ markdown }: { markdown: string }) {
  return (
    <div className="dstp-notes">
      {parseReleaseNotes(markdown).map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h3 key={index}>
              <Inline parts={block.inline} />
            </h3>
          );
        }
        if (block.kind === 'paragraph') {
          return (
            <p key={index}>
              <Inline parts={block.inline} />
            </p>
          );
        }
        const List = block.ordered ? 'ol' : 'ul';
        return (
          <List key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline parts={item} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

export function TokenComparatorPluginPage() {
  const productId = resolveProductId(currentAppPath());
  const backHref = `/${productId}${HUB_ROUTES.tools}`;
  const { release, history } = usePluginRelease();
  // Все версии и что в них менялось — таблицей changelog, как у токенов портала.
  const changelog = useMemo(() => pluginChangelog(history), [history]);
  const version = release?.version ?? null;

  return (
    <ProductAccentScope productId={productId}>
      <div className="dstp">
        <style>{PAGE_STYLE}</style>
        <main className="dstp-shell">
          <DsPageHeader
            title={pluginMeta?.canonicalName ?? 'Token Comparator'}
            backHref={backHref}
            backAriaLabel="Назад к Tools"
            showSearch={false}
          />

          {pluginMeta ? (
            <>
              {pluginMeta.description && <p className="dstp-lede">{pluginMeta.description}</p>}

              <section className="dstp-section" aria-labelledby="dstp-install-heading">
                <h2 className="dstp-section-title" id="dstp-install-heading">
                  Установка
                </h2>
                <a
                  className="dstp-download"
                  href={pluginMeta.downloadUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Скачать Token Comparator${version ? ` ${version}` : ''} для Figma Desktop (ZIP, откроется в новой вкладке)`}
                >
                  {pluginMeta.downloadLabel}
                  {version && <span className="dstp-download-version">{version}</span>}
                </a>
                <p className="dstp-download-note">
                  {release?.publishedAt
                    ? `Последняя версия, опубликована ${formatReleaseDate(release.publishedAt)}`
                    : 'Скачивается последняя опубликованная версия плагина.'}
                </p>
                <ol className="dstp-install-steps">
                  {INSTALL_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              {release && (
                <section className="dstp-section" aria-labelledby="dstp-notes-heading">
                  <h2 className="dstp-section-title" id="dstp-notes-heading">
                    Что нового в {release.version}
                  </h2>
                  {release.notes.trim() && <ReleaseNotes markdown={release.notes} />}
                  {release.releaseUrl && (
                    <p className="dstp-links">
                      <a href={release.releaseUrl} target="_blank" rel="noreferrer noopener">
                        Релиз {release.version} на GitHub
                      </a>
                    </p>
                  )}
                </section>
              )}

              {changelog && <ChangelogTable data={changelog} />}
            </>
          ) : (
            <section className="dstp-unavailable" aria-labelledby="dstp-unavailable-heading">
              <h2 className="dstp-unavailable-title" id="dstp-unavailable-heading">
                Плагин временно недоступен
              </h2>
              <p className="dstp-unavailable-text">
                Данные для скачивания пока не настроены. Вернитесь в раздел Tools или обратитесь к
                команде дизайн-системы.
              </p>
            </section>
          )}
        </main>
      </div>
    </ProductAccentScope>
  );
}
