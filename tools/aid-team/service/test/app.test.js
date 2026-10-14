'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createMemoryStore } = require('../src/memory-store');
const { parseOwners } = require('../src/sources');
const { hashKey } = require('../src/keys');

const PEPPER = 'x'.repeat(64);
const OWNERS = parseOwners({
  people: [
    { github: 'pd-login', decides: ['system'] },
    { github: 'eng-a', decides: [] },
    { github: 'eng-b', decides: [] },
  ],
});

function setup() {
  const store = createMemoryStore();
  let t = 0;
  const app = createApp({
    store,
    owners: async () => OWNERS,
    names: async () => ({ 'eng-a': { displayName: 'Аня А.' } }),
    githubLogin: async (token) => ({ 'tok-a': 'eng-a', 'tok-x': 'stranger', 'tok-pd': 'pd-login', 'tok-b': 'eng-b' })[token] || null,
    pepper: () => PEPPER,
    now: () => new Date(Date.UTC(2026, 9, 14, 10, 0, t++)).toISOString(),
  });
  const call = (method, path, { key, body, headers = {} } = {}) => app(new Request(`https://team.aidteam.pro${path}`, {
    method,
    headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  }));
  const keyFor = async (token) => (await (await call('POST', '/v1/keys', { body: { githubToken: token } })).json()).key;
  return { store, call, keyFor };
}

test('ключ выдаётся только логину из owners.json и хранится хэшем', async () => {
  const { store, call, keyFor } = setup();
  const key = await keyFor('tok-a');
  assert.match(key, /^aidt_/);
  assert.ok(await store.findKey(hashKey(PEPPER, key)));
  assert.equal(await store.findKey(key), null);
  assert.equal((await call('POST', '/v1/keys', { body: { githubToken: 'tok-x' } })).status, 403);
  assert.equal((await call('POST', '/v1/keys', { body: { githubToken: 'bad' } })).status, 401);
  const me = await (await call('GET', '/v1/me', { key })).json();
  assert.deepEqual(me, { kind: 'personal', login: 'eng-a', name: null });
});

test('писать — только с личным ключом; читать — открыто', async () => {
  const { call, keyFor } = setup();
  const body = { product: 'team', title: 'Сделать', assignees: ['eng-b'] };
  assert.equal((await call('POST', '/v1/tasks', { body })).status, 401);
  const key = await keyFor('tok-a');
  const res = await call('POST', '/v1/tasks', { key, body });
  assert.equal(res.status, 201);
  const { task } = await res.json();
  assert.equal(task.id, 'team-1');
  assert.equal(task.author, 'eng-a');
  assert.equal(task.status, 'new');
  const list = await (await call('GET', '/v1/tasks')).json();
  assert.equal(list.tasks.length, 1);
  assert.equal(list.people, undefined, 'без ключа — без имён');
});

test('номер свой у каждого продукта', async () => {
  const { call, keyFor } = setup();
  const key = await keyFor('tok-a');
  const mk = async (product) => (await (await call('POST', '/v1/tasks', { key, body: { product, title: 't', assignees: ['eng-a'] } })).json()).task.id;
  assert.equal(await mk('team'), 'team-1');
  assert.equal(await mk('hub'), 'hub-1');
  assert.equal(await mk('team'), 'team-2');
});

test('исполнитель — только из owners.json, продукт — из списка', async () => {
  const { call, keyFor } = setup();
  const key = await keyFor('tok-a');
  assert.equal((await call('POST', '/v1/tasks', { key, body: { product: 'team', title: 't', assignees: ['stranger'] } })).status, 400);
  assert.equal((await call('POST', '/v1/tasks', { key, body: { product: 'nope', title: 't', assignees: ['eng-a'] } })).status, 400);
  assert.equal((await call('POST', '/v1/tasks', { key, body: { product: 'team', title: '', assignees: ['eng-a'] } })).status, 400);
});

