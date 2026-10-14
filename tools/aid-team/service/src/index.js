'use strict';

// Вход Cloud Function: событие API Gateway → Request → маршруты → ответ.
// Переменные окружения версии функции (задаёт workflow):
//   YDB_ENDPOINT, YDB_DATABASE; KEY_PEPPER — из Lockbox team-tasks-secrets.
// В базу — IAM-токеном сервисного аккаунта функции, который Облако передаёт
// в context каждого вызова (MetadataAuthService ydb-sdk требует ещё
// @yandex-cloud/nodejs-sdk — не тянем).

const { TokenAuthService } = require('ydb-sdk');
const { createApp } = require('./app');
const { createYdbStore } = require('./ydb-store');
const { ownersSource, githubLogin, namesSource } = require('./sources');

let app = null;
let iamToken = null;
const ydbAuth = new TokenAuthService('');

function getApp() {
  if (app) return app;
  const store = createYdbStore({ endpoint: process.env.YDB_ENDPOINT, database: process.env.YDB_DATABASE, authService: ydbAuth });
  app = createApp({
    store,
    owners: ownersSource(),
    names: namesSource(() => iamToken),
    githubLogin,
    pepper: () => process.env.KEY_PEPPER,
  });
  return app;
}

function toRequest(event) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(event.headers || {})) headers.set(k, String(v));
  for (const [k, list] of Object.entries(event.multiValueHeaders || {})) {
    headers.delete(k);
    for (const v of list) headers.append(k, String(v));
  }
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(event.queryStringParameters || {})) query.set(k, String(v));
  const qs = query.toString();
  const path = event.path || event.url || '/';
  const method = event.httpMethod || 'GET';
  let body;
  if (event.body && method !== 'GET' && method !== 'HEAD') {
    body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  }
  return new Request(`https://team.aidteam.pro${path}${qs ? `?${qs}` : ''}`, { method, headers, body });
}

async function fromResponse(res) {
  const headers = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  const text = res.status === 304 ? '' : await res.text();
  return { statusCode: res.status, headers, body: text, isBase64Encoded: false };
}

module.exports.handler = async (event, context) => {
  // IAM-токен сервисного аккаунта функции — для чтения файла имён в Object Storage.
  iamToken = context && context.token ? context.token.access_token : null;
  if (iamToken) ydbAuth.token = iamToken;
  return fromResponse(await getApp()(toRequest(event)));
};

module.exports._internal = { toRequest, fromResponse };
