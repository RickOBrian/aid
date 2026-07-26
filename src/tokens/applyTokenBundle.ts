import type { TokenBundle } from './types';

/** Имена вроде --main/background невалидны как CSS custom properties. */
function isValidCssVarName(name: string): boolean {
  return /^--[a-zA-Z0-9_-]+$/.test(name);
}

/** Применяет CSS custom properties из bundle на :root (Web-превью). */
export function applyTokenBundleToRoot(bundle: TokenBundle, root: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(bundle.cssVariables)) {
    if (!isValidCssVarName(name)) continue;
    try {
      root.style.setProperty(name, value);
    } catch {
      // legacy-токены с невалидными именами пропускаем без падения preview
    }
  }
  root.dataset.uiKit = bundle.uiKitId;
}

export function clearTokenBundleFromRoot(root: HTMLElement = document.documentElement): void {
  const names = [...root.style].filter((prop) => prop.startsWith('--'));
  for (const name of names) {
    root.style.removeProperty(name);
  }
  delete root.dataset.uiKit;
}
