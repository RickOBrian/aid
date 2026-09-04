/** Дефолтный и минимальный размер окна плагина (общий для code.ts и ui.ts). */

export interface WindowSize {
  width: number;
  height: number;
}

export const DEFAULT_WINDOW_SIZE: WindowSize = { width: 960, height: 640 };

/** 720px — таблица «Результаты» остаётся читаемой со своим horizontal scroll. */
export const MIN_WINDOW_SIZE: WindowSize = { width: 720, height: 400 };

export function clampWindowSize(size: WindowSize): WindowSize {
  return {
    width: Math.max(MIN_WINDOW_SIZE.width, Math.round(size.width)),
    height: Math.max(MIN_WINDOW_SIZE.height, Math.round(size.height)),
  };
}
