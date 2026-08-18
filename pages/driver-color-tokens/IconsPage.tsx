import { useCallback, useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import {
  IconContextMenu,
  createIconDownloadMenuItem,
  createIconSelectMenuItem,
  type IconContextMenuState,
} from './IconContextMenu';
import { IconDownloadActions } from './IconDownloadActions';
import { IconRoundCheckbox } from './IconRoundCheckbox';
import { DS_CHANGELOG_TABLE_STYLE } from './dsChangelogTable';
import {
  DS_INTERACTIVE_CARD_CLASS,
  DS_INTERACTIVE_CARD_STYLE,
} from './dsInteractiveCard';
import {
  DS_VALUE_META_CAPTION_CLASS,
  DS_VALUE_META_CENTER_CLASS,
  DS_VALUE_META_CLASS,
  DS_VALUE_META_PRIMARY_CLASS,
  DS_VALUE_META_STYLE,
} from './dsValueMeta';
import { DS_DROPDOWN_BUTTON_STYLE } from './dsDropdownButton';
import {
  DEFAULT_ICON_DOWNLOAD_FORMAT,
  downloadSingleIcon,
  type IconDownloadFormat,
} from './downloadIcons';
import { iconAssetPath, iconCollection, iconSections, type IconItem, type IconSection } from './iconsData';
import { formatIconSize, getIconDimensions } from './iconDimensions';
import {
  countIconsInSections,
  getSectionSelectionState,
  iconSelectionKey,
} from './iconSelection';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterIconSections } from './searchIcons';

