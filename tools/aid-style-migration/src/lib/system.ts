/**
 * Системные элементы — клавиатура, статус-бар, панель навигации ОС. Их
 * не переводим и не считаем в статистике (спайк, п. 5: у агента
 * отвязанная клавиатура дала ~2 400 сырых цветов и испортила статистику
 * тёмной темы). Узнаём по имени инстанса или его главного компонента.
 */

const PATTERNS = [
  /keyboard/i,
  /g-?board/i,
  /status\s*-?bar/i,
  /system\s*interface/i,
  /home\s*indicator/i,
  /navigation\s*bar\s*\/?\s*android/i,
  /клавиатур/i,
  /статус-?бар/i,
];

export function isSystemName(name: string): boolean {
  return PATTERNS.some((re) => re.test(name));
}
