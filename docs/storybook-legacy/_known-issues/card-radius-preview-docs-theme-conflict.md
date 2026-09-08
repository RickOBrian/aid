# Card — docs-theme.css overrides DS border-radius in radius-preview

**Status:** open  
**Component:** `docs/storybook/components/card.html`  
**Section:** Guide Page «Скругления»  
**Token affected:** `radius-l` (Container / `part: 'root'`)

## Symptom

После внедрения `mountRadiusPreviews()` секция «Скругления» клонирует реальный
`.card`, но углы **не скруглены** — `getComputedStyle(clone).borderTopRightRadius`
возвращает `0px`. Дуга не рисуется (`arcSize = 0`). Токен `radius-l` визуально
не демонстрируется.

## Cause

В `docs/assets/docs-theme.css` глобальное правило для UI-карточек док-сайта
совпадает по классу с DS-компонентом Card:

```css
.card {
  border: 1px solid var(--line-default);
  box-shadow: none;
  border-radius: 0;
}
```

Комментарий в `card.html` (`DS_COMPONENT_SPEC.aspects.borders`) уже отмечает:
«derived: border и radius перекрыты docs-theme.css (.card → border-radius: 0)».
Раньше generic fallback-бокс в «Скругления» маскировал проблему; реальный клон
делает конфликт видимым.

## Proposed fix

Один из вариантов (выбрать явно, не смешивать):

1. **Переименовать** класс UI-карточки в `docs-theme.css` (например
   `.docs-card` / `.guide-card`) и обновить разметку docs-страниц, где используется
   стиль «карточки документации», не DS Card.
2. **Изолировать** правило через более специфичный селектор (например
   `.storybook-layout .card` только для layout docs, без попадания на
   `#spec-sample .card` / anatomy/radius clones).
3. **Scope override** для presentbook: отдельный wrapper-класс на guide-page stage,
   восстанавливающий production radius для `.card` внутри radius-preview (минимальный
   diff, но не убирает корень — два разных `.card` в одном CSS).

## Do not

- Не менять production-разметку компонента Card.
- Не хардкодить `border-radius` inline только в `card.html` radius-preview —
   это точечный обход, не устранение конфликта имён в docs-theme.
