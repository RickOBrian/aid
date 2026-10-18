# Стыки между продуктами

Вынесено из корневого `CLAUDE.md` (решение PD 2026-10-18, экономия
токенов): читать, когда задача задевает другой продукт.

Места, где продукт влияет на другой. Владелец стыка меняет его, второй
продукт на него опирается и без владельца его не трогает.

| Стык | Владелец | Правило |
|---|---|---|
| Кнопка «Скачать плагин» в Presentbook: `pages/aid-portal/tools-registry.json` → `https://github.com/RickOBrian/aid/releases/latest/download/token-comparator.zip` | Token Comparator | Ссылка постоянная. Каждый релиз плагина кладёт в GitHub Release два одинаковых файла — `token-comparator-vX.Y.Z.zip` и `token-comparator.zip` — и делает релиз Latest, затем скачивает по ссылке кнопки и проверяет версию. Presentbook ссылку не меняет. |
| Гайды в Presentbook: `pages/aid-portal/guide-registry.json` → `sourcePath` в `skills/_shared/` | Стандарты — текст, Presentbook — показ | Текст гайда правится только в `skills/_shared/`, не в `generated/` и не в `public/guides/`. Переименование или перенос файла-источника — вместе с правкой `guide-registry.json`, то есть через оба чата. |
| Токены и changelog продуктов: `tokens/`, `components/*-changelog.json` | Стандарты | Presentbook их читает при сборке; формат меняется только согласованно. |
| Очередь предложений `registry/propose-*` | Token Comparator — код, Стандарты — решения | Разбор предложений (мерж или закрытие с причиной) — решение Principal Designer в чате стандартов, ADR-035. |
| Знание о продукте: `products/<id>/knowledge/` (ADR-039) | Стандарты — папка `products/` и согласование формата; AID Style Migration — содержание и формат `aid-knowledge` | Канон меняется только PR с решением Principal Designer; предложения — уроками в `tools/aid-style-migration/inbox/`; инструменты читают версию из `main`; формат меняется согласованно |
| Показ знания о продукте в Presentbook | Presentbook — показ; AID Style Migration — данные | Presentbook читает `products/<id>/knowledge/`, не правит |
| Машинный слой стандартов: `skills/_shared/standards/*.json` (`machineFile` в `standards-registry.json`) | Стандарты | Источник истины — гайд (`humanFile`), JSON правится вместе с ним. Инструменты (AID Style Migration и другие) читают версию из `main` и не правят файлы у себя в ветке — нужна правка, это запрос в чат стандартов. Структура полей, которые читает инструмент, меняется только согласованно с его чатом через Штаб; текст правил и примеры — решение стандартов |
| Задачи команды: сервис `team.aidteam.pro` (ADR-046) | Developer и DevOps · Team Service — сервис и API; Team — люди и ключи; Developer · Presentbook — показ в «Управление» | Presentbook читает сервис только своей серверной функцией с сервисным ключом, клиенту — после проверки сессии; формат API меняется согласованно через Штаб; пишут в сервис личные ключи людей и ключи AI-инженеров (ADR-047) |
| Бот читает Latest Token Comparator: GitHub Release `token-comparator.zip` (пилот #71, контракт `tools/aid-bot/contracts/plugin-release.md`) | Token Comparator — релиз; Developer · Bot и владелец бота — бот | Бот раздаёт дизайнерам плагин из Latest-релиза Token Comparator; имя файла и метка Latest меняются только через Штаб с обоими |
| GitHub Releases репозитория: метка **Latest** | Token Comparator | Кнопка Presentbook ведёт на `releases/latest/download/token-comparator.zip`, поэтому Latest должен оставаться за релизом Token Comparator. Релизы других продуктов (AID Style Migration) публикуются **без** Latest, со своим префиксом тега; собственную кнопку скачивания такой продукт получает через чат Presentbook. |

Удалённые легаси-продукты не возвращаются и не упоминаются ни в одном
продукте — ADR-037.
