# Отчёт: portal vs canonical `*Data.ts` для верстки компонентов Driver

**Дата:** 2026-08-16  
**Product:** `driver` (`aid: driver`, active)  
**Portal:** https://aid-ds.vercel.app  
**Canonical source:** `pages/driver-color-tokens/*Data.ts` (per `product-context.mdc`, `token-integrity.mdc`)  
**Mode:** read-only audit — файлы не изменялись

---

## Executive summary

| Вопрос | Ответ |
|---|---|
| Cursor будет использовать `*Data.ts` при верстке? | **Да** — `token-integrity.mdc` требует lookup в `pages/driver-color-tokens/*Data.ts` |
| Portal = `*Data.ts`? | **Да, по архитектуре** — страницы импортируют data напрямую (например `semanticColorSections` из `data.ts`) |
| Production portal = текущий repo? | **Частично** — live только **Colors** и **Icons**; Typography / Spacing / Radius / Shadows → **404** в SPA |

**Вывод:** для верстки компонентов опираться на **`*Data.ts` в репозитории**, а не только на то, что сейчас видно на Vercel. После redeploy portal и data снова совпадут для всех 6 коллекций.

---

## 1. Portal: что доступно на aid-ds.vercel.app

| Route | SPA status | Примечание |
|---|---|---|
| `/` | ✅ Hub | только Colors и Icons — кликабельные ссылки |
| `/tokens/colors` | ✅ | полная таблица токенов |
| `/tokens/icons` | ✅ | grid 178 иконок, 5 категорий |
| `/tokens/typography` | ❌ 404 | «Страница не найдена» |
| `/tokens/spacing` | ❌ 404 | |
| `/tokens/radius` | ❌ 404 | |
| `/tokens/shadows` | ❌ 404 | |
| `/design-system/tokens/colors` | ❌ 404 | в `product.json` hub = `/design-system`, на prod hub = `/` |

HEAD на все routes → 200 (Vercel rewrite на `index.html`), но **старый JS-бандл** не знает новые routes.

---

## 2. Collection metadata (data.ts ↔ registry ↔ changelog)

| Раздел | collectionName | artifact | data file | registry | changelog file |
|---|---|---|---|---|---|
| Colors | `colors-semantic` | `Colors/Semantic` | `data.ts` | ✅ | `tokens/colors-semantic-changelog.json` ✅ |
| Typography | `typography-sem` | `Typography/Semantic` | `typographyData.ts` | ✅ | `tokens/typography-sem-changelog.json` ✅ |
| Spacing | `spacing-sem` | `Spacing/Semantic` | `spacingData.ts` | ✅ | `tokens/spacing-sem-changelog.json` ✅ |
| Radius | `radius-sem` | `Radius/Semantic` | `radiusData.ts` | ✅ | `tokens/radius-sem-changelog.json` ✅ |
| Shadows | `effects-shadows` | `Effects/Shadows` | `shadowsData.ts` | ✅ | `tokens/effects-shadows-changelog.json` ✅ |
| Icons | `icons` | `Icons/Wilhelm` | `iconsData.ts` | ✅ | `tokens/icons-changelog.json` ✅ |

**collectionName ↔ changelog filename:** 6/6 ✅  
**artifact ↔ registry:** 6/6 ✅  
**Figma library names:** в data-файлах есть ссылки на Figma; registry artifacts согласованы с data (`Colors/Semantic`, `Icons/Wilhelm` и т.д.). Отдельной сверки с live Figma не делалось.

---

## 3. Portal vs data.ts — по коллекциям

### Colors — ✅ совпадение (portal live)

| Field | Portal (aid-ds.vercel.app) | `data.ts` |
|---|---|---|
| collectionName | (в JSON export — `semanticColorSections`) | `colors-semantic` |
| artifact | — | `Colors/Semantic` |
| `Bg · Primary` | Day `#FFFFFF`, Night `#2D2C2E` | ✅ same |
| `Bg · Secondary` | Day `#F5F5F5`, Night `#202021` | ✅ same |
| `Bg · Actions` | Day `#2D2C2E`, Night `#000000` | ✅ same |
| `Texts · Primary 1` | Day `#000000` 87%, Night `#FFFFFF` | ✅ same |
| `Buttons · Primary` | (на portal в секции Buttons) | Day `#2D2C2E`, Night `#CBCACC` ✅ |

