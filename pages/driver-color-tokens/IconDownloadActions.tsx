import { useEffect, useRef, useState } from 'react';
import {
  DS_DROPDOWN_TRIGGER_CLASS,
  DsDropdownChevron,
} from './dsDropdownButton';
import {
  DEFAULT_ICON_DOWNLOAD_FORMAT,
  downloadIconArchive,
  getIconDownloadFormatLabel,
  ICON_DOWNLOAD_FORMATS,
  type IconDownloadFormat,
} from './downloadIcons';
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

export function IconDownloadActions({
  sections,
  disabled = false,
  format: controlledFormat,
  onFormatChange,
}: {
  sections: IconSection[];
  disabled?: boolean;
  format?: IconDownloadFormat;
  onFormatChange?: (format: IconDownloadFormat) => void;
}) {
  const [internalFormat, setInternalFormat] = useState<IconDownloadFormat>(
    DEFAULT_ICON_DOWNLOAD_FORMAT,
  );
  const format = controlledFormat ?? internalFormat;
  const setFormat = onFormatChange ?? setInternalFormat;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleDownload = async () => {
    if (disabled || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      await downloadIconArchive(sections, format);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="dip-download-actions ds-page-header__action-group" ref={rootRef}>
      <button
        type="button"
        className={`dip-download-btn dip-download-btn--format ${DS_DROPDOWN_TRIGGER_CLASS}`}
        disabled={disabled || isDownloading}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {getIconDownloadFormatLabel(format)}
        <DsDropdownChevron open={menuOpen} />
      </button>
      <button
        type="button"
        className="dip-download-btn dip-download-btn--submit"
        disabled={disabled || isDownloading}
        aria-label={`Скачать иконки в формате ${getIconDownloadFormatLabel(format)}`}
        onClick={() => {
          void handleDownload();
        }}
      >
        <DownloadIcon />
      </button>

      {menuOpen && (
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
                setMenuOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
