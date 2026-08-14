import { useCallback, useMemo, useRef, useState } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { IconContextMenu, type IconContextMenuState } from './IconContextMenu';
import { IconDownloadActions } from './IconDownloadActions';
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
import { iconAssetPath, iconSections, formatIconDefaultSize, ICON_DEFAULT_SIZE, type IconItem, type IconSection } from './iconsData';
import { filterIconSections } from './searchIcons';

const LONG_PRESS_MS = 500;

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
${DS_DROPDOWN_BUTTON_STYLE}
${DS_VALUE_META_STYLE}
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
.dip-download-btn--submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 8px 0;
  border-left: 1px solid #ebedf0;
  padding: 8px 10px;
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
.dip h2 {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
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
  .dip-download-btn--format {
    flex: 1 1 auto;
  }
  .dip-download-btn--submit {
    flex: 0 0 44px;
    padding-inline: 0;
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
    padding: 8px 12px;
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
  onOpenContextMenu,
}: {
  sectionId: string;
  item: IconItem;
  onOpenContextMenu: (coords: { x: number; y: number }) => void;
}) {
  const src = iconAssetPath(sectionId, item.id);
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
      className={`dip-cell ${DS_INTERACTIVE_CARD_CLASS} ds-interactive-card--context-menu`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={(event) => {
        if (longPressTriggeredRef.current) {
          event.preventDefault();
          longPressTriggeredRef.current = false;
        }
      }}
    >
      <div className="dip-preview">
        <img
          src={src}
          alt=""
          width={ICON_DEFAULT_SIZE}
          height={ICON_DEFAULT_SIZE}
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className={`dip-cell-meta ${DS_VALUE_META_CLASS} ${DS_VALUE_META_CENTER_CLASS}`}>
        <p className={DS_VALUE_META_PRIMARY_CLASS}>{item.name}</p>
        <p className={DS_VALUE_META_CAPTION_CLASS}>{formatIconDefaultSize()}</p>
      </div>
    </article>
  );
}

function IconSectionView({
  section,
  onOpenContextMenu,
}: {
  section: IconSection;
  onOpenContextMenu: (sectionId: string, item: IconItem, coords: { x: number; y: number }) => void;
}) {
  return (
    <section>
      <h2>
        <span>{section.title}</span>
        <span className="dip-section-count">{section.items.length}</span>
      </h2>
      <div className="dip-grid">
        {section.items.map((item) => (
          <IconCell
            key={item.id}
            sectionId={section.id}
            item={item}
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
  const [contextMenu, setContextMenu] = useState<IconContextMenuState | null>(null);
  const [isDownloadingIcon, setIsDownloadingIcon] = useState(false);
  const filteredSections = useMemo(
    () => filterIconSections(iconSections, searchQuery),
    [searchQuery],
  );

  const handleOpenContextMenu = useCallback(
    (sectionId: string, item: IconItem, coords: { x: number; y: number }) => {
      setContextMenu({
        x: coords.x,
        y: coords.y,
        sectionId,
        item,
      });
    },
    [],
  );

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
            format={downloadFormat}
            onFormatChange={setDownloadFormat}
          />
        }
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dip-search-empty">Ничего не найдено</p>
      ) : (
        filteredSections.map((section) => (
          <IconSectionView
            key={section.id}
            section={section}
            onOpenContextMenu={handleOpenContextMenu}
          />
        ))
      )}

      <IconContextMenu
        state={contextMenu}
        onClose={handleCloseContextMenu}
        onDownload={(sectionId, item) => {
          void handleDownloadIcon(sectionId, item);
        }}
        isDownloading={isDownloadingIcon}
      />
    </div>
  );
}