**Naming:** portal показывает **section + name** (`Bg / Primary`), не hyphenated paths (`bg-primary`).

---

### Typography — ⚠️ portal 404; data.ts canonical

| Field | `typographyData.ts` |
|---|---|
| collectionName | `typography-sem` |
| artifact | `Typography/Semantic` |
| `headline-1` | Roboto 500, 44px / 56px, ls 0 |
| `body-2` | Roboto 400, 16px / 20px, ls 0.15 |
| `subtitle-2` | Roboto 500, 14px / 16px, ls 0.1 |

Portal comparison: **N/A** (страница не задеплоена).

---

### Spacing — ⚠️ portal 404; data.ts canonical

| Token | value px | value rem |
|---|---|---|
| `space-8` | 8 | 0.5 |
| `space-16` | 16 | 1 |
| `space-24` | 24 | 1.5 |
| `space-32` | 32 | 2 |
| `space-48` | 48 | 3 |

collectionName: `spacing-sem`, artifact: `Spacing/Semantic`

---

### Radius — ⚠️ portal 404; data.ts canonical

| Token | value |
|---|---|
| `radius-flat` | 0 |
| `radius-8` | 8px |
| `radius-16` | 16px |
| `radius-pill` | 9999px |

collectionName: `radius-sem`, artifact: `Radius/Semantic`

---

### Shadows — ⚠️ portal 404; data.ts canonical

| Token | preview box-shadow (excerpt) |
|---|---|
| `shadow-1` | `0px 0px 1px rgba(0,0,0,0.15), 0px 1px 2px rgba(0,0,0,0.12)` |
| `shadow-2` | `0px 2px 12px rgba(0,0,0,0.12)` |
| `shadow-6` | elevation 6 (3 layers) |

collectionName: `effects-shadows`, artifact: `Effects/Shadows`

---

### Icons — ✅ совпадение (portal live)

| Field | Portal | `iconsData.ts` |
|---|---|---|
| collectionName | — | `icons` |
| artifact | — | `Icons/Wilhelm` |
| `mastercard`, `qiwi`, `visa` | ✅ Alternative | ✅ same ids/names |
| `search`, `close`, `check` | ✅ Action/Controls | ✅ same |
| default size | `24×24` | `ICON_DEFAULT_SIZE = 24` ✅ |
| asset path | `/icons/{section}/{id}.svg` | `iconAssetPath()` ✅ |

---

## 4. Таблица совпадений (portal vs data.ts)

| Collection | Portal live | Names match | Values match | Source of truth |
|---|---|---|---|---|
| colors-semantic | ✅ | ✅ (section+name) | ✅ (5/5 samples) | **`data.ts`** |
| typography-sem | ❌ 404 | N/A | N/A | **`typographyData.ts`** |
| spacing-sem | ❌ 404 | N/A | N/A | **`spacingData.ts`** |
| radius-sem | ❌ 404 | N/A | N/A | **`radiusData.ts`** |
| effects-shadows | ❌ 404 | N/A | N/A | **`shadowsData.ts`** |
| icons | ✅ | ✅ | ✅ (size/path) | **`iconsData.ts`** |

---

## 5. Расхождения

| # | Тип | Описание | Правильный источник |
|---|---|---|---|
| 1 | **Deploy drift** | 4/6 token pages → 404 на production | **Repo + redeploy Vercel** |
| 2 | **Route docs** | `product.json`: hub `/design-system`; prod hub `/` | **Фактический prod:** `/`, `/tokens/*` |
| 3 | **Naming model** | `token-integrity` examples: `bg-accent-main`; Driver data: `Bg · Primary` | **`data.ts`** — lookup по section + name, не по hyphenated path |
| 4 | **Hub UI** | Hub показывает Typography/Spacing текстом, но без ссылок (prod bundle) | После redeploy — все 6 links из `hubData.ts` |

---

## 6. token-integrity.mdc — подтверждение

