import { useState } from 'react';
import { CopyButton } from './CopyButton';

/**
 * Dev Mode style code block: platform switcher + snippet generated from the
 * page's current selection.
 *
 * Content rule (see `presentbook-guide.md` § «Критерий содержания component
 * page»): no process/provenance notes ("code not built", "no file in repo",
 * "reference-only") — that is process information, not something a
 * developer needs to use the code. `isReferenceOnly`/`sourcePath` stay as
 * data (useful for future tooling) but render no prose by default.
 *
 * The one exception: `confirmedIssue` renders a warning banner — reserved
 * for a **confirmed defect in the current snippet** that would cause an
 * incorrect implementation if missed (e.g. a non-interactive Binding). Do
 * not use it for general disclaimers.
 */

export interface CodeSnippetPlatform {
  id: string;
  label: string;
  /** `null` when the platform has no code to show at all (e.g. roadmap-only). */
  code: string | null;
  unavailableNote?: string;
  /** True when `code` is a contract-conformant sample, not a file that exists in the repo. */
  isReferenceOnly?: boolean;
  /** Repo path when `code` reflects a real, existing implementation file. */
  sourcePath?: string;
  /** Confirmed defect in this snippet that affects correct usage — renders a warning banner. */
  confirmedIssue?: string;
}

export const COMPONENT_CODE_SNIPPET_STYLE = `
.ds-ccode {
  margin-bottom: 40px;
}
.ds-ccode-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.ds-ccode-head h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.ds-ccode-selection {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
}
.ds-ccode-platforms {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 10px;
}
.ds-ccode-platforms button {
  margin: 0;
  padding: 5px 12px;
  border: none;
  border-right: 1px solid #ebedf0;
  background: transparent;
  font: inherit;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  cursor: pointer;
}
.ds-ccode-platforms button:last-child {
  border-right: none;
}
.ds-ccode-platforms button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.ds-ccode-platforms button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
.ds-ccode-body {
  margin: 0;
  padding: 14px 18px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 20px;
  color: #2d2c2e;
  tab-size: 2;
}
.ds-ccode-unavailable {
  margin: 0;
  padding: 14px 18px;
  border: 1px dashed #ebedf0;
  border-radius: 12px;
  font-size: 12px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.38);
}
.ds-ccode-source {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.ds-ccode-banner {
  margin: 0 0 8px;
  padding: 8px 12px;
  border: 1px solid #f0d48a;
  border-radius: 8px;
  background: #fffdf5;
  font-size: 11px;
  line-height: 16px;
  color: #8a6a00;
}
`;

interface ComponentCodeSnippetProps {
  platforms: CodeSnippetPlatform[];
  /** Short machine-readable echo of the current page selection. */
  selectionSummary: string;
}

export function ComponentCodeSnippet({ platforms, selectionSummary }: ComponentCodeSnippetProps) {
  const [activeId, setActiveId] = useState(platforms[0]?.id ?? '');
  const active = platforms.find((platform) => platform.id === activeId) ?? platforms[0];

  return (
    <section className="ds-ccode" aria-labelledby="ds-ccode-heading">
      <div className="ds-ccode-head">
        <h2 id="ds-ccode-heading">Code</h2>
        <span className="ds-ccode-selection">{selectionSummary}</span>
      </div>

      <div className="ds-ccode-platforms" role="group" aria-label="Platform">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            type="button"
            aria-pressed={platform.id === active?.id}
            onClick={() => setActiveId(platform.id)}
          >
            {platform.label}
          </button>
        ))}
      </div>

      {active?.code ? (
        <>
          {active.confirmedIssue && <p className="ds-ccode-banner">{active.confirmedIssue}</p>}
          <div className="ds-ccode-head">
            <span className="ds-ccode-selection">
              {active.label}
              {active.sourcePath && <code className="ds-ccode-source"> · {active.sourcePath}</code>}
            </span>
            <CopyButton value={active.code} label="Copy snippet" />
          </div>
          <pre className="ds-ccode-body">
            <code>{active.code}</code>
          </pre>
        </>
      ) : (
        <p className="ds-ccode-unavailable">
          {active?.unavailableNote ?? 'Not implemented.'}
        </p>
      )}
    </section>
  );
}
