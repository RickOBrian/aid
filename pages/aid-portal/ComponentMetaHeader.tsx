import { CopyButton } from './CopyButton';

/**
 * Component identity header for review pages — Figma Dev Mode Inspect layout.
 *
 * Content rule (see `presentbook-guide.md` § «Критерий содержания component
 * page»): only facts a developer needs to build/use the component right now.
 * No pipeline/process status, no infrastructure debug fields — those never
 * render here, in any form (banner/tooltip/comment/label), regardless of
 * environment. Release/version/changelog facts required by
 * `component-gate.mdc` live in `ComponentReleaseStatus`, not in this header —
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
  margin-bottom: 32px;
}
.ds-cmeta-identity {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  overflow: hidden;
}
.ds-cmeta-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid #ebedf0;
  background: #fafafa;
}
.ds-cmeta-title code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 600;
  color: #2d2c2e;
}
.ds-cmeta-alias {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.ds-cmeta-rows {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 0;
  margin: 0;
  padding: 8px 20px 12px;
  font-size: 13px;
  line-height: 20px;
}
.ds-cmeta-rows dt {
  padding: 5px 0;
  color: rgba(0, 0, 0, 0.45);
}
.ds-cmeta-rows dd {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 5px 0;
}
.ds-cmeta-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #2d2c2e;
  overflow-wrap: anywhere;
}
.ds-cmeta-link {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--ds-accent);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.ds-cmeta-link:hover {
  text-decoration: underline;
}
@media (max-width: 640px) {
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
