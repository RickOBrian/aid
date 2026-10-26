import { CopyButton } from './CopyButton';

/**
 * Component identity header for review pages — Figma Dev Mode Inspect layout.
 *
 * Content rule (see `presentbook-guide.md` § «Критерий содержания component
 * page»): only facts a developer needs to build/use the component right now.
 * No pipeline/process status, no infrastructure debug fields — those never
 * render here, in any form (banner/tooltip/comment/label), regardless of
 * environment. Release/version/changelog facts required by
 * `skills/_shared/protocols/gates/component-gate.md` live in
 * `ComponentReleaseStatus`, not in this header —
 * do not duplicate them here.
 *
 * Shared primitive: extend this component for new review pages instead of
 * forking a page-local metadata block.
 */

export interface ComponentFigmaSource {
  fileLabel: string;
  nodeId: string;
  url?: string;
}

export interface ComponentMetaHeaderProps {
  name: string;
  aliases?: string[];
  architectureLevel: string;
  group: string;
  sourcePath: string;
  figma?: ComponentFigmaSource;
}

export const COMPONENT_META_HEADER_STYLE = `
.ds-cmeta {
  margin-bottom: var(--pf-spacing-32);
}
.ds-cmeta-identity {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  overflow: hidden;
}
.ds-cmeta-title {
  display: flex;
  align-items: baseline;
  gap: var(--pf-spacing-8);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border-bottom: 1px solid var(--pf-line-default);
  background: var(--pf-bg-surface-zebra);
}
.ds-cmeta-title code {
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
.ds-cmeta-alias {
  font: var(--pf-font-code-s);
  color: var(--pf-text-secondary);
}
.ds-cmeta-rows {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 0;
  margin: 0;
  padding: var(--pf-spacing-8) var(--pf-spacing-20) var(--pf-spacing-12);
  font: var(--pf-font-body-s);
}
.ds-cmeta-rows dt {
  padding: 5px 0; /* pf-gap: шаг 5 вне шкалы — поля IslandRow */
  color: var(--pf-text-secondary);
}
.ds-cmeta-rows dd {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-8);
  min-width: 0;
  margin: 0;
  padding: 5px 0; /* pf-gap: шаг 5 вне шкалы — поля IslandRow */
}
.ds-cmeta-value {
  font: var(--pf-font-code-s);
  color: var(--pf-text-primary);
  overflow-wrap: anywhere;
}
.ds-cmeta-link {
  font: var(--pf-font-code-s);
  color: var(--ds-accent);
  text-decoration: var(--ds-link-decoration);
  overflow-wrap: anywhere;
}
.ds-cmeta-link:hover {
  text-decoration: underline;
}
.ds-cmeta-link:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
@media (max-width: 767px) {
  .ds-cmeta-rows {
    grid-template-columns: minmax(0, 1fr);
  }
  .ds-cmeta-rows dt {
    padding-bottom: 0;
  }
}
`;

export function ComponentMetaHeader({
  name,
  aliases = [],
  architectureLevel,
  group,
  sourcePath,
  figma,
}: ComponentMetaHeaderProps) {
  return (
    <div className="ds-cmeta">
      <div className="ds-cmeta-identity">
        <div className="ds-cmeta-title">
          <code>{name}</code>
          {aliases.length > 0 && <span className="ds-cmeta-alias">({aliases.join(', ')})</span>}
        </div>

        <dl className="ds-cmeta-rows">
          <dt>Architecture level</dt>
          <dd>
            <span className="ds-cmeta-value">{architectureLevel}</span>
          </dd>

          <dt>Category</dt>
          <dd>
            <span className="ds-cmeta-value">{group}</span>
          </dd>

          <dt>Source</dt>
          <dd>
            <span className="ds-cmeta-value">{sourcePath}</span>
            <CopyButton value={sourcePath} ariaLabel={`Copy source path: ${sourcePath}`} />
          </dd>

          {figma && (
            <>
              <dt>Figma</dt>
              <dd>
                {figma.url ? (
                  <a
                    className="ds-cmeta-link"
                    href={figma.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Ссылка
                  </a>
                ) : (
                  <span className="ds-cmeta-value">
                    {figma.fileLabel} · {figma.nodeId}
                  </span>
                )}
                <CopyButton value={figma.nodeId} label="Copy id" ariaLabel="Copy Figma node id" />
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
