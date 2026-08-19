---
name: component-build-workflow
metadata:
  version: "1.0.0"
  owner: design-system-team
destination: skills/
---

# Component Build Workflow — v1.0.0

Определяет **порядок gate'ов внутри Discovery-фазы** (до кода) любого Product
DS Component build/change. Не дублирует существующие gates — только задаёт,
в каком порядке они срабатывают, и добавляет один новый: **Platform scope
gate**.

Оркестратор верстки — `skills/ds-component-build/SKILL.md`. Этот файл
описывает Discovery-фазу того workflow подробнее; Implementation/Verification
описаны там же (см. ссылки ниже — не дублируются).

---

## Terminology note

«Composition gate» и «Token coverage gate» ниже — не новые механики, а имена
для уже существующих проверок внутри Discovery-фазы `ds-component-build`:

- Composition gate = «Component lookup procedure» из `.cursor/rules/component-gate.mdc`.
- Token coverage gate = «Token lookup procedure» / «Token gap handling» из `.cursor/rules/token-integrity.mdc`.

Единственный **новый** gate в этом файле — Platform scope gate. Он идёт первым,
потому что Composition gate и Token coverage gate должны проверяться только
для платформ, подтверждённых в Platform scope gate — иначе объём проверки
неизвестен до её начала.

---

## Phase 1 — Discovery (no code)

Выполняется до любой правки кода/токенов/файлов компонента.

### 1.1 Platform scope gate (mandatory, first)

Срабатывает при начале работы над **любым** новым или существенно
изменяемым компонентом — раньше Composition gate и Token coverage gate.

**Правило:**

1. Cursor обязан явно спросить Principal Designer:
   > «Для каких платформ реализуется этот компонент — Web, iOS, Android, или
   > подмножество?»
2. Cursor **не имеет права**:
   - молча подставить дефолт «все три платформы»;
   - молча ограничиться только Web.

   Оба варианта требуют явного подтверждения пользователя.
3. Если Principal Designer не ответил — Cursor **не переходит к Phase 2
   (Implementation)**. Это hard stop, как unresolved token gap в
   `token-integrity.mdc`.
4. Подтверждённый ответ фиксируется как часть discovery-вывода **наравне** с
   предложенным architecture level (Item / Surface View / Structural View /
   Layout) — не как отдельная необязательная деталь.
5. Подтверждённый platform scope передаётся дальше и **ограничивает** объём
   Composition gate и Token coverage gate — они проверяют reuse/tokens только
   для подтверждённых платформ, не для всех трёх по умолчанию.
6. Platform scope попадает:
   - в финальный Review summary (например: «реализовано для: Web, iOS»);
   - в component metadata (`supportedPlatforms` — см.
     `component-gate.mdc` → Component artifact model);
   - в будущем — в `components/registry.json`, если/когда он появится в
     репозитории (сейчас такого файла нет; существующий
     `pages/driver-color-tokens/component-registry.json` — портальный индекс
     review-страниц, не platform-scope реестр).
7. **Расширение scope** (добавление платформы к уже реализованному
   компоненту) в новой сессии — это отдельный явный запрос Principal
   Designer, не автоматическое действие Cursor по инерции предыдущего
   ответа.
8. Платформы без физической реализации в репозитории (нет `.swift`/`.kt`
   файла) не считаются «готовыми» только потому, что подтверждены в scope.
   Discovery должен явно различать:
   - **scope** (для каких платформ компонент задуман) — результат этого
     gate;
   - **implementation status** (что физически реализовано) — результат
     Phase 2/3, показывается отдельно (например в Code snippet как
     «reference implementation по platform contract» против реального кода
     из репозитория).

### 1.2 Composition gate

Delegate → `.cursor/rules/component-gate.mdc`, «Component lookup procedure» +
«New component proposal». Применяется только к платформам, подтверждённым в
1.1.

### 1.3 Token coverage gate

Delegate → `.cursor/rules/token-integrity.mdc`, «Token lookup procedure» +
«Token gap handling» + «Standard deviation». Применяется только к платформам,
подтверждённым в 1.1 (например: SwiftUI-токены проверяются только если iOS в
scope).

---

## Phase 2 — Implementation

См. `skills/ds-component-build/SKILL.md`, Workflow шаги 4–6 (Implementation,
Artifacts, Review page & navigation). Platform scope из Phase 1 определяет,
для каких платформ здесь пишется реальный код, а для каких — только
reference-конвенции без физического файла (если платформа в scope, но
implementation не выполнена в этой сессии).

## Phase 3 — Verification & Review

См. `skills/ds-component-build/SKILL.md`, Workflow шаги 7–8 (Verify, Final
summary). Final summary дополнительно обязан перечислить platform scope и
implementation status по каждой платформе из 1.1 (см. п. 1.1.8).

---

## Changelog

- **1.0.0** — создан. Добавляет Platform scope gate как первый gate
  Discovery-фазы, перед Composition gate и Token coverage gate. Применён
  retroactively к Switch (`/components/switch`) — см. component pending
  item / review summary соответствующей сессии.