const LONG_PRESS_MS = 500;
const iconChangelog = loadTokenChangelog(iconCollection.collectionName);

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
${DS_DROPDOWN_BUTTON_STYLE}
${DS_VALUE_META_STYLE}
${DS_CHANGELOG_TABLE_STYLE}
.dip,
.dip *,
.dip *::before,
.dip *::after {
  box-sizing: border-box;
}
.dip {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dip-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.dip-download-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.dip-download-group {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}
.dip-download-btn {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  padding: 8px 12px;
  cursor: pointer;
}
.dip-download-btn--format {
  border-radius: 8px 0 0 8px;
  border-right: none;
  min-width: 96px;
}
.dip-download-btn--more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px 10px;
}
.dip-download-btn--submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 8px 0;
  border-left: 1px solid #ebedf0;
  padding: 8px 10px;
}
.dip-selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px 16px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fafafa;
}
.dip-selection-bar__stats {
  font-size: 13px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.54);
}
.dip-selection-bar__stats strong {
  color: #2d2c2e;
  font-weight: 500;
}
.dip-selection-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.dip-selection-bar__btn {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.dip-selection-bar__btn:hover:not(:disabled) {
  background: #f5f5f5;
}
.dip-selection-bar__btn:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}
.dip-round-checkbox {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.dip-round-checkbox__input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.dip-round-checkbox__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid rgba(0, 0, 0, 0.26);
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
  pointer-events: none;
}
.dip-round-checkbox__input:checked + .dip-round-checkbox__mark,
.dip-round-checkbox__input:indeterminate + .dip-round-checkbox__mark {
  border-color: #2d2c2e;
  background: #2d2c2e;
}
.dip-round-checkbox__dash {
  display: block;
  width: 8px;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
}
.dip-section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dip-section-heading__title {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.dip-download-btn:hover:not(:disabled) {
  background: #f5f5f5;
}
.dip-download-btn:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}
.dip-download-btn:disabled svg {
  opacity: 0.38;
}
.dip-download-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 140px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.dip-download-menu-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  line-height: 16px;
  text-align: left;
  color: #2d2c2e;
  cursor: pointer;
}
.dip-download-menu-item:hover {
  background: #f5f5f5;
}
.dip-download-menu-item--active {
  background: #f5f5f5;
  font-weight: 500;
}
.dip-context-menu {
  position: fixed;
  z-index: 30;
  min-width: 160px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.dip-context-menu-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  line-height: 16px;
  text-align: left;
  color: #2d2c2e;
  cursor: pointer;
}
.dip-context-menu-item:hover:not(:disabled) {
  background: #f5f5f5;
}
.dip-context-menu-item:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}
.dip-context-menu-item:disabled svg {
  opacity: 0.38;
}
.dip section {
  margin-bottom: 48px;
}
.dip-section-count {
  font-size: 13px;
  line-height: 24px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.38);
}
.dip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 12px;
}
.dip-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 12px;
  min-height: 112px;
  position: relative;
}
.dip-cell--selection {
  cursor: pointer;
}
.dip-cell__checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
.dip-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dip-preview img,
.dip-preview svg {
  display: block;
  max-width: 24px;
  max-height: 24px;
  width: auto;
  height: auto;
}
.dip-cell-meta {
  width: 100%;
}
@media (max-width: 1024px) {
  .dip {
    padding: 32px 24px 48px;
  }
}
@media (max-width: 767px) {
  .dip {
    padding: 20px 16px 40px;
  }
  .dip-download-group {
    flex: 1 1 auto;
  }
  .dip-download-btn--format {
    flex: 1 1 auto;
  }
  .dip-download-btn--submit {
    flex: 0 0 44px;
    padding-inline: 0;
  }
  .dip-download-btn--more {
    flex: 0 0 44px;
    padding-inline: 0;
  }
  .dip-selection-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .dip-selection-bar__actions {
    width: 100%;
  }
  .dip-selection-bar__btn {
    flex: 1 1 auto;
  }
}
@media (max-width: 768px) {
  .dip section {
    margin-bottom: 32px;
  }
  .dip-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .dip-cell {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    min-height: 0;
    padding: 8px 40px 8px 12px;
  }
  .dip-cell__checkbox {
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
  }
  .dip-preview {
    width: 32px;
    height: 32px;
  }
  .dip-cell-meta {
    flex: 1;
    min-width: 0;
  }
  .dip-cell .ds-value-meta--center {
    align-items: flex-start;
  }
  .dip-cell .ds-value-meta--center .ds-value-meta__primary,
  .dip-cell .ds-value-meta--center .ds-value-meta__caption {
    text-align: left;
  }
  .dip-cell .ds-value-meta__primary {
    font-size: 13px;
    line-height: 16px;
  }
  .dip-cell .ds-value-meta__caption {
    font-size: 11px;
    line-height: 14px;
  }
}
`;

function IconCell({
  sectionId,
  item,
  selectionMode,
  selected,
  onToggle,
  onOpenContextMenu,
}: {
  sectionId: string;
  item: IconItem;
  selectionMode: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpenContextMenu: (coords: { x: number; y: number }) => void;
}) {
  const src = iconAssetPath(sectionId, item.id);
  const dimensions = getIconDimensions(sectionId, item.id);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onOpenContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    longPressTriggeredRef.current = false;
    clearLongPressTimer();

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onOpenContextMenu({ x: touch.clientX, y: touch.clientY });
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
  };

  const handleTouchMove = () => {
    clearLongPressTimer();
  };

  return (
    <article
      className={`dip-cell ${selectionMode ? 'dip-cell--selection' : ''} ${DS_INTERACTIVE_CARD_CLASS} ds-interactive-card--context-menu`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={(event) => {
        if (longPressTriggeredRef.current) {
          event.preventDefault();
          longPressTriggeredRef.current = false;
          return;
        }

        if (selectionMode) {
          onToggle();
        }
      }}
    >
      {selectionMode ? (
        <div className="dip-cell__checkbox">
          <IconRoundCheckbox
            checked={selected}
            ariaLabel={`Выбрать ${item.name}`}
            onChange={onToggle}
          />
        </div>
      ) : null}
      <div className="dip-preview">
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className={`dip-cell-meta ${DS_VALUE_META_CLASS} ${DS_VALUE_META_CENTER_CLASS}`}>
        <p className={DS_VALUE_META_PRIMARY_CLASS}>{item.name}</p>
        <p className={DS_VALUE_META_CAPTION_CLASS}>{formatIconSize(dimensions)}</p>
      </div>
    </article>
  );
}

function IconSectionView({
  section,
  selectionMode,
  selectedKeys,
  onToggleSection,
  onToggleIcon,
  onOpenContextMenu,
}: {
  section: IconSection;
  selectionMode: boolean;
  selectedKeys: ReadonlySet<string>;
  onToggleSection: (section: IconSection) => void;
  onToggleIcon: (sectionId: string, itemId: string) => void;
  onOpenContextMenu: (sectionId: string, item: IconItem, coords: { x: number; y: number }) => void;
}) {
  const sectionSelection = getSectionSelectionState(section, selectedKeys);

  return (
    <section>
      <h2 className="dip-section-heading">
        {selectionMode ? (
          <IconRoundCheckbox
            checked={sectionSelection.all}
            indeterminate={sectionSelection.some}
            ariaLabel={`Выбрать все иконки раздела ${section.title}`}
            onChange={() => onToggleSection(section)}
          />
        ) : null}
        <span className="dip-section-heading__title">
          <span>{section.title}</span>
          <span className="dip-section-count">{section.items.length}</span>
        </span>
      </h2>
      <div className="dip-grid">
        {section.items.map((item) => (
          <IconCell
            key={item.id}
            sectionId={section.id}
            item={item}
            selectionMode={selectionMode}
            selected={selectedKeys.has(iconSelectionKey(section.id, item.id))}
            onToggle={() => onToggleIcon(section.id, item.id)}
            onOpenContextMenu={(coords) => onOpenContextMenu(section.id, item, coords)}
          />
        ))}
      </div>
    </section>
  );
}

export function IconsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadFormat, setDownloadFormat] = useState<IconDownloadFormat>(
    DEFAULT_ICON_DOWNLOAD_FORMAT,
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [contextMenu, setContextMenu] = useState<IconContextMenuState | null>(null);
  const [isDownloadingIcon, setIsDownloadingIcon] = useState(false);
  const filteredSections = useMemo(
    () => filterIconSections(iconSections, searchQuery),
    [searchQuery],
  );
  const visibleIconCount = useMemo(
    () => countIconsInSections(filteredSections),
    [filteredSections],
  );
  const selectedVisibleCount = useMemo(() => {
    let count = 0;
    for (const section of filteredSections) {
      for (const item of section.items) {
        if (selectedKeys.has(iconSelectionKey(section.id, item.id))) {
          count += 1;
        }
      }
    }
    return count;
  }, [filteredSections, selectedKeys]);
  const allVisibleSelected =
    visibleIconCount > 0 && selectedVisibleCount === visibleIconCount;

  const handleEnterSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setSelectedKeys(new Set());
  }, []);

  const handleEnterSelectionModeWithIcon = useCallback((sectionId: string, itemId: string) => {
    setSelectionMode(true);
    setSelectedKeys(new Set([iconSelectionKey(sectionId, itemId)]));
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedKeys(new Set());
  }, []);

  const handleToggleIcon = useCallback((sectionId: string, itemId: string) => {
    const key = iconSelectionKey(sectionId, itemId);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleSection = useCallback((section: IconSection) => {
    setSelectedKeys((prev) => {
      const sectionSelection = getSectionSelectionState(section, prev);
      const next = new Set(prev);
      if (sectionSelection.all) {
        for (const item of section.items) {
          next.delete(iconSelectionKey(section.id, item.id));
        }
      } else {
        for (const item of section.items) {
          next.add(iconSelectionKey(section.id, item.id));
        }
      }
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    const next = new Set<string>();
    for (const section of filteredSections) {
      for (const item of section.items) {
        next.add(iconSelectionKey(section.id, item.id));
      }
    }
    setSelectedKeys(next);
  }, [filteredSections]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDownloadIcon = useCallback(
    async (sectionId: string, item: IconItem) => {
      if (isDownloadingIcon) {
        return;
      }

      setIsDownloadingIcon(true);
      try {
        await downloadSingleIcon(sectionId, item, downloadFormat);
        setContextMenu(null);
      } finally {
        setIsDownloadingIcon(false);
      }
    },
    [downloadFormat, isDownloadingIcon],
  );

  const handleOpenContextMenu = useCallback(
    (sectionId: string, item: IconItem, coords: { x: number; y: number }) => {
      setContextMenu({
        x: coords.x,
        y: coords.y,
        items: [
          createIconDownloadMenuItem(() => {
            void handleDownloadIcon(sectionId, item);
          }, isDownloadingIcon),
          createIconSelectMenuItem(() => {
            handleEnterSelectionModeWithIcon(sectionId, item.id);
          }),
        ],
      });
    },
    [handleDownloadIcon, handleEnterSelectionModeWithIcon, isDownloadingIcon],
  );

  const handleOpenMoreMenu = useCallback(
    (coords: { x: number; y: number }) => {
      setContextMenu({
        x: coords.x,
        y: coords.y,
        items: [
          createIconSelectMenuItem(() => {
            handleEnterSelectionMode();
          }),
        ],
      });
    },
    [handleEnterSelectionMode],
  );

  return (
    <div className="dip">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Icons"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск иконки"
        searchAriaLabel="Поиск иконки"
        actions={
          <IconDownloadActions
              sections={iconSections}
              visibleSections={filteredSections}
              format={downloadFormat}
              onFormatChange={setDownloadFormat}
              selectionMode={selectionMode}
              selectedKeys={selectedKeys}
              onMoreClick={handleOpenMoreMenu}
            />
        }
      />

      {selectionMode ? (
        <div className="dip-selection-bar">
          <p className="dip-selection-bar__stats">
            Всего <strong>{visibleIconCount}</strong> · Выбрано{' '}
            <strong>{selectedVisibleCount}</strong>
          </p>
          <div className="dip-selection-bar__actions">
            <button
              type="button"
              className="dip-selection-bar__btn"
              disabled={allVisibleSelected || visibleIconCount === 0}
              onClick={handleSelectAllVisible}
            >
              Выбрать все
            </button>
            <button
              type="button"
              className="dip-selection-bar__btn"
              onClick={handleExitSelectionMode}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dip-search-empty">Ничего не найдено</p>
      ) : (
        filteredSections.map((section) => (
          <IconSectionView
            key={section.id}
            section={section}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            onToggleSection={handleToggleSection}
            onToggleIcon={handleToggleIcon}
            onOpenContextMenu={handleOpenContextMenu}
          />
        ))
      )}

      {iconChangelog ? <ChangelogTable data={iconChangelog} /> : null}

      <IconContextMenu state={contextMenu} onClose={handleCloseContextMenu} />
    </div>
  );
}
