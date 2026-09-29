/** Общие типы сборки: UI ↔ главный поток. */

export type ScanScope = { kind: "selection" } | { kind: "pages"; pageIds: string[] };

export interface ScanItem {
  id: string;
  name: string;
  width: number;
  height: number;
  kind: "screen" | "image";
  dark: boolean;
  /** У тёмного экрана — id его светлой пары. */
  pairedWith?: string;
  pairReason?: string;
}

export interface ScanPage {
  pageId: string;
  pageName: string;
  items: ScanItem[];
}

export interface SkippedItem {
  pageName: string;
  name: string;
  reason: string;
}

export interface ThemeCollectionInfo {
  name: string;
  lightMode: string;
  darkMode: string;
}

export interface ScanResult {
  pages: ScanPage[];
  skipped: SkippedItem[];
  skippedTotal: number;
  /** Коллекция темы исходника — из неё строится «Было · тёмная», если тёмного макета нет. */
  themeCollection: ThemeCollectionInfo | null;
}

export interface AssembleRow {
  lightId?: string;
  darkId?: string;
  imageId?: string;
}

export interface AssemblePage {
  pageId: string;
  pageName: string;
  rows: AssembleRow[];
}

export type ConflictPolicy = "replace" | "add";

export interface AssembleRequest {
  pages: AssemblePage[];
  darkFromTheme: boolean;
  onConflict?: ConflictPolicy;
  /** Добавить в плитки «Стало · светлая» и место под «Стало · тёмная» (этап 3b). */
  withAfter?: boolean;
}
