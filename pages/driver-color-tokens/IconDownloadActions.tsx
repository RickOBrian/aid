import { useEffect, useRef, useState } from 'react';
import {
  DS_DROPDOWN_TRIGGER_CLASS,
  DsDropdownChevron,
} from './dsDropdownButton';
import {
  DEFAULT_ICON_DOWNLOAD_FORMAT,
  downloadIconArchive,
  downloadSingleIcon,
  getIconDownloadFormatLabel,
  ICON_DOWNLOAD_FORMATS,
  type IconDownloadFormat,
} from './downloadIcons';
import { countIconsInSections, filterSectionsBySelectionKeys } from './iconSelection';
import type { IconSection } from './iconsData';

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0L5.5 7.5M8 10l2.5-2.5M3 12.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function IconDownloadActions({
  sections,
  visibleSections,
  disabled = false,
  format: controlledFormat,
  onFormatChange,
  selectionMode = false,
  selectedKeys,
  onMoreClick,
}: {
  sections: IconSection[];
  visibleSections: IconSection[];
  disabled?: boolean;
  format?: IconDownloadFormat;
  onFormatChange?: (format: IconDownloadFormat) => void;
  selectionMode?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onMoreClick?: (anchor: { x: number; y: number }) => void;
}) {
  const [internalFormat, setInternalFormat] = useState<IconDownloadFormat>(
    DEFAULT_ICON_DOWNLOAD_FORMAT,
  );
  const format = controlledFormat ?? internalFormat;
  const setFormat = onFormatChange ?? setInternalFormat;
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadGroupRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const selectedCount = selectedKeys?.size ?? 0;
  const downloadDisabled =
    disabled || isDownloading || (selectionMode && selectedCount === 0);

  useEffect(() => {
    if (!formatMenuOpen) {
      return undefined;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!downloadGroupRef.current?.contains(event.target as Node)) {
        setFormatMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFormatMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [formatMenuOpen]);

  const handleDownload = async () => {
    if (downloadDisabled) {
      return;
    }

    setIsDownloading(true);
    try {
      if (selectionMode && selectedKeys && selectedKeys.size > 0) {
        const selectedSections = filterSectionsBySelectionKeys(visibleSections, selectedKeys);
        const selectedIconCount = countIconsInSections(selectedSections);

        if (selectedIconCount === 1) {
          const section = selectedSections[0];
          const item = section.items[0];
          await downloadSingleIcon(section.id, item, format);
          return;
        }

        await downloadIconArchive(selectedSections, format, {
          zipName: 'Icons.zip',
        });
        return;
      }

      await downloadIconArchive(sections, format);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMoreClick = () => {
    const button = moreButtonRef.current;
    if (!button || !onMoreClick) {
      return;
    }

    const rect = button.getBoundingClientRect();
    onMoreClick({
      x: rect.right - 160,
      y: rect.bottom + 6,
    });
  };

  return (
    <div className="dip-download-actions ds-page-header__action-group">
      <div className="dip-download-group" ref={downloadGroupRef}>
        <button
          type="button"
          className={`dip-download-btn dip-download-btn--format ${DS_DROPDOWN_TRIGGER_CLASS}`}
          disabled={disabled || isDownloading}
          aria-haspopup="menu"
          aria-expanded={formatMenuOpen}
          onClick={() => setFormatMenuOpen((open) => !open)}
        >
          {getIconDownloadFormatLabel(format)}
          <DsDropdownChevron open={formatMenuOpen} />
        </button>
        <button
          type="button"
          className="dip-download-btn dip-download-btn--submit"
          disabled={downloadDisabled}
          aria-label={
            selectionMode && selectedCount > 0
              ? `Скачать ${selectedCount} выбранных иконок в формате ${getIconDownloadFormatLabel(format)}`
              : `Скачать иконки в формате ${getIconDownloadFormatLabel(format)}`
          }
          onClick={() => {
            void handleDownload();
          }}
        >
          <DownloadIcon />
        </button>

        {formatMenuOpen && (
          <div className="dip-download-menu" role="menu">
            {ICON_DOWNLOAD_FORMATS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={format === option.id}
                className={
                  format === option.id
                    ? 'dip-download-menu-item dip-download-menu-item--active'
                    : 'dip-download-menu-item'
                }
                onClick={() => {
                  setFormat(option.id);
                  setFormatMenuOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        ref={moreButtonRef}
        type="button"
        className="dip-download-btn dip-download-btn--more"
        disabled={disabled || isDownloading}
        aria-haspopup="menu"
        aria-label="Дополнительные действия"
        onClick={handleMoreClick}
      >
        <MoreIcon />
      </button>
    </div>
  );
}
