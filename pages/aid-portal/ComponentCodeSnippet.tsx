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
  margin-bottom: var(--pf-spacing-40);
}
.ds-ccode-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-12);
  flex-wrap: wrap;
  margin-bottom: var(--pf-spacing-10);
}
.ds-ccode-head h2 {
  margin: 0;
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.ds-ccode-selection {
  font: var(--pf-font-code-s);
  color: var(--pf-text-secondary);
}
.ds-ccode-platforms {
  display: inline-flex;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  overflow: hidden;
  background: var(--pf-bg-surface-main);
  margin-bottom: var(--pf-spacing-10);
}
.ds-ccode-platforms button {
  margin: 0;
  padding: 5px var(--pf-spacing-12); /* pf-gap: высота сегмента — SegmentedControl (§7.2) */
  border: none;
  border-right: 1px solid var(--pf-line-default);
  background: transparent;
  font-family: var(--pf-type-family-sans-1);
  font-size: 12px; /* pf-gap: label-m (сегмент) */
  font-weight: var(--pf-type-weight-400);
  color: var(--pf-text-secondary);
  cursor: pointer;
}
.ds-ccode-platforms button:last-child {
  border-right: none;
}
.ds-ccode-platforms button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.ds-ccode-platforms button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-ccode-body {
  margin: 0;
  padding: var(--pf-spacing-16);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-zebra);
  overflow-x: auto;
  font: var(--pf-font-code-m);
  color: var(--pf-text-primary);
  tab-size: 2;
}
.ds-ccode-unavailable {
  margin: 0;
  padding: var(--pf-spacing-16);
  border: 1px dashed var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  font-family: var(--pf-type-family-sans-1);
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  line-height: 18px; /* pf-gap: body-xs */
  color: var(--pf-text-secondary);
}
.ds-ccode-source {
  font-family: var(--pf-type-family-mono-1);
}
.ds-ccode-banner {
  margin: 0 0 var(--pf-spacing-8);
  padding: var(--pf-spacing-8) var(--pf-spacing-12);
  border: none;
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-accent-status-warning-main);
  font: var(--pf-font-body-s);
  color: var(--pf-text-warning);
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
