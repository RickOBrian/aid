import { DsPageHeader } from './DsPageHeader';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { ProductAccentScope } from './ProductAccentScope';
import { HUB_ROUTES } from './hubData';
import { resolveProductId } from './productRegistry';
import toolsRegistry from './tools-registry.json';

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
  margin: 0 0 40px;
  font-size: 16px;
  line-height: 26px;
  color: ${T.textSecondary};
}
.dstp-section {
  margin-bottom: 48px;
}
.dstp-section-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.dstp-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 12px;
  padding: 10px 20px;
  border-radius: ${T.tableWrapRadius};
  background: var(--ds-accent);
  color: ${T.toastText};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-decoration: none;
}
.dstp-download:hover {
  filter: brightness(0.95);
  text-decoration: none;
}
.dstp-download:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: 2px;
}
.dstp-download-note {
  margin: 0 0 24px;
  font-size: 13px;
  line-height: 20px;
  color: ${T.textSecondary};
}
.dstp-install-steps {
  margin: 0;
  padding: 20px 20px 20px 36px;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surfaceZebra};
  font-size: 14px;
  line-height: 22px;
  color: ${T.textSecondary};
}
.dstp-install-steps li + li {
  margin-top: 8px;
}
.dstp-unavailable {
  margin: 0;
  padding: 24px;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surfaceZebra};
}
.dstp-unavailable-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.dstp-unavailable-text {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: ${T.textSecondary};
}
@media (max-width: 768px) {
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

export function TokenComparatorPluginPage() {
  const productId = resolveProductId(window.location.pathname);
  const backHref = `/${productId}${HUB_ROUTES.tools}`;

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
                  aria-label="Скачать Token Comparator для Figma Desktop (ZIP, откроется в новой вкладке)"
                >
                  {pluginMeta.downloadLabel}
                </a>
                <p className="dstp-download-note">
                  Скачивается последняя опубликованная версия плагина.
                </p>
                <ol className="dstp-install-steps">
                  {INSTALL_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
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
