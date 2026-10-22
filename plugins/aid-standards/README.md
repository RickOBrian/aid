# Плагин `aid-standards`

Стандарты дизайн-системы AID для Claude Code инженера продукта: три
запрета, гейты по задаче, реестр стандартов, Figma-файлы и значения
токенов продуктов, скиллы `ds-*`. Задача — standards-6 (AID-33, #283).

## Установка

Репозиторий публичный, авторизация не нужна. В Claude Code:

```
/plugin marketplace add RickOBrian/aid
/plugin install aid-standards@aid
```

Затем `/plugin` → Marketplaces → `aid` → включить auto-update: для
сторонних маркетплейсов он выключен по умолчанию. Без него стандарты
обновляются только вручную (`/plugin marketplace update aid`).

Из терминала то же самое:

```
claude plugin marketplace add RickOBrian/aid
claude plugin install aid-standards@aid
```

Для всего проекта (каждый, кто открыл репозиторий, получает предложение
поставить плагин) — в `.claude/settings.json` проекта:

```json
{
  "extraKnownMarketplaces": {
    "aid": { "source": { "source": "github", "repo": "RickOBrian/aid" } }
  },
  "enabledPlugins": { "aid-standards@aid": true }
}
```

Как подключить стандарты во внешнем репозитории (плагин Figma, гайд,
папка без git), какие гейты проходить и готовый фрагмент `CLAUDE.md` —
`skills/_shared/protocols/external-repo-standards.md`.

## Что внутри

- `skills/aid-standards/SKILL.md` — входной скилл: Claude вызывает его сам
  перед работой с токенами, компонентами, Figma, гайдами.
- `skills/ds-*`, `skills/guide-lint` — скиллы репозитория, вызов
  `/aid-standards:<имя>`.
- `repo/` — зеркало нужной части корня репозитория AID. Документы пишут
  пути от корня репозитория, в плагине это `${CLAUDE_PLUGIN_ROOT}/repo/`.

## Как устроено

Всё в `repo/` и `skills/ds-*` — **симлинки** на файлы репозитория, не
копии: правка стандарта в `main` сразу попадает в плагин. При установке
Claude Code копирует плагин в кэш и разыменовывает симлинки (проверено
локальной установкой, 2026-10-21). `version` в `plugin.json` не задана
намеренно: тогда версия — SHA коммита, и каждый мерж в `main` — новая
версия.

Новый файл, на который ссылаются стандарты, вне перечисленных папок —
добавить симлинк в `repo/` по тому же пути. Проверка установки:

```
CLAUDE_CONFIG_DIR=$(mktemp -d) claude plugin marketplace add ./
CLAUDE_CONFIG_DIR=<та же папка> claude plugin install aid-standards@aid
```

Скиллы Штаба (`.claude/skills/`) в плагин не входят — это не стандарты.
