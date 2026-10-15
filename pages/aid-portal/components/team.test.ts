import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, resetTeamCache } from '../api/team';
import { OWNERS_URL, isOwners, loadOwners, parseOwners, type Owners } from '../api/_lib/owners';
import { createSessionPayload, signSessionCookie, SESSION_COOKIE_NAME } from '../api/_lib/session';
import { canonicalAppPath } from '../productRegistry';
import { filtersFromSearch } from '../tasksModel';
import { agentSummary, agentTags, instanceLabel, ownsLabel, personTags } from '../teamModel';

/**
 * «Управление → Команда» (team-3, ADR-047): owners.json format 3, карточки
 * людей и AI-инженеров. Логины и записи — вымышленные.
 */

const RAW = {
  format: 'aid-hub-owners/3',
  note: 'служебное',
  people: [
    { github: 'lead', kind: 'human', title: 'Ведущий', owns: ['hub', 'site-presentbook'], decides: ['system'], tool: 'claude' },
    { github: 'mgr', kind: 'human', title: 'Менеджер', owns: [], manager: true, tool: 'cursor' },
    { github: 'ghost', title: 'Без kind' },
  ],
  agents: [
    {
      id: 'ai-developer',
      kind: 'ai',
      title: 'Developer',
      card: 'docs/hub/agents/developer.md',
      curator: 'lead',
      instances: [{ chat: 'AID · Developer · Presentbook', product: 'presentbook' }],
    },
    { id: 'ai-devops', kind: 'ai', title: 'DevOps', card: 'docs/hub/agents/devops.md', curator: 'lead', instances: [{ chat: 'AID · DevOps', contour: 'duty' }] },
    { id: 'ai-human', kind: 'human', title: 'Чужой kind', card: 'x', curator: 'lead' },
  ],
};

describe('owners.json format 3', () => {
  it('люди и AI различаются только по kind, лишние поля не идут на сайт', () => {
    const owners = parseOwners(RAW) as Owners;
    expect(owners.people.map((person) => person.github)).toEqual(['lead', 'mgr']);
    expect(owners.agents.map((agent) => agent.id)).toEqual(['ai-developer', 'ai-devops']);
    expect(JSON.stringify(owners)).not.toContain('decides');
    expect(JSON.stringify(owners)).not.toContain('служебное');
    expect(owners.people[1].manager).toBe(true);
    expect(isOwners(owners)).toBe(true);
  });

  it('старый формат без agents — пустой список AI, не ошибка', () => {
    expect(parseOwners({ people: RAW.people })?.agents).toEqual([]);
    expect(parseOwners({ agents: [] })).toBeNull();
  });

  it('читается с main на GitHub', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(RAW))) as unknown as typeof fetch;
    expect((await loadOwners(fetchImpl))?.people).toHaveLength(2);
    expect((fetchImpl as unknown as { mock: { calls: [string][] } }).mock.calls[0][0]).toBe(OWNERS_URL);
    expect(OWNERS_URL).toContain('/main/docs/hub/owners.json');
  });
});

describe('GET /api/team', () => {
  const SECRET = 'test-secret-only-for-unit-tests';
  const request = (cookie?: string) => new Request('https://example.test/api/team', { headers: cookie ? { cookie } : {} });

  beforeEach(() => {
    process.env.AUTH_COOKIE_SECRET = SECRET;
    resetTeamCache();
  });
  afterEach(() => {
    delete process.env.AUTH_COOKIE_SECRET;
  });

  it('без сессии — 401, GitHub не спрашивается', async () => {
    const load = vi.fn(async () => parseOwners(RAW));
    expect((await GET(request(), { load })).status).toBe(401);
    expect(load).not.toHaveBeenCalled();
  });

  it('с сессией — список, кэш 5 минут; GitHub недоступен — 503', async () => {
    const cookie = `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;
    let now = 0;
    const load = vi.fn(async () => parseOwners(RAW));
    const response = await GET(request(cookie), { load, now: () => now });
    expect(response.status).toBe(200);
    expect((await response.json()).agents).toHaveLength(2);
    await GET(request(cookie), { load, now: () => now });
    expect(load).toHaveBeenCalledTimes(1);
    resetTeamCache();
    expect((await GET(request(cookie), { load: async () => null })).status).toBe(503);
  });
});

describe('карточки', () => {
  it('подписи продуктов, экземпляров и контуров', () => {
    expect(ownsLabel('site-presentbook')).toBe('Presentbook');
    expect(ownsLabel('новое')).toBe('новое');
    expect(instanceLabel({ chat: 'c', product: 'token-comparator' })).toBe('Token Comparator');
    expect(instanceLabel({ chat: 'c', contour: 'registry-api' })).toBe('Registry API');
    expect(instanceLabel({ chat: 'Чат' })).toBe('Чат');
  });

  it('теги человека: инструмент ИИ первым, затем продукты', () => {
    expect(personTags({ kind: 'human', github: 'lead', title: 't', owns: ['hub', 'site-presentbook'], tool: 'claude' })).toEqual(['Claude', 'Штаб', 'Presentbook']);
    expect(personTags({ kind: 'human', github: 'x', title: 't', owns: ['hub'] })).toEqual(['Штаб']);
  });

  it('AI-инженер: за что отвечает и продукты экземпляров, без дежурного чата', () => {
    const devops = { kind: 'ai' as const, id: 'ai-devops', title: 'DevOps', card: 'c', curator: 'lead', instances: [{ chat: 'AID · DevOps', contour: 'duty' }, { chat: 'p', contour: 'presentbook' }] };
    expect(agentSummary(devops)).toBeTruthy();
    expect(agentTags(devops)).toEqual(['Presentbook']);
    expect(agentTags({ kind: 'ai', id: 'ai-tasks', title: 't', card: 'c', curator: 'lead', instances: [{ chat: 'x', product: 'team' }] })).toEqual(['Team', 'Штаб']);
    expect(agentSummary({ kind: 'ai', id: 'ai-новый', title: 't', card: 'c', curator: 'lead' })).toBeNull();
  });

  it('из карточки — в задачи с фильтром по исполнителю', () => {
    expect(filtersFromSearch('?person=lead')).toEqual({ assignees: ['lead'], products: [] });
    expect(canonicalAppPath('/manage/team')).toBeNull();
  });
});
