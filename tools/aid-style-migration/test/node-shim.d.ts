/**
 * Минимум типов Node для тестов, которые читают исходники с диска.
 * @types/node не подключаем: набор зависимостей совпадает с Token
 * Comparator, а новая зависимость — решение Principal Designer.
 */

declare module "node:fs" {
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function statSync(path: string): { isDirectory(): boolean };
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare const __dirname: string;
