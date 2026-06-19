---
name: add-skill
description: Добавить новый skill или shared-guide в дизайн-систему из готового .md файла. Используй когда пользователь просит добавить скилл, залить скилл, установить скилл, зарегистрировать скилл.
argument-hint: "[путь/к/файлу.md] [skill | guide]"
arguments: [filepath, type]
disable-model-invocation: true
allowed-tools: Bash(mkdir *) Bash(cp *) Bash(cat *) Bash(touch *) Bash(echo *) Bash(git *) Read(*) Write(*)
---

## Описание

Добавляет новый скилл или shared-гайд в дизайн-систему.
Читает frontmatter исходного файла, создаёт правильную структуру папок,
кладёт файл на нужное место, создаёт TESTING.md, обновляет .cursorrules,
коммитит и пушит. Всё автоматически.

---

## Контекст — что читать перед началом

1. Прочитай `CLAUDE.local.md` в корне репо — найди строку `username:`. Используй это имя для идентификации.
   - Если `CLAUDE.local.md` не найден → используй `unknown`, в конце предупреди пользователя создать файл
2. Прочитай `.claude/skills/shared/token-rules.md` если существует
3. Прочитай `.claude/skills/shared/platforms.md` если существует

---

## Аргументы

- `$filepath` — путь к исходному .md файлу (первый аргумент)
- `$type` — тип файла: `skill` или `guide` (второй аргумент)

Если `$type` не передан — спроси: "Это skill или guide?". Не продолжай до ответа.

---

## Шаги выполнения

ALWAYS use this exact structure. Each section is mandatory. Do not skip steps.

### Шаг 1. Прочитай и разбери исходный файл

Открой `$filepath`.

Извлеки из YAML frontmatter следующие поля:

| Поле | Где искать | Значение по умолчанию |
|---|---|---|
| `name` | сначала верхний уровень `name:`, затем `metadata.name` | нет — обязательное |
| `version` | `metadata.version`, затем верхний уровень `version:` | `1.0.0` |
| `platforms` | `metadata.platforms` | `web, ios, android` |
| `description` | верхний уровень `description:` | пустая строка |

Если `name` не найден нигде — остановись и спроси пользователя:
"Не нашёл поле name в frontmatter. Как назвать этот скилл?"
Не продолжай до получения ответа.

Если файл `$filepath` не существует — сообщи об ошибке с точным путём и остановись.

---

### Шаг 2. Создай структуру

**Если `$type = skill`:**

```bash
mkdir -p .claude/skills/{name}/references
touch .claude/skills/{name}/references/.gitkeep
cp "$filepath" .claude/skills/{name}/SKILL.md
```

**Если `$type = guide`:**

```bash
mkdir -p .claude/skills/shared
cp "$filepath" .claude/skills/shared/{name}.md
```

Проверь что файл скопировался — если нет, сообщи об ошибке и остановись.

---

### Шаг 3. Создай TESTING.md (только если `$type = skill`)

Создай файл `.claude/skills/{name}/TESTING.md` со следующим содержимым:

```markdown
# TESTING — {name}

## Чеклист

- [ ] Скилл виден в меню при наборе `/` в Claude Code
- [ ] Вызов `/{name}` запускает скилл
- [ ] Frontmatter содержит description
- [ ] Скилл читает username из CLAUDE.local.md
- [ ] git pull --rebase выполняется без конфликтов
- [ ] .cursorrules обновлён
```

---

### Шаг 4. Обнови .cursorrules

Открой `.cursorrules` в корне репо.
Если файл не существует — создай пустой.

Проверь: есть ли уже строка упоминающая `{name}` в файле.
- Если есть — не дублируй, пропусти этот шаг.
- Если нет — добавь в конец файла:

Для skill:
```
# Skill: {name} → see .claude/skills/{name}/SKILL.md
```

Для guide:
```
# Guide: {name} → see .claude/skills/shared/{name}.md
```

---

### Шаг 5. Git — закоммить и запушить

Выполни строго в таком порядке:

```bash
git pull --rebase
```

Если `git pull --rebase` упал с конфликтом — сообщи пользователю, не продолжай. Попроси разрешить конфликт вручную.

```bash
git add .claude/ .cursorrules
git commit -m "feat(skills): add {name} {$type} v{version}"
git push
```

Если `git push` упал:
- Выведи точный текст ошибки
- Сообщи: "Файлы сохранены локально. Push не выполнен. Причина: [текст ошибки]"
- Не откатывай изменения

---

### Шаг 6. Отчёт пользователю

Выведи итоговый отчёт в следующем формате:

```
✅ Скилл {name} добавлен

Создано:
  .claude/skills/{name}/SKILL.md
  .claude/skills/{name}/TESTING.md
  .claude/skills/{name}/references/.gitkeep

Обновлено:
  .cursorrules

Git:
  Коммит: feat(skills): add {name} {$type} v{version}
  Push: ✅ успешно  /  ⚠️ не выполнен — [причина]
```

Если `CLAUDE.local.md` не был найден — добавь в конце:
```
⚠️ CLAUDE.local.md не найден. Создай его в корне репо:

# Мои настройки
username: твоё_имя
```

---

## Graceful degradation

| Ситуация | Действие |
|---|---|
| `$filepath` не существует | Остановись, сообщи точный путь |
| `name` не найден в frontmatter | Спроси пользователя, жди ответа |
| `$type` не передан | Спроси "skill или guide?", жди ответа |
| `.claude/skills/shared/*.md` недоступен | Продолжай, предупреди в отчёте |
| `.cursorrules` не существует | Создай пустой, затем добавь запись |
| `CLAUDE.local.md` не найден | Используй username=`unknown`, предупреди в отчёте |
| `git pull --rebase` — конфликт | Остановись, попроси разрешить вручную |
| `git push` упал | Сообщи ошибку, не откатывай файлы |

---

## Changelog

### v1.0.0
- Первая версия: skill + guide
- TESTING.md, references/.gitkeep
- git pull --rebase перед коммитом
- Полный graceful degradation
- Структурированный отчёт пользователю
- Обработка всех ошибок git
