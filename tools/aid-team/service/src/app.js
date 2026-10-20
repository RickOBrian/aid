'use strict';

// Маршруты API v1 (SERVICE.md). Web Request → Response; хранилище и
// внешние источники передаются снаружи — так маршруты проверяются тестами
// без базы и сети.

const crypto = require('node:crypto');
const {
  ApiError, parseId, validateCreate, validatePatch, checkCanEdit, diffEvents,
  createdEvent, presentTask, STATUSES, PRODUCTS,
} = require('./model');
const { generateKey, hashKey, bearer } = require('./keys');

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function errorResponse(e) {
  if (e instanceof ApiError) return json(e.status, { error: e.code, message: e.message });
  console.error(e);
  return json(500, { error: 'internal', message: 'внутренняя ошибка' });
}

/** GET с ETag: одинаковое тело → 304 без тела. */
function cachedJson(request, body) {
  const text = JSON.stringify(body);
  const etag = `"${crypto.createHash('sha1').update(text).digest('hex')}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }
  return new Response(text, {
    status: 200,
    headers: { ...JSON_HEADERS, ETag: etag, 'Cache-Control': 'no-cache' },
  });
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, 'bad_request', 'тело — не JSON');
  }
}

function intParam(url, name, def, max) {
  const raw = url.searchParams.get(name);
  if (raw === null) return def;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new ApiError(400, 'bad_request', `${name}: целое > 0`);
  return Math.min(n, max);
}

function createApp(deps) {
  const { store, owners, names, githubLogin, pepper, now = () => new Date().toISOString() } = deps;

  /**
   * Кто пришёл: null — без ключа; иначе { kind, login, name, hash }.
   * personal — login человека; agent — name = id AI-инженера, login —
   * хозяин машины, оба должны оставаться в owners.json.
   */
  async function caller(request) {
    const key = bearer(request.headers);
    if (!key) return null;
    const found = await store.findKey(hashKey(pepper(), key));
    if (!found || found.revokedAt) throw new ApiError(401, 'unauthorized', 'ключ неверный или отозван');
    if (found.kind === 'personal' || found.kind === 'agent') {
      const o = await owners();
      if (!o.logins.has(found.login.toLowerCase())) {
        throw new ApiError(403, 'forbidden', 'логина нет в owners.json');
      }
      if (found.kind === 'agent' && !o.agents.has(found.name)) {
        throw new ApiError(403, 'forbidden', `AI-инженера ${found.name} нет в owners.json`);
      }
    }
    return { ...found, hash: hashKey(pepper(), key) };
  }

  /** Автор правки: человек — сам; AI-инженер — by: id, via: хозяин машины. */
  async function writer(request) {
    const who = await caller(request);
    if (!who) throw new ApiError(401, 'unauthorized', 'нужен личный ключ: /team-key');
    if (who.kind === 'personal') return { by: who.login, via: null };
    if (who.kind === 'agent') return { by: who.name, via: who.login };
    throw new ApiError(403, 'forbidden', 'писать можно только личным ключом или ключом AI-инженера');
  }

  async function listTasks(request, url) {
    const who = await caller(request);
    const status = url.searchParams.get('status');
    const product = url.searchParams.get('product');
    if (status && !STATUSES.includes(status)) throw new ApiError(400, 'bad_request', 'status: неизвестный');
    if (product && !PRODUCTS.includes(product)) throw new ApiError(400, 'bad_request', 'product: неизвестный');
    const page = await store.listTasks({
      status,
      product,
      assignee: url.searchParams.get('assignee'),
      curator: url.searchParams.get('curator'),
      updatedSince: url.searchParams.get('updatedSince'),
      limit: intParam(url, 'limit', 200, 500),
      cursor: url.searchParams.get('cursor'),
    });
    const withHistory = (url.searchParams.get('include') || '').split(',').includes('history');
    const history = withHistory ? await store.historyFor(page.tasks.map((t) => t.id)) : null;
    const body = {
      tasks: page.tasks.map((t) => presentTask(t, history ? history[t.id] || [] : null)),
      nextCursor: page.nextCursor || null,
    };
    if (who && who.kind === 'service') body.people = await names();
    return cachedJson(request, body);
  }

  async function getTask(request, id) {
    if (!parseId(id)) throw new ApiError(404, 'not_found', 'нет такой задачи');
    const task = await store.getTask(id);
    if (!task) throw new ApiError(404, 'not_found', 'нет такой задачи');
    const history = await store.historyFor([id]);
    const who = await caller(request);
    const body = { task: presentTask(task, history[id] || []) };
    if (who && who.kind === 'service') body.people = await names();
    return cachedJson(request, body);
  }

  async function createTask(request) {
    const { by, via } = await writer(request);
    const fields = validateCreate(await readJson(request), await owners());
    const at = now();
    const task = await store.createTask(fields, by, at, (t) => createdEvent(t, by, at, via));
    return json(201, { task: presentTask(task, null) });
  }

  async function patchTask(request, id) {
    const { by, via } = await writer(request);
    if (!parseId(id)) throw new ApiError(404, 'not_found', 'нет такой задачи');
    const task = await store.getTask(id);
    if (!task) throw new ApiError(404, 'not_found', 'нет такой задачи');
    const o = await owners();
    const { changed, note } = validatePatch(await readJson(request), task, o);
    if (!Object.keys(changed).length) return json(200, { task: presentTask(task, null), changed: [] });
    checkCanEdit(by, task, changed, o);
    const at = now();
    const updated = await store.updateTask(task, changed, diffEvents(task, changed, by, at, note, via), at);
    return json(200, { task: presentTask(updated, null), changed: Object.keys(changed) });
  }

  async function listEvents(request, url) {
    const page = await store.listEvents(url.searchParams.get('after'), intParam(url, 'limit', 100, 500));
    return json(200, page);
  }

  /**
   * POST /v1/keys: { githubToken } — личный ключ; { githubToken, agent } —
   * ключ AI-инженера agent на машине этого человека (ADR-047). Выдаёт
   * только человек из owners.json, agent — из agents[] там же.
   */
  async function issueKey(request) {
    const body = await readJson(request);
    const token = body && body.githubToken;
    if (!token || typeof token !== 'string') throw new ApiError(400, 'bad_request', 'githubToken: обязательно');
    const agent = body.agent === undefined || body.agent === null ? null : String(body.agent);
    const o = await owners();
    if (agent !== null && !o.agents.has(agent)) {
      throw new ApiError(400, 'bad_request', `agent: AI-инженера ${agent} нет в owners.json`);
    }
    const login = await githubLogin(token);
    if (!login) throw new ApiError(401, 'unauthorized', 'GitHub не узнал токен');
    if (!o.logins.has(login.toLowerCase())) {
      throw new ApiError(403, 'forbidden', `логина ${login} нет в owners.json — ключ не выдаётся`);
    }
    const kind = agent ? 'agent' : 'personal';
    const key = generateKey(kind);
    await store.saveKey({ hash: hashKey(pepper(), key), kind, login, name: agent, createdAt: now() });
    const out = agent ? { key, login, agent } : { key, login };
    return json(201, out, { 'Cache-Control': 'no-store' });
  }

  async function revokeKey(request) {
    const who = await caller(request);
    if (!who) throw new ApiError(401, 'unauthorized', 'нужен ключ');
    await store.revokeKey(who.hash, now());
    return json(200, { revoked: true });
  }

  async function me(request) {
    const who = await caller(request);
    if (!who) throw new ApiError(401, 'unauthorized', 'нужен ключ');
    const out = { kind: who.kind, login: who.login || null, name: who.name || null };
    if (who.kind === 'agent') out.agent = who.name;
    return json(200, out);
  }

  return async function handle(request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, '');
      const m = /^\/v1\/tasks\/([^/]+)$/.exec(path);
      const method = request.method;
      if (method === 'GET' && path === '/v1/health') return json(200, { ok: true });
      if (method === 'GET' && path === '/v1/tasks') return await listTasks(request, url);
      if (method === 'POST' && path === '/v1/tasks') return await createTask(request);
      if (method === 'GET' && m) return await getTask(request, decodeURIComponent(m[1]));
      if (method === 'PATCH' && m) return await patchTask(request, decodeURIComponent(m[1]));
      if (method === 'GET' && path === '/v1/events') return await listEvents(request, url);
      if (method === 'POST' && path === '/v1/keys') return await issueKey(request);
      if (method === 'DELETE' && path === '/v1/keys/current') return await revokeKey(request);
      if (method === 'GET' && path === '/v1/me') return await me(request);
      throw new ApiError(404, 'not_found', 'нет такого адреса');
    } catch (e) {
      return errorResponse(e);
    }
  };
}

module.exports = { createApp };
