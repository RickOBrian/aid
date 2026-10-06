# Набор оркестрации чатов Claude

Как настроить у себя тот же принцип, что в AID: одна задача — один чат,
Штаб раздаёт задачи и собирает ответы, решения записываются дословно,
вопросы к человеку приходят одним списком (`/plan`).

**Инженеру.** Открой Claude Code (вкладка Code в Claude Desktop) в любой
папке и отправь:

```
Настрой у меня оркестрацию чатов по набору
https://github.com/RickOBrian/aid/tree/main/docs/hub/kit — начни с SETUP.md.
Сначала задай вопросы и покажи план, ничего не создавай до моего «да».
```

| Файл | Что |
|---|---|
| `SETUP.md` | Инструкция для Claude: вопросы, план, настройка, итог |
| `ORCHESTRATION.template.md` | Протокол проекта → `docs/hub/ORCHESTRATION.md` |
| `BOARD.template.md` | Доска проекта → `docs/hub/BOARD.md` |
| `skills/plan/SKILL.md` | Скилл `/plan` → `.claude/skills/plan/SKILL.md` |

Эталон — оркестрация AID: `docs/hub/ORCHESTRATION.md`, `docs/hub/BOARD.md`,
`.claude/skills/plan/SKILL.md`. Правки набора — PR в этот репозиторий
через «AID · Hub · Штаб».