| Требование | Статус | Цитата / факт |
|---|---|---|
| Lookup в `*Data.ts` / `data.ts` | ✅ | «canonical token values live in `pages/driver-color-tokens/*Data.ts`» |
| Hardcode без approval запрещён | ✅ | «Never hardcode hex, rgb, hsl … unless user explicitly asks / approves» |
| Exception flow | ✅ | Standard deviation: option **c** → pending item → **proceed with implementation** |
| Unresolved gaps | ✅ hard stop | «Do not proceed … until the user resolves all gaps» |

---

## 7. Cursor при верстке компонентов Driver

При соблюдении gates агент:

1. Подтверждает product context → `driver`
2. Делает token lookup в `pages/driver-color-tokens/*Data.ts`
3. Не хардкодит значения без explicit approval
4. Записывает изменения в `changes/driver/pending/`
5. При отклонении от standard — Standard deviation / documented exception

**Portal на Vercel** — визуальная витрина того же data-слоя, но **не заменяет** `*Data.ts` как source of truth (особенно пока 4 страницы не задеплоены).

---

## 8. Token names для первого компонента (типовой control, напр. Button)

Из canonical data (рекомендуемый минимальный набор):

**Colors** (`data.ts`, section · name):

- `Bg · Primary` — `#FFFFFF` / `#2D2C2E`
- `Texts · Primary 1` — text on light/dark
- `Buttons · Primary` — `#2D2C2E` / `#CBCACC`
- `Buttons · Secondary` — `#EBEDF0` / `#504F52`
- `Buttons · Disabled` — disabled state
- `Strokes · Secondary` — border

**Typography** (`typographyData.ts`):

- `body-2` — 16px / 20px, Roboto 400 (label on control)
- `subtitle-2` — 14px / 16px (compact label)

**Spacing** (`spacingData.ts`):

- `space-8`, `space-12`, `space-16` — padding/inset

**Radius** (`radiusData.ts`):

- `radius-8` или `radius-12` — button corners

**Shadows** (`shadowsData.ts`):

- `shadow-1` — elevation для raised control (optional)

**Icons** (`iconsData.ts`):

- `controls · close`, `controls · check`, `action · search` — trailing/leading

> ⚠️ В Driver tokens — **display names** (`Buttons / Primary`), не `bg-accent-main`. Lookup и component spec должны ссылаться на `{ section, name }` или id (`body-2`, `space-16`).

---

## 9. Pending items (предложение, без создания файлов)

### High — redeploy portal

```json
{
  "id": "portal-deploy-4-missing-sections",
  "type": "infrastructure",
  "reason": "aid-ds.vercel.app serves old bundle: Typography/Spacing/Radius/Shadows → 404",
  "recommendation": "Redeploy pages/driver-color-tokens from cursor/figma-styles-page-visualization (commits 434c2e3+)",
  "status": "temporary",
  "reviewAt": "release"
}
```

### Medium — route documentation

```json
{
  "id": "product-json-route-base-drift",
  "type": "documentation",
  "standard": "presentbookRoot routes in product.json",
  "actual": "Production hub at /, not /design-system",
  "recommendation": "Align products/driver/product.json tokenRoutes.hub with deployed routes or redeploy with /design-system hub",
  "status": "temporary",
  "reviewAt": "release"
}
```

### Low — naming model in component specs

При первом компоненте — явно зафиксировать mapping `section.name` → component token ref в pending item, чтобы не искать несуществующий `bg-primary` в `data.ts`.

---

## 10. Итог

| Критерий | Результат |
|---|---|
| Registry ↔ data ↔ changelog | ✅ 6/6 |
| Portal = data (архитектура) | ✅ direct import |
| Portal = data (production сейчас) | ⚠️ 2/6 live |
| Cursor использует `*Data.ts` | ✅ по rules |
| Hardcode blocked | ✅ |
| Documented exceptions allowed | ✅ |

**Для верстки компонентов:** используй **`pages/driver-color-tokens/*Data.ts`** как единственный source of truth. Portal на Vercel подтверждает Colors и Icons; остальные 4 коллекции в data уже есть в repo, но **требуют redeploy** для визуальной сверки на aid-ds.vercel.app.
