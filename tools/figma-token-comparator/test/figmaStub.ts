/**
 * Минимальная заглушка Figma API для unit-тестов.
 *
 * Тестируются только чистые модули (компараторы, нормализация типографики,
 * экспорт, scope tie-break). Из глобального `figma` им нужен ровно один
 * символ — `figma.mixed`, с которым сравниваются значения смешанных
 * свойств текстовой ноды (см. typographyUtils.isPluginMixed).
 *
 * Всё, что реально ходит в документ (scanner, apply-to-layout, storage),
 * юнит-тестами не покрывается — для него нужен настоящий Figma-рантайм.
 * Если появится нужда, стаб расширяется здесь, а не в отдельных тестах.
 */

const figmaStub = {
  mixed: Symbol("figma.mixed"),
};

(globalThis as unknown as { figma: typeof figmaStub }).figma = figmaStub;

export { figmaStub };
