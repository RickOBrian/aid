'use strict';

// Создаёт таблицы сервиса в YDB, если их ещё нет, и дописывает в
// существующие недостающие колонки (только добавление, данные не трогает).
// Запуск — после каждой новой колонки, из профиля `yc` с правами на базу:
//   YDB_ACCESS_TOKEN_CREDENTIALS="$(yc --profile team-tasks iam create-token)" \
//   YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135 YDB_DATABASE=/ru-central1/... \
//   node scripts/init-db.js
// Токен в переменную окружения, на экран не выводится.

const {
  Driver, getCredentialsFromEnv, Types, Column, TableDescription, TableIndex, AlterTableDescription,
} = require('ydb-sdk');

const U = () => Types.optional(Types.UTF8);

const TABLES = {
  tasks: new TableDescription()
    .withColumns(
      new Column('id', U()), new Column('product', U()), new Column('number', Types.optional(Types.UINT32)),
      new Column('title', U()), new Column('description', U()), new Column('author', U()),
      new Column('assignees', U()), new Column('related_products', U()), new Column('status', U()),
      new Column('waiting_on', U()), new Column('links', U()), new Column('created_at', U()), new Column('updated_at', U()),
    )
    .withPrimaryKey('id'),
  events: new TableDescription()
    .withColumns(
      new Column('at', U()), new Column('event_id', U()), new Column('task_id', U()), new Column('by_login', U()),
      new Column('field', U()), new Column('from_value', U()), new Column('to_value', U()), new Column('note', U()),
      // ADR-047: логин хозяина машины, если правку сделал AI-инженер.
      new Column('via', U()),
    )
    .withPrimaryKeys('at', 'event_id')
    .withIndex(new TableIndex('idx_task').withIndexColumns('task_id').withGlobalAsync(false)),
  counters: new TableDescription()
    .withColumns(new Column('product', U()), new Column('last', Types.optional(Types.UINT32)))
    .withPrimaryKey('product'),
  keys: new TableDescription()
    .withColumns(
      new Column('hash', U()), new Column('kind', U()), new Column('login', U()), new Column('name', U()),
      new Column('created_at', U()), new Column('revoked_at', U()),
    )
    .withPrimaryKey('hash'),
};

async function main() {
  const driver = new Driver({
    endpoint: process.env.YDB_ENDPOINT,
    database: process.env.YDB_DATABASE,
    authService: getCredentialsFromEnv(),
  });
  if (!(await driver.ready(15_000))) throw new Error('YDB: driver is not ready');
  const prefix = process.env.TABLE_PREFIX ? `${process.env.TABLE_PREFIX}/` : '';
  await driver.tableClient.withSession(async (session) => {
    for (const [base, desc] of Object.entries(TABLES)) {
      const name = prefix + base;
      let existing;
      try {
        existing = await session.describeTable(name);
      } catch {
        await session.createTable(name, desc);
        console.log(`${name}: создана`);
        continue;
      }
      const have = new Set(existing.columns.map((c) => c.name));
      const missing = desc.columns.filter((c) => !have.has(c.name));
      if (!missing.length) {
        console.log(`${name}: уже есть`);
        continue;
      }
      const alter = new AlterTableDescription();
      for (const c of missing) alter.withAddColumn(c);
      await session.alterTable(name, alter);
      console.log(`${name}: добавлены колонки ${missing.map((c) => c.name).join(', ')}`);
    }
  });
  await driver.destroy();
}

// Удалить тестовые таблицы: DROP=1 TABLE_PREFIX=test node scripts/init-db.js
async function drop() {
  const driver = new Driver({ endpoint: process.env.YDB_ENDPOINT, database: process.env.YDB_DATABASE, authService: getCredentialsFromEnv() });
  if (!(await driver.ready(15_000))) throw new Error('YDB: driver is not ready');
  if (!process.env.TABLE_PREFIX) throw new Error('DROP только с TABLE_PREFIX');
  await driver.tableClient.withSession(async (session) => {
    for (const base of Object.keys(TABLES)) {
      await session.dropTable(`${process.env.TABLE_PREFIX}/${base}`);
      console.log(`${process.env.TABLE_PREFIX}/${base}: удалена`);
    }
  });
  await driver.destroy();
}

(process.env.DROP === '1' ? drop() : main()).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
