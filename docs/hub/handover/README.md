# Переезд PD на новое устройство

Новый инженер — замена PD: тот же логин GitHub и все доступы PD (решение PD
2026-10-18, `../BOARD.md` «Решения PD»). Отдельно его нигде не заводят:
для чатов, бота и сервиса задач это тот же PD. С нуля настраивается только
Claude на новом устройстве. Цель — чтобы каждый чат проснулся там с тем же
контекстом, что и здесь, но без длинной истории (экономия, `../ORCHESTRATION.md` §12).

Контекст чата живёт не в истории, а в файлах:

| Что | Где | В git |
|---|---|---|
| Правила продукта и ролей | `CLAUDE.md` корня и папки продукта, `docs/hub/` | да |
| Состояние чата: что в работе, чего ждёт | `CLAUDE.local.md` в папке чата | нет — переносит `pack.sh` |
| Память Claude по папке | `~/.claude/projects/<путь>/memory/` | нет — переносит `pack.sh` |
| Личные настройки Claude | `~/.claude/` (`CLAUDE.md`, `skills/`, `settings.json` без `env`) | нет — переносит `pack.sh` |
| Ключи, токены, профили Облака | связка ключей macOS, `~/.config/` | нет и не переносится — вход заново |

---

## На старом устройстве (PD)

1. **Всё запушено.** В каждой папке `~/Projects/aid*` нет незакоммиченного,
   ветки на origin. `pack.sh` покажет, где не так.
2. **Чаты сохранили состояние.** Каждый активный чат в безопасной точке
   записал состояние в свой `CLAUDE.local.md` (как при перезапуске, §12).
   `pack.sh` назовёт папки, где файла нет или он старше двух дней, — только
   этим чатам и написать «сохрани состояние в CLAUDE.local.md».
3. **Упаковать:**

   ```bash
   bash ~/Projects/aid-hub/docs/hub/handover/pack.sh
   ```

   Архив `~/Desktop/aid-handover-*.zip` передать лично (AirDrop, флешка).
   Не в git, не в чат, не в облачный диск.

## На новом устройстве

4. **Поставить и войти:** Xcode Command Line Tools (`git`), Homebrew,
   `gh`, Node LTS, Claude Desktop. Войти в Claude, `gh auth login` под
   логином PD.
5. **Распаковать** архив и запустить:

   ```bash
   bash ~/Desktop/aid-handover-YYYYMMDD-HHMM/unpack.sh ~/Desktop/aid-handover-YYYYMMDD-HHMM
   ```

   Скрипт есть и в архиве, если его там нет — взять из этой папки в репо.
   Он клонирует репозитории, создаёт worktree-папки чатов на их ветках и
   раскладывает `CLAUDE.local.md`, память и настройки. Существующее не
   перезаписывает.
6. **Ключи и входы — заново, ничего не копировать:**
   - ключ сервиса задач — `/team-key` в чате Штаба (кладёт в связку ключей);
   - Яндекс Облако — `yc init` по профилю на каждый контур, как в
     `../ORCHESTRATION.md` §4 «Секреты»; профили не переносить файлом;
   - коннекторы claude.ai (GitHub, Figma) — включить в чатах, где нужны;
     Vercel не включать (ADR-038).
7. **Создать чаты** в Claude Desktop, по одному на строку таблицы ниже:
   новая сессия → папка → имя ровно как в таблице → группа «AID» → модель
   и усилие. Первое сообщение в каждый — «старт». Чат прочитает свой
   `CLAUDE.local.md` и продолжит с того же места. Начать со Штаба, остальные
   — по мере надобности: молчащий чат ничего не стоит (§12).

| Чат | Папка (`~/Projects/…`) | Модель · усилие |
|---|---|---|
| AID · Hub · Штаб | `aid-hub` | Opus · среднее |
| AID · Tasks | `aid-tasks` | Sonnet · низкое |
| AID · Requests | `aid-requests` | Sonnet · низкое |
| AID · Team | `aid-team/tools/aid-team` | Sonnet · среднее |
| AID · Standards | `aid` | Opus |
| AID · Designer | `aid-designer` | Opus |
| AID · QA | `aid-qa` | Sonnet · среднее |
| AID · Security | `aid-security` | Opus · среднее |
| AID · Developer · Presentbook | `aid-presentbook` | Opus |
| AID · Developer · Token Comparator | `aid-plugin/tools/figma-token-comparator` | Opus |
| AID · Developer · Style Migration | `aid-style-migration/tools/aid-style-migration` | Opus |
| AID · Developer · MCP | `aid-mcp-plugin/tools/mcp-figma-plugin` | Opus |
| AID · Developer · Bot | `aid-bot/tools/aid-bot` | Opus |
| AID · Developer · Team Service | `aid-team-service` | Opus |
| AID · DevOps | `aid-infra` | Sonnet · среднее |
| AID · DevOps · Presentbook | `aid-devops-presentbook` | Sonnet · среднее |
| AID · DevOps · Registry API | `aid-devops-registry` | Sonnet · среднее |
| AID · DevOps · Team Service | `aid-devops-team` | Sonnet · среднее |
| AID · Ops · <имя> | `aid-ops` | Sonnet · низкое |

Чаты Ops — по одному на живого инженера, имена — как на старом устройстве.

8. **Проверка.** В Штабе: «проверь переезд». Штаб сверяет, что папки на
   своих ветках, `CLAUDE.local.md` на месте, `gh` и ключ задач работают.

## После переезда

Старое устройство не работает с чатами параллельно с новым: две копии
одного чата правят одни ветки. Когда новое заработало, старые чаты
архивируются.
