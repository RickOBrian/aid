'use strict';

// Хранилище в памяти — тот же интерфейс, что у YDB (ydb-store.js). Для
// тестов маршрутов; в работе сервиса не используется.

const crypto = require('node:crypto');

function createMemoryStore() {
  const tasks = new Map();
  const events = [];
  const counters = new Map();
  const keys = new Map();

  const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const eventKey = (e) => `${e.at}|${e.eventId}`;

  return {
    async createTask(fields, author, at, makeEvent) {
      const number = (counters.get(fields.product) || 0) + 1;
      counters.set(fields.product, number);
      const task = {
        ...fields,
        id: `${fields.product}-${number}`,
        number,
        author,
        status: 'new',
        waitingOn: null,
        createdAt: at,
        updatedAt: at,
      };
      tasks.set(task.id, task);
      events.push({ ...makeEvent(task), eventId: `000-${crypto.randomUUID()}` });
      return { ...task };
    },

    async getTask(id) {
      const t = tasks.get(id);
      return t ? { ...t } : null;
    },

    async listTasks({ status, product, assignee, updatedSince, limit, cursor }) {
      let list = [...tasks.values()].sort(byId);
      if (cursor) list = list.filter((t) => t.id > cursor);
      if (status) list = list.filter((t) => t.status === status);
      if (product) list = list.filter((t) => t.product === product);
      if (assignee) list = list.filter((t) => t.assignees.some((a) => a.toLowerCase() === assignee.toLowerCase()));
      if (updatedSince) list = list.filter((t) => t.updatedAt >= updatedSince);
      const page = list.slice(0, limit);
      return { tasks: page.map((t) => ({ ...t })), nextCursor: list.length > limit ? page[page.length - 1].id : null };
    },

    async historyFor(ids) {
      const out = {};
      for (const e of events) {
        if (!ids.includes(e.taskId)) continue;
        (out[e.taskId] = out[e.taskId] || []).push(e);
      }
      return out;
    },

    async updateTask(task, changed, newEvents, at) {
      const next = { ...tasks.get(task.id), ...changed, updatedAt: at };
      tasks.set(task.id, next);
      newEvents.forEach((e, i) => events.push({ ...e, eventId: `${String(i).padStart(3, '0')}-${crypto.randomUUID()}` }));
      return { ...next };
    },

    async listEvents(after, limit) {
      const sorted = [...events].sort((a, b) => (eventKey(a) < eventKey(b) ? -1 : 1));
      const list = after ? sorted.filter((e) => eventKey(e) > after) : sorted;
      const page = list.slice(0, limit);
      return {
        events: page.map(({ eventId, ...e }) => ({ id: eventId, ...e })),
        nextCursor: page.length ? eventKey(page[page.length - 1]) : after || null,
      };
    },

    async saveKey(k) {
      keys.set(k.hash, { ...k, revokedAt: null });
    },

    async findKey(hash) {
      const k = keys.get(hash);
      return k ? { ...k } : null;
    },

    async revokeKey(hash, at) {
      const k = keys.get(hash);
      if (k) k.revokedAt = at;
    },
  };
}

module.exports = { createMemoryStore };
