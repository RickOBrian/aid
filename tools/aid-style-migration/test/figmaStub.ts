/**
 * Минимальная заглушка Figma API для unit-тестов. Модули, которые ходят в
 * документ (проверки API, обход), юнит-тестами не покрываются — для них
 * нужен настоящий рантайм Figma. Нужно больше — расширяется здесь.
 */

const figmaStub = {
  mixed: Symbol("figma.mixed"),
};

(globalThis as unknown as { figma: typeof figmaStub }).figma = figmaStub;
