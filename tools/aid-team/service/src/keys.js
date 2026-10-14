'use strict';

// Ключи сервиса. Хранится только HMAC-SHA256 ключа с секретом KEY_PEPPER
// (Lockbox team-tasks-secrets): утечка таблицы не даёт ни одного ключа.

const crypto = require('node:crypto');

// personal — человек; agent — AI-инженер на машине человека (ADR-047);
// service — сервисы вроде Presentbook и бота.
const PREFIX = { personal: 'aidt_', agent: 'aida_', service: 'aids_' };

function generateKey(kind) {
  const prefix = PREFIX[kind];
  if (!prefix) throw new Error(`unknown key kind ${kind}`);
  return prefix + crypto.randomBytes(32).toString('base64url');
}

function hashKey(pepper, key) {
  if (!pepper || pepper.length < 32) throw new Error('KEY_PEPPER is not configured');
  return crypto.createHmac('sha256', pepper).update(String(key)).digest('hex');
}

/** Ключ из заголовка Authorization: Bearer <ключ>; иначе null. */
function bearer(headers) {
  const h = headers.get('authorization') || '';
  const m = /^Bearer\s+(\S+)$/i.exec(h);
  return m ? m[1] : null;
}

module.exports = { generateKey, hashKey, bearer };
