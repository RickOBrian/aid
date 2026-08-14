import { useEffect, useRef, type ReactNode } from 'react';

export type IconContextMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
};

export type IconContextMenuState = {
  x: number;
  y: number;
  items: IconContextMenuItem[];
};

export function IconContextMenu({
  state,
  onClose,
}: {
  state: IconContextMenuState | null;
  onClose: () => void;
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
  const menuHeight = state.items.length * 36 + 12;
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
      {state.items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          className="dip-context-menu-item"
          disabled={item.disabled}
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

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

export function createIconDownloadMenuItem(onSelect: () => void, disabled = false): IconContextMenuItem {
  return {
    id: 'download',
    label: 'Скачать',
    icon: <DownloadIcon />,
    disabled,
    onSelect,
  };
}

function SelectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 8.2 7.2 9.9 10.8 6.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function createIconSelectMenuItem(onSelect: () => void): IconContextMenuItem {
  return {
    id: 'select',
    label: 'Выбрать',
    icon: <SelectIcon />,
    onSelect,
  };
}
