import { useEffect, useRef } from 'react';
import type { IconItem } from './iconsData';

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

export type IconContextMenuState = {
  x: number;
  y: number;
  sectionId: string;
  item: IconItem;
};

export function IconContextMenu({
  state,
  onClose,
  onDownload,
  isDownloading,
}: {
  state: IconContextMenuState | null;
  onClose: () => void;
  onDownload: (sectionId: string, item: IconItem) => void;
  isDownloading: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) {
      return undefined;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const onScroll = () => {
      onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [state, onClose]);

  if (!state) {
    return null;
  }

  const menuWidth = 160;
  const menuHeight = 44;
  const padding = 8;
  const x = Math.min(state.x, window.innerWidth - menuWidth - padding);
  const y = Math.min(state.y, window.innerHeight - menuHeight - padding);

  return (
    <div
      ref={menuRef}
      className="dip-context-menu"
      role="menu"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        role="menuitem"
        className="dip-context-menu-item"
        disabled={isDownloading}
        onClick={() => {
          onDownload(state.sectionId, state.item);
        }}
      >
        <DownloadIcon />
        Скачать
      </button>
    </div>
  );
}
