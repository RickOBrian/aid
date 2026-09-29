/**
 * Карта стиля (этап 3a): стиль исходника по ролям и предложенный перевод
 * на токены продукта. Только анализ — документ не меняется.
 */

import type { TextCaseKind, UseKind } from "../profile/usage";
import type { Rgba } from "./color";

export type Confidence = "high" | "medium" | "low";

/** Цвет исходника в одном месте макета: один и тот же серый в тексте и в обводке — два атома. */
export interface SourceColor {
  id: string;
  /** Ключ цвета: переменная исходника или значение. */
  key: string;
  label: string;
  /** Коллекция и «локальная / из библиотеки» — различает одноимённые переменные. */
  origin: string;
  use: UseKind;
  light: Rgba;
  /** Значение в тёмной теме — из темы исходника или тёмной пары экрана; null — улики нет. */
  dark: Rgba | null;
  count: number;
  /** Сколько из них внутри компонентов — переведутся заменой компонента (этап 4). */
  inInstances: number;
  examples: string[];
}

export interface TargetColor {
  key: string;
  name: string;
  scopes: string[];
  light: Rgba;
  dark: Rgba | null;
  /** Как образцы используют токен; null — образцов нет или токен в них не встречается. */
  usage: Partial<Record<UseKind, number>> | null;
}

export interface Candidate {
  key: string;
  name: string;
  score: number;
}

export interface Proposal {
  sourceId: string;
  /** null — подходящего токена нет: кандидат в предложения библиотеке. */
  target: Candidate | null;
  alternatives: Candidate[];
  confidence: Confidence;
  /** Почему так — человеческим языком, для ревью. */
  reasons: string[];
}

export interface SourceText {
  id: string;
  label: string;
  fontFamily: string;
  fontStyle: string;
  weight: number;
  size: number;
  lineHeight: number | null;
  /** Как текст выглядит чаще всего: капс, с заглавной… */
  visibleCase: TextCaseKind;
  count: number;
  examples: string[];
}

export interface TargetText {
  key: string;
  name: string;
  fontFamily: string;
  weight: number;
  size: number;
  lineHeight: number | null;
  textCase: string;
  /** Сколько раз стиль встречается в образцах. */
  uses: number;
}

export interface SourceValue {
  id: string;
  value: number;
  count: number;
  examples: string[];
}

export interface TargetValue {
  key: string;
  name: string;
  value: number;
}

export interface StyleMap {
  screens: number;
  colors: Array<{ source: SourceColor; proposal: Proposal; target?: TargetColor }>;
  texts: Array<{ source: SourceText; proposal: Proposal; target?: TargetText }>;
  radii: Array<{ source: SourceValue; proposal: Proposal; target?: TargetValue }>;
  spacing: Array<{ source: SourceValue; proposal: Proposal; target?: TargetValue }>;
  skipped: { annotations: number; system: number; mixedText: number };
  /** Чем пользовались: для доверия к карте. */
  basis: { productName: string; exemplars: boolean; darkEvidence: number };
}
