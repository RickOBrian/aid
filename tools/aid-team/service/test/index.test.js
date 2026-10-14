'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { toRequest, fromResponse } = require('../src/index')._internal;

test('событие шлюза → Request: путь, query, заголовки, base64-тело', async () => {
  const req = toRequest({
    httpMethod: 'POST',
    path: '/v1/tasks',
    queryStringParameters: { include: 'history' },
    headers: { Authorization: 'Bearer k', 'Content-Type': 'application/json' },
    body: Buffer.from('{"a":1}').toString('base64'),
    isBase64Encoded: true,
  });
  assert.equal(req.method, 'POST');
  assert.equal(new URL(req.url).pathname, '/v1/tasks');
  assert.equal(new URL(req.url).searchParams.get('include'), 'history');
  assert.equal(req.headers.get('authorization'), 'Bearer k');
  assert.deepEqual(await req.json(), { a: 1 });
});

test('Response → ответ функции; 304 без тела', async () => {
  const r = await fromResponse(new Response('{"x":1}', { status: 200, headers: { ETag: '"e"' } }));
  assert.equal(r.statusCode, 200);
  assert.equal(r.headers.etag, '"e"');
  assert.equal(r.body, '{"x":1}');
  const r304 = await fromResponse(new Response(null, { status: 304 }));
  assert.equal(r304.body, '');
});
