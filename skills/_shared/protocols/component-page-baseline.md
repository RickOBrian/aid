---
destination: skills/_shared/protocols/
name: component-page-baseline
metadata:
  version: "1.0.0"
  kind: protocol
  status: stable
  platforms: [web, ios, android]
  owner: design-system-team
description: >
  Протокол вёрстки страницы компонента в Presentbook: сравнение сложности с эталоном Switch и подтверждение объёма работ до начала вёрстки.
---


# Component Page Baseline

> Статус: Stable · v1.0.0 · обновлено 2026-09-20

---

## 1. Триггер

Правило активируется на любую команду вида «сверстай компонент X»,
«реализуй компонент X», «сделай review page для X», где X — новый или
существенно изменяемый компонент, с приложенной Figma-ссылкой, скриншотом
или описанием. Применяется без явного упоминания этого правила в промте.

Не применяется к: правкам токенов, портальной инфраструктуры (хаб,
роутинг, changelog UI), документации, аудитам — если задача не создаёт и не
переверстывает конкретный component review page.

## 2. Совместное действие с другими gates

Это правило **не заменяет и не пропускает**:

- `protocols/gates/product-context.md` — продуктовый контекст подтверждается первым;
- `protocols/gates/component-gate.md` — lookup существующего компонента, component
  artifact model, changelog/pending, placement;
- `protocols/gates/token-integrity.md` — token lookup, token gap questionnaire;
- Platform scope gate — для каких платформ верстается компонент (Web /
  iOS / Android / комбинация) спрашивается явно, если не указано в задаче;
- Composition gate — Item vs Surface View vs Structural View vs Layout
  определяется до генерации (см. `ds-component-architecture-guide.md`).

Baseline + diff протокол выполняется **в дополнение** к ним, не вместо. Если
эти gates ещё не пройдены — сначала пройти их, затем применить протокол
ниже.

## 3. Reference baseline: Switch (`/components/switch`)

Эталон зафиксирован на текущем состоянии `SwitchPage.tsx` +
`components/switch.*` (последний одобренный review-компонент на момент
создания этого правила, согласно `component-registry.json` и
`presentbook-guide.md` § «Component pages»). Baseline включает:

1. **Identity-блок** (`ComponentMetaHeader`) — только критичные факты:
   canonical name + aliases, architecture level, category
   (`componentsGroup`), source path (с copy-действием), Figma source
   (ссылка + node id). Никаких pipeline/debug-статусов в этом блоке —
   версия и release status сюда не дублируются (см. п. 2).

2. **Version / release status / changelog** — единственное место:
   `ComponentReleaseStatus` (version, release status, review route,
   pending-индикатор) + `ChangelogTable` под ним. Это осознанное
   исключение `protocols/gates/component-gate.md` / `presentbook-guide.md` — не
   декоративная обёртка, без доп. полей сверх обязательных
   (`Component review page requirements` в `protocols/gates/component-gate.md`).

3. **Sandbox controls** — сегментированные переключатели (mode/variant/
   state и т.п.) над табами, управляющие live-демо, State matrix, Anatomy
   и Code snippet одним источником состояния.

4. **Табы**: Preview (live demo), States, Tokens, Accessibility, Anatomy —
   ровно в этом наборе, если применимо к компоненту (см. диф-протокол,
   п. 3, для упрощения при простом компоненте).

5. **Anatomy inspector** (`AnatomyInspector`):
   - масштаб превью управляется отдельным zoom-контролом
     (+/−/Reset), диапазон и шаг — как в текущей реализации; после Reset
     масштаб возвращается к дефолтному значению текущего инспектора —
     не обязательно 1:1 реальному размеру компонента, если компонент
     мал и нечитаем без увеличения (решается по месту, не переизобретая
     сам механизм zoom);
   - нумерованные hotspot'ы с leader lines для зон, физически близких
     друг к другу на превью;
   - карточка деталей по каждому hotspot с явным разделением значения на
     категории: `semantic-token` / `raw-value` (геометрия, opacity, любое
     измерение без токена) / `platform-convention` (touch target,
     disabled opacity и т.п. по `platforms.md`) / документированное
     исключение (`approved exception` — когда значение отклоняется от
     стандарта и это подтверждено пользователем per `protocols/gates/token-integrity.md`
     § «Standard deviation», вариант c). Если для компонента исключений
     нет — четвёртая категория просто не используется, схему не менять.
   - любое изменение zoom/leader-line/halo/anchor геометрии в этой зоне
     подчиняется `anatomy-standard.mdc` (сначала прочитать
     `skills/_shared/standards/anatomy-annotation-standard.md` и подтвердить это в
     первой строке ответа, если правка попадает в его scope).

