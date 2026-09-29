/** Мелкие помощники DOM для UI плагина. */

import type { UiToCode } from "../messages";

export function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Нет элемента #${id}`);
  return node as T;
}

export function send(message: UiToCode): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { className?: string; text?: string; type?: string } = {},
  children: Array<Node | string> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.className) node.className = props.className;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.type && node instanceof HTMLButtonElement) node.type = props.type as "button";
  node.append(...children);
  return node;
}

export function badge(text: string, tone: "neutral" | "success" | "info" | "warning" | "danger"): HTMLSpanElement {
  return h("span", { className: `ds-badge ds-badge--${tone}`, text });
}

export function copyText(text: string): boolean {
  // navigator.clipboard в iframe Figma недоступен — старый путь через textarea.
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}
