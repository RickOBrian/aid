import type { ReactNode } from 'react';
import { productPath, resolveProductId } from './productRegistry';
import { ProductSwitcher, PRODUCT_SWITCHER_STYLE } from './ProductSwitcher';
import { currentAppPath, withBase } from './base';

/**
 * Стандартная шапка разделов DS-портала (Colors, Icons, …).
 *
 * Структура: [← back] + заголовок слева; поиск + actions справа.
 * Breakpoints: 1023 (wrap tools), 767 (column tools), 479 (меньший h1).
 * Actions оборачивать в элемент с классом `ds-page-header__action-group`.
 */

export const DS_PAGE_HEADER_STYLE = `
.ds-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-16);
  margin-bottom: var(--pf-spacing-32);
  padding-bottom: var(--pf-spacing-24);
  border-bottom: 1px solid var(--pf-line-default);
}
.ds-page-header__lead {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-12);
  min-width: 0;
}
.ds-page-header__back {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--pf-radius-m);
  color: var(--pf-icon-secondary);
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}
.ds-page-header__back:hover {
  color: var(--pf-icon-primary);
  background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */
}
.ds-page-header__back:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-page-header h1 {
  margin: 0;
  font: var(--pf-font-heading-l);
  letter-spacing: var(--pf-tracking-heading-l);
}
.ds-page-header__tools {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-12);
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
}
.ds-page-header__search {
  flex: 1 1 220px;
  width: auto;
  max-width: 320px;
  min-width: 0;
  font-family: var(--pf-type-family-sans-1);
  font-size: 13px; /* pf-gap: FieldSearch (§7.2) — стиль текста поля */
  line-height: 16px; /* pf-gap: FieldSearch (§7.2) */
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-8) var(--pf-spacing-12);
}
.ds-page-header__search::placeholder {
  color: var(--pf-text-muted);
}
.ds-page-header__search:focus {
  outline: none;
}
.ds-page-header__search:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-page-header__actions {
  display: contents;
}
.ds-page-header__action-group {
  display: inline-flex;
  flex-shrink: 0;
}
@media (max-width: 1023px) {
  .ds-page-header {
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .ds-page-header__tools {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .ds-page-header__search {
    max-width: none;
    flex: 1 1 280px;
  }
}
@media (max-width: 767px) {
  .ds-page-header {
    gap: var(--pf-spacing-12);
  }
  .ds-page-header__tools {
    flex-direction: column;
    align-items: stretch;
  }
  .ds-page-header__search {
    width: 100%;
    max-width: none;
    flex: none;
  }
  .ds-page-header__action-group {
    width: 100%;
  }
}
@media (max-width: 479px) {
  .ds-page-header h1 {
    font-size: 24px; /* pf-gap: мобильный heading-l (стиля 24/32 в Kit нет) */
    line-height: 32px; /* pf-gap: мобильный heading-l */
  }
}
`;

function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 3.5L5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface DsPageHeaderProps {
  title: string;
  backHref?: string;
  backAriaLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  actions?: ReactNode;
  showSearch?: boolean;
}

export function DsPageHeader({
  title,
  backHref,
  backAriaLabel = 'Назад к Hub',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Поиск',
  searchAriaLabel = 'Поиск',
  actions,
  showSearch = true,
}: DsPageHeaderProps) {
  const currentProductId = resolveProductId(currentAppPath());
  const resolvedBackHref = productPath(currentProductId, backHref ?? '/');

  return (
    <>
      <style>{DS_PAGE_HEADER_STYLE}</style>
      <style>{PRODUCT_SWITCHER_STYLE}</style>
      <header className="ds-page-header">
      <div className="ds-page-header__lead">
        <a className="ds-page-header__back" href={withBase(resolvedBackHref)} aria-label={backAriaLabel}>
          <BackArrowIcon />
        </a>
        <ProductSwitcher currentProductId={currentProductId} size="header">
          <h1>{title}</h1>
        </ProductSwitcher>
      </div>

      {(showSearch || actions) && (
        <div className="ds-page-header__tools">
          {showSearch && (
            <input
              type="search"
              className="ds-page-header__search"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
            />
          )}
          {actions && <div className="ds-page-header__actions">{actions}</div>}
        </div>
      )}
    </header>
    </>
  );
}
