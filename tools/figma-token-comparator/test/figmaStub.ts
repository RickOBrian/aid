/**
 * Минимальная заглушка Figma API для unit-тестов.
 *
 * Покрывает ровно две вещи, без которых чистые модули не запускаются:
 *
 * - `figma.mixed` — символ, с которым сравниваются смешанные свойства
 *   текстовой ноды (typographyUtils.isPluginMixed);
 * - `figma.clientStorage` — key-value хранилище в памяти, на котором
 *   работает src/lib/storage.ts (история решений, отправленные подписи).
 *
 * Всё, что реально ходит в документ (scanner, apply-to-layout), юнит-тестами
 * не покрывается — для него нужен настоящий Figma-рантайм. Если появится
 * нужда, стаб расширяется здесь, а не в отдельных тестах.
 */

const storage = new Map<string, unknown>();

const clientStorage = {
  async getAsync(key: string): Promise<unknown> {
    return storage.get(key);
  },
  async setAsync(key: string, value: unknown): Promise<void> {
    // clientStorage сериализует значения, поэтому ссылку на объект вызывающего
    // кода хранить нельзя: иначе тест увидит мутацию, которой в Figma не было.
    storage.set(key, JSON.parse(JSON.stringify(value)));
  },
  async deleteAsync(key: string): Promise<void> {
    storage.delete(key);
  },
  async keysAsync(): Promise<string[]> {
    return [...storage.keys()];
  },
};

const figmaStub = {
  mixed: Symbol("figma.mixed"),
  clientStorage,
};

(globalThis as unknown as { figma: typeof figmaStub }).figma = figmaStub;

/** Очищает clientStorage между тестами. */
export function resetFigmaStub(): void {
  storage.clear();
}

export { figmaStub };