test('права на правку и отмену; история по полям', async () => {
  const { call, keyFor } = setup();
  const a = await keyFor('tok-a');
  const b = await keyFor('tok-b');
  const pd = await keyFor('tok-pd');
  await call('POST', '/v1/tasks', { key: a, body: { product: 'team', title: 't', assignees: ['eng-b'] } });

  // исполнитель берёт в работу
  let r = await call('PATCH', '/v1/tasks/team-1', { key: b, body: { status: 'in_progress' } });
  assert.equal(r.status, 200);
  // ждёт без waitingOn — нельзя
  r = await call('PATCH', '/v1/tasks/team-1', { key: b, body: { status: 'waiting' } });
  assert.equal(r.status, 400);
  r = await call('PATCH', '/v1/tasks/team-1', { key: b, body: { status: 'waiting', waitingOn: 'pd', note: 'нужно решение' } });
  assert.equal(r.status, 200);
  // исполнитель не может отменить
  r = await call('PATCH', '/v1/tasks/team-1', { key: b, body: { status: 'cancelled' } });
  assert.equal(r.status, 403);
  // PD передаёт задачу
  r = await call('PATCH', '/v1/tasks/team-1', { key: pd, body: { assignees: ['eng-a'], status: 'in_progress' } });
  const t = (await r.json()).task;
  assert.deepEqual(t.assignees, ['eng-a']);
  assert.equal(t.waitingOn, null, 'выход из «ждёт» снимает waitingOn');

  const one = await (await call('GET', '/v1/tasks/team-1')).json();
  const fields = one.task.history.map((h) => h.field);
  assert.deepEqual(fields, ['created', 'status', 'status', 'waitingOn', 'status', 'waitingOn', 'assignees']);
  assert.equal(one.task.history[2].note, 'нужно решение');
  assert.equal(one.task.history[2].by, 'eng-b');
});

test('чужой человек не правит задачу', async () => {
  const { call, keyFor } = setup();
  const a = await keyFor('tok-a');
  const b = await keyFor('tok-b');
  await call('POST', '/v1/tasks', { key: a, body: { product: 'team', title: 't', assignees: ['eng-a'] } });
  assert.equal((await call('PATCH', '/v1/tasks/team-1', { key: b, body: { title: 'x' } })).status, 403);
});

test('ETag: повтор с If-None-Match — 304', async () => {
  const { call } = setup();
  const r1 = await call('GET', '/v1/tasks');
  const etag = r1.headers.get('etag');
  assert.ok(etag);
  const r2 = await call('GET', '/v1/tasks', { headers: { 'If-None-Match': etag } });
  assert.equal(r2.status, 304);
});

test('лента событий с курсором', async () => {
  const { call, keyFor } = setup();
  const a = await keyFor('tok-a');
  await call('POST', '/v1/tasks', { key: a, body: { product: 'team', title: 't', assignees: ['eng-b'] } });
  await call('PATCH', '/v1/tasks/team-1', { key: a, body: { title: 't2' } });
  const p1 = await (await call('GET', '/v1/events?limit=1')).json();
  assert.equal(p1.events.length, 1);
  assert.equal(p1.events[0].field, 'created');
  const p2 = await (await call('GET', `/v1/events?after=${encodeURIComponent(p1.nextCursor)}`)).json();
  assert.equal(p2.events.length, 1);
  assert.equal(p2.events[0].field, 'title');
});

test('отзыв ключа', async () => {
  const { call, keyFor } = setup();
  const a = await keyFor('tok-a');
  assert.equal((await call('DELETE', '/v1/keys/current', { key: a })).status, 200);
  assert.equal((await call('GET', '/v1/me', { key: a })).status, 401);
});

test('сервисный ключ получает имена, личный — нет', async () => {
  const { store, call } = setup();
  const { generateKey } = require('../src/keys');
  const svc = generateKey('service');
  await store.saveKey({ hash: hashKey(PEPPER, svc), kind: 'service', login: null, name: 'presentbook', createdAt: 'x' });
  const body = await (await call('GET', '/v1/tasks', { key: svc })).json();
  assert.deepEqual(body.people, { 'eng-a': { displayName: 'Аня А.' } });
  assert.equal((await call('POST', '/v1/tasks', { key: svc, body: { product: 'team', title: 't', assignees: ['eng-a'] } })).status, 403);
});

test('неизвестный адрес — 404 JSON', async () => {
  const { call } = setup();
  const r = await call('GET', '/v2/nope');
  assert.equal(r.status, 404);
  assert.equal((await r.json()).error, 'not_found');
});
