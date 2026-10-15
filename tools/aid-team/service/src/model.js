'use strict';

// Модель задачи — docs/hub/ORCHESTRATION.md §10, ADR-046. Чистые функции:
// проверка ввода, права, события изменений, вид задачи в ответе API.

const PRODUCTS = [
  'hub', 'standards', 'presentbook', 'token-comparator', 'style-migration',
  'mcp', 'bot-request', 'team', 'library-updater', 'components-swapper',
];

const STATUSES = ['new', 'in_progress', 'waiting', 'review', 'done', 'cancelled'];
const LINK_TYPES = ['pr', 'issue', 'other'];
const ID_RE = /^([a-z][a-z-]*[a-z])-(\d+)$/;

const LIMITS = { title: 200, description: 20000, links: 20, assignees: 10 };

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const bad = (message) => new ApiError(400, 'bad_request', message);

function parseId(id) {
  const m = ID_RE.exec(String(id || ''));
  if (!m || !PRODUCTS.includes(m[1])) return null;
  return { product: m[1], number: Number(m[2]) };
}

const isAgentId = (v) => /^ai-/.test(v);

/**
 * Исполнители: логины людей и id AI-инженеров (ADR-047) из owners.json.
 * Логины — как ввели; id AI — нижним регистром, как в agents[].
 */
function members(value, field, owners) {
  if (!Array.isArray(value)) throw bad(`${field}: нужен массив логинов или id AI-инженеров`);
  const out = [...new Set(value.map((v) => String(v).trim().replace(/^@/, '')))];
  for (const m of out) {
    if (isAgentId(m.toLowerCase())) {
      if (!owners.agents.has(m.toLowerCase())) throw bad(`${field}: AI-инженера ${m} нет в owners.json`);
    } else if (!owners.logins.has(m.toLowerCase())) {
      throw bad(`${field}: логина ${m} нет в owners.json`);
    }
  }
  return out.map((m) => (isAgentId(m.toLowerCase()) ? m.toLowerCase() : m));
}

function login(value, field, logins) {
  if (value === null || value === undefined || value === '') return null;
  const v = String(value).trim().replace(/^@/, '');
  if (!logins.has(v.toLowerCase())) throw bad(`${field}: логина ${v} нет в owners.json — нужен человек`);
  return v;
}

/**
 * Куратор задачи (ADR-047, ORCHESTRATION.md §11): человек, без «да»
 * которого задачу с AI-исполнителем не мержат. Обязателен, если среди
 * исполнителей есть AI; не указан — берётся agents[].curator первого AI.
 */
function resolveCurator(curator, assignees, owners, explicit) {
  const ais = assignees.filter(isAgentId);
  if (curator || !ais.length) return curator;
  if (!explicit) {
    for (const id of ais) {
      const c = owners.agents.get(id).curator;
      if (c && owners.logins.has(c.toLowerCase())) return c;
    }
  }
  throw bad(`curator: обязателен, если среди исполнителей есть AI-инженер (${ais.join(', ')})`);
}

function products(value, field) {
  if (!Array.isArray(value)) throw bad(`${field}: нужен массив кодов продуктов`);
  const out = [...new Set(value.map(String))];
  for (const p of out) if (!PRODUCTS.includes(p)) throw bad(`${field}: неизвестный продукт ${p}`);
  return out;
}

function links(value) {
  if (!Array.isArray(value)) throw bad('links: нужен массив');
  if (value.length > LIMITS.links) throw bad(`links: не больше ${LIMITS.links}`);
  return value.map((l) => {
    const type = LINK_TYPES.includes(l && l.type) ? l.type : 'other';
    let url;
    try {
      url = new URL(String(l && l.url));
    } catch {
      throw bad('links: неверный url');
    }
    if (url.protocol !== 'https:') throw bad('links: только https');
    const link = { type, url: url.toString() };
    if (l.title) link.title = String(l.title).slice(0, LIMITS.title);
    return link;
  });
}

function text(value, field, max, required) {
  if (value === undefined || value === null) {
    if (required) throw bad(`${field}: обязательно`);
    return undefined;
  }
  const s = String(value).trim();
  if (required && !s) throw bad(`${field}: обязательно`);
  if (s.length > max) throw bad(`${field}: не длиннее ${max} символов`);
  return s;
}

function waitingOn(value, logins) {
  if (value === null || value === undefined || value === '') return null;
  const v = String(value).trim().replace(/^@/, '');
  if (v === 'pd') return 'pd';
  if (!logins.has(v.toLowerCase())) throw bad(`waitingOn: логина ${v} нет в owners.json`);
  return v;
}

/** Ввод POST /v1/tasks → поля новой задачи (без id и номера). */
function validateCreate(body, owners) {
  if (!body || typeof body !== 'object') throw bad('нужно тело JSON');
  const product = String(body.product || '');
  if (!PRODUCTS.includes(product)) throw bad(`product: один из ${PRODUCTS.join(', ')}`);
  const assignees = members(body.assignees || [], 'assignees', owners);
  if (assignees.length < 1) throw bad('assignees: нужен хотя бы один исполнитель');
  if (assignees.length > LIMITS.assignees) throw bad(`assignees: не больше ${LIMITS.assignees}`);
  const curator = resolveCurator(login(body.curator, 'curator', owners.logins), assignees, owners, false);
  return {
    product,
    title: text(body.title, 'title', LIMITS.title, true),
    description: text(body.description, 'description', LIMITS.description, false) || '',
    assignees,
    relatedProducts: products(body.relatedProducts || [], 'relatedProducts').filter((p) => p !== product),
    links: links(body.links || []),
    curator,
  };
}

