# AID Team — как Claude инженера читает базу

Инструкция для инженера AID (Q-08, вариант «а», решение PD 2026-10-06).
Данных здесь нет: репозиторий публичный.

## Что это даёт

Claude в вашем аккаунте находит любого человека команды по имени,
фамилии, Telegram или GitHub-логину: «передай задачу Сергею» →
его GitHub-логин и продукты → issue по `docs/hub/ORCHESTRATION.md` §9.

## Как устроен доступ

- База — файл `people.json` в бакете `aidteam-team-data` (Яндекс Облако,
  каталог `team-data`). Схема — `schema/people.schema.json`.
- У каждого инженера свой сервисный аккаунт `reader-<github-логин>` —
  только чтение этого бакета (ACL бакета). Аккаунты называются по
  обязательному полю карточки — по умолчанию GitHub-логину, не по роли:
  роль может смениться, человек остаётся тем же (решение PD 2026-10-06). Записать или удалить он не может:
  пишет только PD (`STORAGE.md`).
- Ключ личный: один инженер — один ключ. Потерян или ушёл в чат — PD
  отзывает его и выдаёт новый, остальных это не задевает.

## Получить ключ — делает PD

В своём Терминале, под админским входом; `<логин>` — GitHub-логин
инженера из его карточки:

```bash
yc iam key create --service-account-name reader-<логин> --folder-name team-data --output ~/reader-<логин>.json
```

Файл передать инженеру закрытым каналом (личное сообщение, менеджер
паролей), затем удалить у себя: `rm ~/reader-<логин>.json`.

## Подключить — делает инженер, один раз

1. Установить утилиту Облака:
   ```bash
   curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
   ```
   Затем открыть новое окно Терминала.
2. Завести профиль `aidteam-reader` с полученным ключом (путь к файлу —
   ваш):
   ```bash
   yc config profile create aidteam-reader
   yc config set service-account-key ~/reader-<логин>.json
   yc config set endpoint api.cloud.yandex.net:443
   ```
3. Удалить файл ключа: он уже внутри профиля.
   ```bash
   rm ~/reader-<логин>.json
   ```
4. Проверка — команда выводит число людей в базе, не их данные:
   ```bash
   f=$(mktemp) && yc --profile aidteam-reader storage s3 cp s3://aidteam-team-data/people.json "$f" >/dev/null && python3 -c 'import json,sys;print(len(json.load(open(sys.argv[1]))["people"]))' "$f"; rm -f "$f"
   ```

Если у вас уже есть свой профиль `yc` по умолчанию, профиль
`aidteam-reader` его не заменяет: после шага 2 верните прежний —
`yc config profile activate <ваш профиль>`.

## Правила для Claude инженера

- Читать базу только так: скачать во временный файл
  (`yc --profile aidteam-reader storage s3 cp s3://aidteam-team-data/people.json "$f"`),
  найти человека, удалить файл. Вывод в stdout `yc` не поддерживает.
- Код выхода `yc storage s3 cp` ненадёжен: успех проверять по
  содержимому файла, а не по коду.
- Не выводить `yc config list`, `yc config profile get` и содержимое
  `~/.config/yandex-cloud/`: закрытый ключ хранится в профиле.
- Не копировать данные о людях в репозиторий, issues, доски и память
  чата — только GitHub-логин, как в `docs/hub/owners.json`.
- Карточка без `consent.date` не используется.
