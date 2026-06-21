# Git Workflow

Единый источник git-команд для всех скиллов репозитория.

---

## Синхронизация памяти после каждой записи

```bash
git pull --rebase
git add memory/<skill-name>/log.<имя>.json
git commit -m "<тип>(<skill>): <что произошло>"
git push
```

`--rebase` обязателен: подтягивает чужие изменения перед своими.
Личный log-файл не конфликтует с чужими — ребейз проходит чисто.

---

## Типы коммитов

| Тип | Когда использовать | Пример |
|-----|--------------------|--------|
| `memory` | Запись в журнал памяти | `memory(ds-component-spec): add BadgeStatus` |
| `spec` | Новая спека компонента | `spec(BadgeStatus): add spec v1.0.0` |
| `audit` | Результат аудита токенов | `audit(button): fix missing semantic tokens` |
| `feat` | Новый скилл | `feat(skills): add ds-token-audit` |
| `fix` | Правка существующего скилла | `fix(skills): clarify CollectionView definition` |