const PATCHABLE = ['title', 'description', 'status', 'waitingOn', 'assignees', 'curator', 'relatedProducts', 'links'];

/** Ввод PATCH /v1/tasks/{id} → только изменённые поля. */
function validatePatch(body, task, owners) {
  if (!body || typeof body !== 'object') throw bad('нужно тело JSON');
  const unknown = Object.keys(body).filter((k) => !PATCHABLE.includes(k) && k !== 'note');
  if (unknown.length) throw bad(`нельзя менять: ${unknown.join(', ')}`);
  const next = {};
  if ('title' in body) next.title = text(body.title, 'title', LIMITS.title, true);
  if ('description' in body) next.description = text(body.description, 'description', LIMITS.description, false) || '';
  if ('status' in body) {
    if (!STATUSES.includes(body.status)) throw bad(`status: один из ${STATUSES.join(', ')}`);
    next.status = body.status;
  }
  if ('waitingOn' in body) next.waitingOn = waitingOn(body.waitingOn, owners.logins);
  if ('assignees' in body) {
    next.assignees = members(body.assignees, 'assignees', owners);
    if (next.assignees.length < 1) throw bad('assignees: нужен хотя бы один исполнитель');
    if (next.assignees.length > LIMITS.assignees) throw bad(`assignees: не больше ${LIMITS.assignees}`);
  }
  if ('curator' in body) next.curator = login(body.curator, 'curator', owners.logins);
  if ('assignees' in next || 'curator' in next) {
    // Снять куратора явно, пока среди исполнителей есть AI, нельзя;
    // AI добавили без куратора — куратор по умолчанию из owners.json.
    const cur = 'curator' in next ? next.curator : task.curator || null;
    const resolved = resolveCurator(cur, next.assignees || task.assignees, owners, 'curator' in next);
    if (resolved !== (task.curator || null)) next.curator = resolved;
  }
  if ('relatedProducts' in body) {
    next.relatedProducts = products(body.relatedProducts, 'relatedProducts').filter((p) => p !== task.product);
  }
  if ('links' in body) next.links = links(body.links);

  const status = next.status || task.status;
  const waiting = 'waitingOn' in next ? next.waitingOn : task.waitingOn;
  if (status === 'waiting' && !waiting) throw bad('status waiting: укажи waitingOn — логин или "pd"');
  if (status !== 'waiting' && 'status' in next && !('waitingOn' in next)) next.waitingOn = null;

  const changed = {};
  for (const [k, v] of Object.entries(next)) {
    if (JSON.stringify(v) !== JSON.stringify(task[k])) changed[k] = v;
  }
  const note = text(body.note, 'note', 1000, false);
  return { changed, note };
}

/**
 * Кто может менять задачу: автор, исполнители, куратор, PD (decides: system).
 * Отменить — только автор или PD.
 */
function checkCanEdit(by, task, changed, owners) {
  const l = by.toLowerCase();
  const isPd = owners.pd.has(l);
  const isAuthor = task.author.toLowerCase() === l;
  const isAssignee = task.assignees.some((a) => a.toLowerCase() === l);
  const isCurator = !!task.curator && task.curator.toLowerCase() === l;
  if (!isPd && !isAuthor && !isAssignee && !isCurator) {
    throw new ApiError(403, 'forbidden', 'менять задачу могут автор, исполнители, куратор и PD');
  }
  if (changed.status === 'cancelled' && !isPd && !isAuthor) {
    throw new ApiError(403, 'forbidden', 'отменить задачу могут автор и PD');
  }
}

/**
 * События изменения: одно на поле, from/to — значения до и после.
 * by — кто правит (логин или id AI-инженера), via — логин хозяина машины,
 * если правит AI-инженер (ADR-047), иначе null.
 */
function diffEvents(task, changed, by, at, note, via = null) {
  const ordered = PATCHABLE.filter((f) => f in changed).map((f) => [f, changed[f]]);
  return ordered.map(([field, to], i) => ({
    taskId: task.id,
    at,
    by,
    field,
    from: task[field] === undefined ? null : task[field],
    to,
    note: i === 0 && note ? note : null,
    via,
  }));
}

function createdEvent(task, by, at, via = null) {
  return { taskId: task.id, at, by, field: 'created', from: null, to: task.status, note: null, via };
}

/** Задача в ответе API — контракт с Presentbook (SERVICE.md). */
function presentTask(task, history) {
  const out = {
    id: task.id,
    product: task.product,
    number: task.number,
    title: task.title,
    description: task.description,
    author: task.author,
    assignees: task.assignees,
    curator: task.curator || null,
    relatedProducts: task.relatedProducts,
    status: task.status,
    waitingOn: task.waitingOn || null,
    links: task.links,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
  if (history) {
    out.history = history.map((e) => {
      const h = { at: e.at, by: e.by, field: e.field, from: e.from, to: e.to };
      if (e.via) h.via = e.via;
      if (e.note) h.note = e.note;
      return h;
    });
  }
  return out;
}

module.exports = {
  PRODUCTS, STATUSES, LIMITS, ApiError, parseId, validateCreate, validatePatch,
  checkCanEdit, diffEvents, createdEvent, presentTask,
};
