'use strict';

// Хранилище задач в YDB serverless (SERVICE.md). Время — строки ISO 8601
// в UTC: сортируются как текст, без часовых поясов и микросекунд.
// Номер задачи выдаётся в той же транзакции, что и запись задачи.

const crypto = require('node:crypto');
const { Driver, getCredentialsFromEnv, TypedValues, Types } = require('ydb-sdk');

const TX_RW = { beginTx: { serializableReadWrite: {} }, commitTx: true };
const TX_RO = { beginTx: { onlineReadOnly: {} }, commitTx: true };

/** Значение ячейки protobuf → JS: строка, число или null. */
function cell(item) {
  const k = item && item.value;
  if (!k || k === 'nullFlagValue') return null;
  const v = item[k];
  if (v && typeof v === 'object' && typeof v.toNumber === 'function') return v.toNumber();
  return v;
}

function rows(resultSet) {
  if (!resultSet) return [];
  const cols = resultSet.columns.map((c) => c.name);
  return resultSet.rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, cell(r.items[i])])));
}

const optUtf8 = (v) => (v === null || v === undefined ? TypedValues.optionalNull(Types.UTF8) : TypedValues.optional(TypedValues.utf8(v)));

function taskFromRow(r) {
  return {
    id: r.id,
    product: r.product,
    number: r.number,
    title: r.title,
    description: r.description || '',
    author: r.author,
    assignees: JSON.parse(r.assignees || '[]'),
    relatedProducts: JSON.parse(r.related_products || '[]'),
    status: r.status,
    waitingOn: r.waiting_on || null,
    links: JSON.parse(r.links || '[]'),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function eventFromRow(r) {
  return {
    id: r.event_id,
    taskId: r.task_id,
    at: r.at,
    by: r.by_login,
    field: r.field,
    from: r.from_value === null ? null : JSON.parse(r.from_value),
    to: r.to_value === null ? null : JSON.parse(r.to_value),
    note: r.note || null,
    via: r.via || null,
  };
}

const TASK_COLUMNS = 'id, product, number, title, description, author, assignees, related_products, status, waiting_on, links, created_at, updated_at';
const EVENT_COLUMNS = 'at, event_id, task_id, by_login, field, from_value, to_value, note, via';

function eventParams(e, prefix, seq = 0) {
  return {
    // Порядок событий одной правки: номер внутри правки, затем случайная часть.
    [`$${prefix}event_id`]: TypedValues.utf8(`${String(seq).padStart(3, '0')}-${crypto.randomUUID()}`),
    [`$${prefix}task_id`]: TypedValues.utf8(e.taskId),
    [`$${prefix}at`]: TypedValues.utf8(e.at),
    [`$${prefix}by_login`]: TypedValues.utf8(e.by),
    [`$${prefix}field`]: TypedValues.utf8(e.field),
    [`$${prefix}from_value`]: optUtf8(e.from === null || e.from === undefined ? null : JSON.stringify(e.from)),
    [`$${prefix}to_value`]: optUtf8(e.to === null || e.to === undefined ? null : JSON.stringify(e.to)),
    [`$${prefix}note`]: optUtf8(e.note || null),
    [`$${prefix}via`]: optUtf8(e.via || null),
  };
}

function eventDeclare(prefix, withTask = true) {
  return ['event_id', ...(withTask ? ['task_id'] : []), 'at', 'by_login', 'field'].map((c) => `DECLARE $${prefix}${c} AS Utf8;`)
    .concat(['from_value', 'to_value', 'note', 'via'].map((c) => `DECLARE $${prefix}${c} AS Utf8?;`)).join('\n');
}

function eventUpsert(prefix) {
  return `UPSERT INTO events (${EVENT_COLUMNS}) VALUES ($${prefix}at, $${prefix}event_id, $${prefix}task_id, $${prefix}by_login, $${prefix}field, $${prefix}from_value, $${prefix}to_value, $${prefix}note, $${prefix}via);`;
}

function createYdbStore({ endpoint, database, authService = getCredentialsFromEnv(), prefix = '' }) {
  const driver = new Driver({ endpoint, database, authService });
  // Отдельная папка таблиц — для проверок на настоящей базе, не трогая рабочие.
  const pragma = prefix ? `PRAGMA TablePathPrefix("${database}/${prefix}");\n` : '';
  let ready = null;

  async function q(query, params, tx = TX_RW) {
    if (!ready) ready = driver.ready(10_000);
    if (!(await ready)) {
      ready = null;
      throw new Error('YDB: driver is not ready');
    }
    return driver.tableClient.withSessionRetry(async (session) => {
      const res = await session.executeQuery(pragma + query, params, tx);
      return res.resultSets;
    });
  }

  async function session(fn) {
    if (!ready) ready = driver.ready(10_000);
    if (!(await ready)) {
      ready = null;
      throw new Error('YDB: driver is not ready');
    }
    return driver.tableClient.withSessionRetry(fn);
  }

  return {
    driver,

    async createTask(fields, author, at, makeEvent) {
      const draft = { ...fields, author, status: 'new', waitingOn: null, createdAt: at, updatedAt: at };
      const ev = makeEvent({ ...draft, id: '' });
      const sets = await q(`
        DECLARE $product AS Utf8; DECLARE $title AS Utf8; DECLARE $description AS Utf8;
        DECLARE $author AS Utf8; DECLARE $assignees AS Utf8; DECLARE $related AS Utf8;
        DECLARE $links AS Utf8; DECLARE $at AS Utf8;
        ${eventDeclare('e_', false)}
        $last = (SELECT last FROM counters WHERE product = $product);
        $n = COALESCE($last, 0u) + 1u;
        $id = $product || "-"u || CAST($n AS Utf8);
        UPSERT INTO counters (product, last) VALUES ($product, $n);
        UPSERT INTO tasks (${TASK_COLUMNS}) VALUES
          ($id, $product, $n, $title, $description, $author, $assignees, $related, "new"u, NULL, $links, $at, $at);
        UPSERT INTO events (${EVENT_COLUMNS}) VALUES
          ($e_at, $e_event_id, $id, $e_by_login, $e_field, $e_from_value, $e_to_value, $e_note, $e_via);
        SELECT $id AS id, $n AS number;
      `, {
        $product: TypedValues.utf8(fields.product),
        $title: TypedValues.utf8(fields.title),
        $description: TypedValues.utf8(fields.description),
        $author: TypedValues.utf8(author),
        $assignees: TypedValues.utf8(JSON.stringify(fields.assignees)),
        $related: TypedValues.utf8(JSON.stringify(fields.relatedProducts)),
        $links: TypedValues.utf8(JSON.stringify(fields.links)),
        $at: TypedValues.utf8(at),
        ...(({ $e_task_id, ...rest }) => rest)(eventParams({ ...ev, taskId: '' }, 'e_')),
      });
      const [{ id, number }] = rows(sets[0]);
      return { ...draft, id, number };
    },

    async getTask(id) {
      const sets = await q(`DECLARE $id AS Utf8; SELECT ${TASK_COLUMNS} FROM tasks WHERE id = $id;`,
        { $id: TypedValues.utf8(id) }, TX_RO);
      const [r] = rows(sets[0]);
      return r ? taskFromRow(r) : null;
    },

    async listTasks({ status, product, assignee, updatedSince, limit, cursor }) {
      // Задач — десятки и сотни: фильтр по исполнителю — в коде, остальное — в запросе.
      const where = ['id > $cursor'];
      if (status) where.push('status = $status');
      if (product) where.push('product = $product');
      if (updatedSince) where.push('updated_at >= $since');
      const sets = await q(`
        DECLARE $cursor AS Utf8; DECLARE $status AS Utf8; DECLARE $product AS Utf8; DECLARE $since AS Utf8;
        SELECT ${TASK_COLUMNS} FROM tasks WHERE ${where.join(' AND ')} ORDER BY id LIMIT 1000;
      `, {
        $cursor: TypedValues.utf8(cursor || ''),
        $status: TypedValues.utf8(status || ''),
        $product: TypedValues.utf8(product || ''),
        $since: TypedValues.utf8(updatedSince || ''),
      }, TX_RO);
      let list = rows(sets[0]).map(taskFromRow);
      if (assignee) list = list.filter((t) => t.assignees.some((a) => a.toLowerCase() === assignee.toLowerCase()));
      const page = list.slice(0, limit);
      return { tasks: page, nextCursor: list.length > limit ? page[page.length - 1].id : null };
    },

    async historyFor(ids) {
      if (!ids.length) return {};
      const sets = await q(`
        DECLARE $ids AS List<Utf8>;
        SELECT ${EVENT_COLUMNS} FROM events VIEW idx_task WHERE task_id IN $ids ORDER BY at, event_id;
      `, { $ids: TypedValues.list(Types.UTF8, ids) }, TX_RO);
      const out = {};
      for (const e of rows(sets[0]).map(eventFromRow)) (out[e.taskId] = out[e.taskId] || []).push(e);
      return out;
    },

    async updateTask(task, changed, events, at) {
      const { ApiError } = require('./model');
      const next = { ...task, ...changed, updatedAt: at };
      const declares = events.map((_, i) => eventDeclare(`e${i}_`)).join('\n');
      const upserts = events.map((_, i) => eventUpsert(`e${i}_`)).join('\n');
      const params = {
        $id: TypedValues.utf8(task.id),
        $title: TypedValues.utf8(next.title),
        $description: TypedValues.utf8(next.description),
        $assignees: TypedValues.utf8(JSON.stringify(next.assignees)),
        $related: TypedValues.utf8(JSON.stringify(next.relatedProducts)),
        $status: TypedValues.utf8(next.status),
        $waiting: optUtf8(next.waitingOn || null),
        $links: TypedValues.utf8(JSON.stringify(next.links)),
        $at: TypedValues.utf8(at),
      };
      events.forEach((e, i) => Object.assign(params, eventParams(e, `e${i}_`, i)));
      // Одна транзакция: проверить, что задачу не изменили с момента чтения,
      // и только тогда записать её и события.
      await session(async (s) => {
        const tx = await s.beginTransaction({ serializableReadWrite: {} });
        const read = await s.executeQuery(pragma + 'DECLARE $id AS Utf8; SELECT updated_at FROM tasks WHERE id = $id;',
          { $id: TypedValues.utf8(task.id) }, { txId: tx.id });
        const [cur] = rows(read.resultSets[0]);
        if (!cur || cur.updated_at !== task.updatedAt) {
          await s.rollbackTransaction({ txId: tx.id });
          throw new ApiError(409, 'conflict', 'задачу только что изменили — перечитай и повтори');
        }
        await s.executeQuery(pragma + `
          DECLARE $id AS Utf8; DECLARE $title AS Utf8; DECLARE $description AS Utf8; DECLARE $assignees AS Utf8;
          DECLARE $related AS Utf8; DECLARE $status AS Utf8; DECLARE $waiting AS Utf8?; DECLARE $links AS Utf8;
          DECLARE $at AS Utf8;
          ${declares}
          UPDATE tasks SET title = $title, description = $description, assignees = $assignees,
            related_products = $related, status = $status, waiting_on = $waiting, links = $links, updated_at = $at
            WHERE id = $id;
          ${upserts}
        `, params, { txId: tx.id, commitTx: true });
      });
      return next;
    },

    async listEvents(after, limit) {
      const [afterAt, afterId] = (after || '|').split('|');
      const sets = await q(`
        DECLARE $at AS Utf8; DECLARE $eid AS Utf8; DECLARE $limit AS Uint64;
        SELECT ${EVENT_COLUMNS} FROM events
        WHERE at > $at OR (at = $at AND event_id > $eid)
        ORDER BY at, event_id LIMIT $limit;
      `, {
        $at: TypedValues.utf8(afterAt || ''),
        $eid: TypedValues.utf8(afterId || ''),
        $limit: TypedValues.uint64(limit),
      }, TX_RO);
      const list = rows(sets[0]).map(eventFromRow);
      const last = list[list.length - 1];
      return { events: list, nextCursor: last ? `${last.at}|${last.id}` : after || null };
    },

    async saveKey(k) {
      await q(`
        DECLARE $hash AS Utf8; DECLARE $kind AS Utf8; DECLARE $login AS Utf8?; DECLARE $name AS Utf8?; DECLARE $at AS Utf8;
        UPSERT INTO keys (hash, kind, login, name, created_at, revoked_at) VALUES ($hash, $kind, $login, $name, $at, NULL);
      `, {
        $hash: TypedValues.utf8(k.hash),
        $kind: TypedValues.utf8(k.kind),
        $login: optUtf8(k.login),
        $name: optUtf8(k.name),
        $at: TypedValues.utf8(k.createdAt),
      });
    },

    async findKey(hash) {
      const sets = await q(`DECLARE $hash AS Utf8; SELECT kind, login, name, created_at, revoked_at FROM keys WHERE hash = $hash;`,
        { $hash: TypedValues.utf8(hash) }, TX_RO);
      const [r] = rows(sets[0]);
      return r ? { kind: r.kind, login: r.login, name: r.name, createdAt: r.created_at, revokedAt: r.revoked_at } : null;
    },

    async revokeKey(hash, at) {
      await q(`DECLARE $hash AS Utf8; DECLARE $at AS Utf8; UPDATE keys SET revoked_at = $at WHERE hash = $hash;`,
        { $hash: TypedValues.utf8(hash), $at: TypedValues.utf8(at) });
    },
  };
}

module.exports = { createYdbStore, rows, cell };