6. **Tokens вкладка** — таблица semantic-токенов компонента (имя, CSS/
   platform variable, значения по модам) с copy-действиями, по образцу
   `switchTokenSources` / `dsw-switch-token-table`.

7. **States вкладка** — platform-aware терминология по
   `component-states-guide.md`: при выборе платформы в Code-блоке набор
   состояний и их названия соответствуют этой платформе.
   - **Web**: hover, pressed (active), focused, selected, disabled,
     loading, skeleton, error (только формы) — по применимости к
     компоненту;
   - **iOS**: highlighted (аналог pressed), selected, disabled, loading,
     skeleton, error (только формы) — **без** hover и **без** отдельного
     focused-состояния (iOS не имеет курсора; focus ring — платформенный
     дефолт, не отдельное управляемое состояние на review page);
   - **Android**: pressed включает ripple как **визуальный эффект**
     самого pressed-состояния, не отдельное управляемое состояние;
     selected, disabled, loading, skeleton, error (только формы) — **без**
     hover и **без** отдельного focused-состояния;
   - список состояний, их приоритет поглощения и допустимые комбинации —
     по таблицам из `component-states-guide.md`, не изобретать заново;
   - `error` — только для контролов форм (Input, Select, Checkbox, Radio,
     FieldCheckbox, FieldRadio и т.п.), не для Button/Badge/Tag.

8. **Accessibility вкладка** — конкретные a11y-факты компонента (ARIA
   роль/атрибуты, keyboard map, touch target, focus-visible, aria-busy для
   loading и т.п.), не общие фразы.

9. **Code snippet** (`ComponentCodeSnippet`) — переключатель платформ
   (минимум React/TSX; SwiftUI и Compose — если компонент в scope этих
   платформ), синхронизированный с текущим выбором variant/state/mode на
   странице через единый `selection`/`selectionSummary`. Платформа без
   реальной реализации в репозитории **всегда получает валидный
   reference-код** (`isReferenceOnly: true`, опционально `sourcePath` для
   реальных файлов) — код показывается как обычно, **без видимого на
   странице disclaimer-баннера** об отсутствии реализации; этот статус
   сообщается только в review summary в чате после верстки, не в UI
   страницы.

10. **Warning-баннер на странице** — рендерится **только** при
    подтверждённой ошибке в текущем коде/реализации (`confirmedIssue`),
    с описанием конкретно этой ошибки. Никогда не используется как общий
    процессный статус, pipeline-заметка или предупреждение «на всякий
    случай» — критерий из `presentbook-guide.md` § «Критерий содержания
    component page».

## 4. Обязательный протокол: baseline + diff

При получении команды на новый или существенно изменяемый компонент,
**до написания любого кода**:

1. **Сравнить сложность** нового компонента с Switch (baseline) по:
   - архитектурному уровню (Item / Surface View / Structural View /
     Layout, см. `ds-component-architecture-guide.md`);
   - количеству слотов;
   - количеству применимых состояний (из `component-states-guide.md`);
   - наличию lifecycle/анимации/составного layout, которых у Switch нет.

2. **Если компонент сложнее** — явно предложить необходимые дополнения к
   baseline (например: slots-map для Structural View, доп. edge cases в
   sandbox controls, расширенная Anatomy с большим числом hotspot'ов,
   нестандартные a11y-паттерны, доп. таб) **с обоснованием**, почему это
   нужно именно для этого компонента — не добавлять по умолчанию.

3. **Если компонент проще** — явно предложить, какие блоки baseline
   избыточны и как их упростить или убрать (например: States-вкладка не
   нужна для Item без собственных состояний; Anatomy с 1–2 зонами вместо
   искусственно раздутых hotspot'ов; Tokens-вкладка сворачивается в
   inline-таблицу, если токенов меньше 3).

4. **Если отклонений не требуется** — явно сказать «baseline подходит без
   изменений» и перечислить, какие блоки применяются как есть.

5. В любом из случаев (2, 3, 4) — **дождаться подтверждения пользователя**
   перед началом вёрстки. Не начинать писать код молча на основании
   собственной оценки сложности.

Порядок относительно других gates: product context → component lookup
(`protocols/gates/component-gate.md`) → platform scope → token lookup
(`protocols/gates/token-integrity.md`) → **baseline + diff (это правило)** → подтверждение
пользователя → implementation.

## 5. Обновление baseline

Baseline обновляется на новый эталон **только по явной команде**
пользователя (например: «теперь используй [компонент] как новый
baseline») — не автоматически после каждого нового одобренного
компонента. До такой команды эталоном остаётся Switch, как описано в этом
файле.

---

## 6. Changelog

- **1.0.0** — 2026-09-20. Перенесено из .cursor/rules/component-page-baseline.mdc. Cursor объявлен легаси; правило переписано инструмент-нейтрально и живёт теперь там, где его читает рабочий агент. Прежний файл оставлен указателем.
