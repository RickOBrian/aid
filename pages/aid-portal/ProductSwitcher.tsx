import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DS_DROPDOWN_BUTTON_STYLE,
  DS_DROPDOWN_TRIGGER_CLASS,
  DS_DROPDOWN_TRIGGER_CHEVRON_CLASS,
  DS_DROPDOWN_TRIGGER_CHEVRON_OPEN_CLASS,
} from './dsDropdownButton';
import { SWITCHABLE_PRODUCTS, getProductSwitcherLabel, productHubPath } from './productRegistry';

/**
 * Product switcher — chevron next to the product title, opens a menu listing
 * every switchable product from `products/registry.json` (never hardcoded).
 * Wraps the page title (`children`); menu is centered under the title text.
 */

export const PRODUCT_SWITCHER_STYLE = `
${DS_DROPDOWN_BUTTON_STYLE}
.ds-product-switcher {
  display: inline-flex;
  align-items: baseline;
}
.ds-product-switcher__row {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.ds-product-switcher__title-wrap {
  position: relative;
}
.ds-product-switcher__prefix {
  cursor: default;
}
.ds-product-switcher__name-trigger {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  cursor: pointer;
}
.ds-product-switcher__name-trigger:hover,
.ds-product-switcher__name-trigger:focus-visible {
  outline: none;
}
.ds-product-switcher__name-trigger:focus-visible {
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(45, 44, 46, 0.24);
}
.ds-product-switcher__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
  flex-shrink: 0;
}
.ds-product-switcher__trigger:hover,
.ds-product-switcher__trigger:focus-visible {
  background: #f5f5f5;
  outline: none;
}
.ds-product-switcher--hub .ds-product-switcher__trigger {
  width: 48px;
  height: 48px;
  margin-left: 4px;
}
.ds-product-switcher--hub .ds-product-switcher__chevron {
  width: 28px;
  height: 28px;
}
.ds-product-switcher--header .ds-product-switcher__trigger {
  width: 36px;
  height: 36px;
  margin-left: 2px;
}
.ds-product-switcher--header .ds-product-switcher__chevron {
  width: 20px;
  height: 20px;
}
@media (max-width: 768px) {
  .ds-product-switcher--hub .ds-product-switcher__trigger {
    width: 36px;
    height: 36px;
  }
  .ds-product-switcher--hub .ds-product-switcher__chevron {
    width: 21px;
    height: 21px;
  }
}
@media (max-width: 480px) {
  .ds-product-switcher--header .ds-product-switcher__trigger {
    width: 31px;
    height: 31px;
  }
  .ds-product-switcher--header .ds-product-switcher__chevron {
    width: 17px;
    height: 17px;
  }
}
.ds-product-switcher--open {
  position: relative;
  z-index: 1001;
}
.ds-product-switcher--open .ds-product-switcher__prefix {
  filter: blur(2px);
  opacity: 0.55;
}
.ds-product-switcher--header.ds-product-switcher--open .ds-product-switcher__title-wrap > :is(h1, h2, h3, h4, h5, h6) {
  filter: blur(2px);
  opacity: 0.55;
}
.ds-product-switcher__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  border: none;
  margin: 0;
  padding: 0;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  cursor: default;
  animation: ds-product-switcher-backdrop-in 0.18s ease;
}
@keyframes ds-product-switcher-backdrop-in {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
}
.ds-product-switcher__chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.ds-product-switcher__chevron--open {
  transform: rotate(180deg);
}
.ds-product-switcher__menu {
  position: absolute;
  top: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 12px 0;
  list-style: none;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
  border-radius: 16px;
  z-index: 1002;
  white-space: nowrap;
}
.ds-product-switcher__item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 8px 32px;
  border: none;
  background: transparent;
  text-decoration: none;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 56px;
  letter-spacing: -0.02em;
  color: rgba(0, 0, 0, 0.38);
  text-align: left;
  cursor: pointer;
  transition: color 0.15s ease;
}
.ds-product-switcher__item:hover,
.ds-product-switcher__item:focus-visible {
  color: rgba(0, 0, 0, 0.87);
  background: transparent;
  outline: none;
}
.ds-product-switcher__item[aria-current="true"] {
  color: rgba(0, 0, 0, 0.87);
  background: transparent;
}
.ds-product-switcher__check {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.87);
}
.ds-product-switcher__check svg {
  width: 28px;
  height: 28px;
}
@media (max-width: 768px) {
  .ds-product-switcher__item {
    font-size: 36px;
    line-height: 44px;
    padding: 6px 24px;
  }
  .ds-product-switcher__check {
    width: 32px;
    height: 32px;
  }
  .ds-product-switcher__check svg {
    width: 22px;
    height: 22px;
  }
}
`;

interface ProductSwitcherContextValue {
  open: boolean;
  toggle: () => void;
}

const ProductSwitcherContext = createContext<ProductSwitcherContextValue | null>(null);

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Clickable product name inside the hub title — prefix (`aid: `) stays plain text. */
export function ProductSwitcherNameTrigger({ children }: { children: ReactNode }) {
  const context = useContext(ProductSwitcherContext);
  if (!context) {
    return <>{children}</>;
  }

  return (
    <button
      type="button"
      className="ds-product-switcher__name-trigger"
      aria-haspopup="menu"
      aria-expanded={context.open}
      aria-label="Переключить продукт"
      onClick={context.toggle}
    >
      {children}
    </button>
  );
}

function ProductSwitcherChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={
        open
          ? `${DS_DROPDOWN_TRIGGER_CHEVRON_CLASS} ${DS_DROPDOWN_TRIGGER_CHEVRON_OPEN_CLASS} ds-product-switcher__chevron ds-product-switcher__chevron--open`
          : `${DS_DROPDOWN_TRIGGER_CHEVRON_CLASS} ds-product-switcher__chevron`
      }
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductSwitcher({
  currentProductId,
  size = 'header',
  children,
}: {
  currentProductId: string;
  size?: 'hub' | 'header';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggle = () => setOpen((value) => !value);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (SWITCHABLE_PRODUCTS.length <= 1) {
    return <>{children}</>;
  }

  return (
    <ProductSwitcherContext.Provider value={{ open, toggle }}>
      {open &&
        createPortal(
          <button
            type="button"
            className="ds-product-switcher__backdrop"
            aria-label="Закрыть меню продуктов"
            onClick={() => setOpen(false)}
          />,
          document.body,
        )}

      <div
        className={`ds-product-switcher ds-product-switcher--${size}${open ? ' ds-product-switcher--open' : ''}`}
        ref={rootRef}
      >
        <div className="ds-product-switcher__row">
          <div className="ds-product-switcher__title-wrap">
            {children}

            {open && (
              <ul className="ds-product-switcher__menu" role="menu">
                {SWITCHABLE_PRODUCTS.map((product) => {
                  const isCurrent = product.id === currentProductId;
                  return (
                    <li key={product.id} role="none">
                      <a
                        role="menuitem"
                        className="ds-product-switcher__item"
                        aria-current={isCurrent}
                        href={productHubPath(product.id)}
                        onClick={() => setOpen(false)}
                      >
                        <span className="ds-product-switcher__check" aria-hidden="true">
                          {isCurrent && <CheckIcon />}
                        </span>
                        {getProductSwitcherLabel(product.id)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            type="button"
            className={`ds-product-switcher__trigger ${DS_DROPDOWN_TRIGGER_CLASS}`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Переключить продукт"
            onClick={toggle}
          >
            <ProductSwitcherChevron open={open} />
          </button>
        </div>
      </div>
    </ProductSwitcherContext.Provider>
  );
}
