'use strict';

// Внешние источники: owners.json с main, вход GitHub, имена из team-data.
// Каждый — с кэшем в памяти экземпляра функции.

const OWNERS_URL = 'https://raw.githubusercontent.com/RickOBrian/aid/main/docs/hub/owners.json';
const NAMES_URL = 'https://storage.yandexcloud.net/aidteam-team-names/names.json';
const TTL_MS = 5 * 60_000;

function cached(load) {
  let value = null;
  let expires = 0;
  return async (now = Date.now()) => {
    if (value && expires > now) return value;
    value = await load();
    expires = now + TTL_MS;
    return value;
  };
}

/** owners.json → { logins: Set(lower), pd: Set(lower), byLogin } */
function parseOwners(json) {
  const people = Array.isArray(json && json.people) ? json.people : [];
  const logins = new Set();
  const pd = new Set();
  for (const p of people) {
    if (!p || !p.github) continue;
    const l = String(p.github).toLowerCase();
    logins.add(l);
    if (Array.isArray(p.decides) && p.decides.includes('system')) pd.add(l);
  }
  return { logins, pd };
}

function ownersSource(fetchImpl = fetch) {
  return cached(async () => {
    const res = await fetchImpl(OWNERS_URL, { headers: { 'User-Agent': 'aid-team-service' } });
    if (!res.ok) throw new Error(`owners.json: HTTP ${res.status}`);
    return parseOwners(await res.json());
  });
}

/** Логин GitHub по токену человека (Device Flow «AID Team», без прав). */
async function githubLogin(token, fetchImpl = fetch) {
  const res = await fetchImpl('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'aid-team-service',
    },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`api.github.com/user: HTTP ${res.status}`);
  const user = await res.json();
  return user && user.login ? String(user.login) : null;
}

/**
 * Отображаемые имена «Имя Ф.» — только для ответов по сервисному ключу
 * (решение PD 2026-10-14). Файл строит Team из people.json (STORAGE.md).
 */
function namesSource(getIamToken, fetchImpl = fetch) {
  return cached(async () => {
    const token = getIamToken();
    if (!token) return {};
    const res = await fetchImpl(NAMES_URL, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return {};
    const json = await res.json();
    const out = {};
    for (const p of Array.isArray(json.people) ? json.people : []) {
      if (p && p.github && p.displayName) out[p.github] = { displayName: String(p.displayName) };
    }
    return out;
  });
}

module.exports = { parseOwners, ownersSource, githubLogin, namesSource, OWNERS_URL };
