'use strict';

// Проверка на настоящей YDB, в отдельной папке таблиц (TABLE_PREFIX):
//   TABLE_PREFIX=test node scripts/init-db.js
//   TABLE_PREFIX=test node --test test/ydb.int.js
//   DROP=1 TABLE_PREFIX=test node scripts/init-db.js
// Переменные YDB_* — как в scripts/init-db.js. Рабочие таблицы не трогает.

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createYdbStore } = require('../src/ydb-store');
const { parseOwners } = require('../src/sources');

const prefix = process.env.TABLE_PREFIX;
if (!prefix) throw new Error('нужен TABLE_PREFIX — рабочие таблицы этой проверкой не трогаются');

const store = createYdbStore({ endpoint: process.env.YDB_ENDPOINT, database: process.env.YDB_DATABASE, prefix });
const OWNERS = parseOwners({
  people: [{ github: 'pd-login', decides: ['system'] }, { github: 'eng-a' }, { github: 'eng-b' }],
  agents: [{ id: 'ai-team', kind: 'ai', curator: 'pd-login' }],
});
const app = createApp({
  store,
  owners: async () => OWNERS,
  names: async () => ({}),
  githubLogin: async (t) => ({ 'tok-a': 'eng-a', 'tok-b': 'eng-b', 'tok-pd': 'pd-login' })[t] || null,
  pepper: () => 'p'.repeat(64),
});
const call = async (method, path, key, body) => app(new Request(`https://x${path}`, {
  method,
  headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
  body: body ? JSON.stringify(body) : undefined,
}));
const keyFor = async (t, agent) => (await (await call('POST', '/v1/keys', null, agent ? { githubToken: t, agent } : { githubToken: t })).json()).key;

test.after(() => store.driver.destroy());

test('полный цикл на YDB', async () => {
  const a = await keyFor('tok-a');
  const b = await keyFor('tok-b');
  const pd = await keyFor('tok-pd');
  assert.match(a, /^aidt_/);

  const mk = async (product, title) => {
    const r = await call('POST', '/v1/tasks', a, { product, title, assignees: ['eng-b'], links: [{ type: 'pr', url: 'https://github.com/RickOBrian/aid/pull/1' }] });
    assert.equal(r.status, 201, await r.clone().text());
    return (await r.json()).task;
  };
  const t1 = await mk('team', 'Первая');
  const t2 = await mk('team', 'Вторая');
  const h1 = await mk('hub', 'Хаб');
  assert.equal(t1.id, 'team-1');
  assert.equal(t2.id, 'team-2');
  assert.equal(h1.id, 'hub-1');

  let r = await call('PATCH', '/v1/tasks/team-1', b, { status: 'waiting', waitingOn: 'pd', note: 'нужно решение' });
  assert.equal(r.status, 200, await r.clone().text());
  r = await call('PATCH', '/v1/tasks/team-1', b, { status: 'cancelled' });
  assert.equal(r.status, 403);
  r = await call('PATCH', '/v1/tasks/team-1', pd, { status: 'in_progress', assignees: ['eng-a'] });
  assert.equal(r.status, 200, await r.clone().text());

  const one = await (await call('GET', '/v1/tasks/team-1')).json();
  assert.equal(one.task.status, 'in_progress');
  assert.equal(one.task.waitingOn, null);
  assert.deepEqual(one.task.assignees, ['eng-a']);
  assert.deepEqual(one.task.history.map((h) => h.field), ['created', 'status', 'waitingOn', 'status', 'waitingOn', 'assignees']);
  assert.equal(one.task.links[0].type, 'pr');

  const list = await (await call('GET', '/v1/tasks?product=team&include=history')).json();
  assert.equal(list.tasks.length, 2);
  assert.ok(list.tasks[0].history.length >= 1);
  const mine = await (await call('GET', '/v1/tasks?assignee=eng-b')).json();
  assert.deepEqual(mine.tasks.map((t) => t.id).sort(), ['hub-1', 'team-2']);

  const ev1 = await (await call('GET', '/v1/events?limit=2')).json();
  assert.equal(ev1.events.length, 2);
  const ev2 = await (await call('GET', `/v1/events?after=${encodeURIComponent(ev1.nextCursor)}&limit=500`)).json();
  assert.equal(ev2.events.length, 6, "3 создания + 2 поля первой правки + 3 поля третьей − 2 на первой странице");
  const bad = ev2.events.filter((e) => `${e.at}|${e.id}` <= ev1.nextCursor);
  assert.deepEqual(bad.map((e) => `${e.at}|${e.id}|${e.field}`), [], `cursor ${ev1.nextCursor}`);

  // конфликт: правка по устаревшей версии задачи
  const stale = await store.getTask('team-2');
  await store.updateTask(stale, { title: 'Свежая' }, [{ taskId: 'team-2', at: new Date().toISOString(), by: 'eng-a', field: 'title', from: 'Вторая', to: 'Свежая', note: null }], new Date().toISOString());
  await assert.rejects(
    store.updateTask(stale, { title: 'Устаревшая' }, [], new Date().toISOString()),
    (e) => e.status === 409,
  );

  // AI-инженер (ADR-047): ключ выдаёт хозяин машины, в истории — by и via
  const ai = await keyFor('tok-b', 'ai-team');
  assert.match(ai, /^aida_/);
  assert.equal((await (await call('GET', '/v1/me', ai)).json()).agent, 'ai-team');
  r = await call('POST', '/v1/tasks', ai, { product: 'hub', title: 'От AI', assignees: ['eng-a'] });
  assert.equal(r.status, 201, await r.clone().text());
  const aiTask = (await r.json()).task;
  assert.equal(aiTask.author, 'ai-team');
  r = await call('PATCH', `/v1/tasks/${aiTask.id}`, ai, { title: 'От AI, правка' });
  assert.equal(r.status, 200, await r.clone().text());
  const aiHist = (await (await call('GET', `/v1/tasks/${aiTask.id}`)).json()).task.history;
  assert.deepEqual(aiHist.map((h) => [h.field, h.by, h.via]), [['created', 'ai-team', 'eng-b'], ['title', 'ai-team', 'eng-b']]);

  assert.equal((await call('DELETE', '/v1/keys/current', a)).status, 200);
  assert.equal((await call('GET', '/v1/me', a)).status, 401);
});
