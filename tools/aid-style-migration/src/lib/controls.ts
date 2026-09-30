/**
 * Словарь элементов управления: по каким словам в имени слоя или
 * компонента узнать чекбокс, переключатель, кнопку-иконку, таб, прогресс,
 * аватар (замечание Principal Designer, 2026-09-30: чекбокс выбора
 * тарифа опознан как «третичная иконка»; «нужно и другие учитывать»).
 *
 * Это общие слова интерфейса, а не имена продуктов: чекбокс 24×24 по форме
 * не отличить от иконки, а по имени — да. Форма добавляется там, где она
 * однозначна (переключатель — капсула с бегунком, `roles.ts`).
 */

export type ControlKind = "check" | "switch" | "icon-button" | "tab" | "progress" | "avatar";

const WORDS: Array<[ControlKind, RegExp]> = [
  ["switch", /\b(switch|toggle)|переключ|тумблер/i],
  ["check", /check|radio|\btick\b|чекбокс|флажок|галочк|радио/i],
  ["icon-button", /\b(close|cross|clear|dismiss)|закры|крестик/i],
  ["tab", /\b(tab|tabs|segment(ed)?)\b|таб|вкладк/i],
  ["progress", /\b(progress|loader|loading bar)\b|прогресс/i],
  ["avatar", /\bavatar\b|аватар/i],
];

/** Что за элемент управления по имени слоя и компонента; null — не элемент управления. */
export function controlByName(...names: string[]): ControlKind | null {
  const text = names.filter(Boolean).join(" ");
  for (const [kind, re] of WORDS) if (re.test(text)) return kind;
  return null;
}

/**
 * Состояние элемента по варианту компонента или имени слоя: `Checked=False`,
 * `Selected=True`, `State=On`, «Switch / ON». null — не указано.
 */
export function controlState(...names: string[]): "on" | "off" | null {
  const text = names.filter(Boolean).join(" ");
  const prop = /\b(checked|selected|active|state|value|on)\s*=\s*(true|false|on|off|yes|no|checked|unchecked|selected|default)\b/i.exec(text);
  if (prop) return /^(true|on|yes|checked|selected)$/i.test(prop[2]) ? "on" : "off";
  if (/\b(on|вкл)\b/i.test(text)) return "on";
  if (/\b(off|выкл)\b/i.test(text)) return "off";
  return null;
}
