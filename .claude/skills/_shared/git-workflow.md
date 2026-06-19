# Git Workflow

## Синхронизация памяти

```bash
git pull --rebase
git add memory/<skill-name>/log.<имя>.json
git commit -m "<тип>(<skill>): <что произошло>"
git push
```

## Типы коммитов
- `memory(<skill>)` — запись в журнал памяти
- `spec(<component>)` — новая спека компонента
- `feat(skills)` — новый скилл
- `fix(skills)` — правка скилла
- `chore` — инфраструктура

## Правило --rebase
Всегда --rebase, никогда --merge для memory/.
