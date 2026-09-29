import { describe, expect, it } from "vitest";
import { formatReport } from "../src/probes/report";

describe("formatReport", () => {
  it("строит таблицу Markdown с колонками трекера", () => {
    const text = formatReport(
      [
        { id: "a", title: "Проверка", expected: "ждём", actual: "видим", status: "ok", ms: 12.4 },
        { id: "b", title: "Без замера", expected: "x", actual: "y", status: "skip" },
      ],
      { fileName: "Файл", date: "2026-09-29" },
    );
    expect(text).toContain("| Проверка | Ожидали | Увидели | Итог | мс |");
    expect(text).toContain("| Проверка | ждём | видим | подтверждено | 12 |");
    expect(text).toContain("| Без замера | x | y | пропущено |  |");
  });

  it("экранирует вертикальную черту и переносы строк", () => {
    const text = formatReport(
      [{ id: "a", title: "a|b", expected: "строка1\nстрока2", actual: "-", status: "info" }],
      { fileName: "f", date: "d" },
    );
    expect(text).toContain("a\\|b");
    expect(text).toContain("строка1; строка2");
  });
});
