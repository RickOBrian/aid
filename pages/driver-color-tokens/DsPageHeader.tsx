import type { ReactNode } from 'react';
import { HUB_ROUTES } from './hubData';

/**
 * Стандартная шапка разделов DS-портала (Colors, Icons, …).
 *
 * Структура: [← back] + заголовок слева; поиск + actions справа.
 * Breakpoints: 1024 (wrap tools), 767 (column tools), 480 (меньший h1).
 * Actions оборачивать в элемент с классом `ds-page-header__action-group`.
 */

export const DS_PAGE_HEADER_STYLE = `
.ds-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebedf0;
}
.ds-page-header__lead {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.ds-page-header__back {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: rgba(0, 0, 0, 0.54);
  text-decoration: none;
}
.ds-page-header__back:hover {
  color: #2d2c2e;
  background: #f5f5f5;
}
.ds-page-header__back:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 2px;
}
.ds-page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 500;
  line-height: 36px;
}
.ds-page-header__tools {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
}
.ds-page-header__search {
  flex: 1 1 220px;
  width: auto;
  max-width: 320px;
  min-width: 0;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  line-height: 16px;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 8px 12px;
}
.ds-page-header__search::placeholder {
  color: rgba(0, 0, 0, 0.38);
}
.ds-page-header__search:focus {
  outline: none;
  border-color: rgba(45, 44, 46, 0.32);
}
.ds-page-header__actions {
  display: contents;
}
.ds-page-header__action-group {
  display: inline-flex;
  flex-shrink: 0;
}
@media (max-width: 1024px) {
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
    gap: 12px;
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
@media (max-width: 480px) {
  .ds-page-header h1 {
    font-size: 24px;
    line-height: 32px;
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
  backHref = HUB_ROUTES.hub,
  backAriaLabel = 'Назад к Hub',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Поиск',
  searchAriaLabel = 'Поиск',
  actions,
  showSearch = true,
}: DsPageHeaderProps) {
  return (
    <>
      <style>{DS_PAGE_HEADER_STYLE}</style>
      <header className="ds-page-header">
      <div className="ds-page-header__lead">
        <a className="ds-page-header__back" href={backHref} aria-label={backAriaLabel}>
          <BackArrowIcon />
        </a>
        <h1>{title}</h1>
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
