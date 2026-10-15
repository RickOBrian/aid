/**
 * Инженеры AID для карточек «Управление → Команда» (`/manage/team`, team-3).
 *
 * Источник — `docs/hub/owners.json` на main, формат `aid-hub-owners/3`
 * (ADR-047, #219): люди — `people`, `kind: "human"`; AI-инженеры — `agents`,
 * `kind: "ai"`. Читается при открытии страницы (решение Штаба: без сборки и
 * без правки .github), различаем только по `kind`.
 */

export const OWNERS_URL = 'https://raw.githubusercontent.com/RickOBrian/aid/main/docs/hub/owners.json';

export interface OwnerPerson {
  kind: 'human';
  github: string;
  title: string;
  owns: string[];
  tool?: string;
  manager?: boolean;
  board?: string;
}

export interface OwnerAgentInstance {
  chat: string;
  product?: string;
  contour?: string;
}

export interface OwnerAgent {
  kind: 'ai';
  id: string;
  title: string;
  /** Путь карточки в репозитории: `docs/hub/agents/developer.md`. */
  card: string;
  /** Живой инженер — логин GitHub. */
  curator: string;
  instances?: OwnerAgentInstance[];
}

export interface Owners {
  people: OwnerPerson[];
  agents: OwnerAgent[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function toPerson(value: unknown): OwnerPerson | null {
  if (!isRecord(value) || value.kind !== 'human' || !isString(value.github) || !isString(value.title)) {
    return null;
  }
  return {
    kind: 'human',
    github: value.github,
    title: value.title,
    owns: Array.isArray(value.owns) ? value.owns.filter(isString) : [],
    tool: isString(value.tool) ? value.tool : undefined,
    manager: value.manager === true ? true : undefined,
    board: isString(value.board) ? value.board : undefined,
  };
}

function toAgent(value: unknown): OwnerAgent | null {
  if (!isRecord(value) || value.kind !== 'ai' || !isString(value.id) || !isString(value.title) || !isString(value.card) || !isString(value.curator)) {
    return null;
  }
  const instances = Array.isArray(value.instances)
    ? value.instances
        .filter((item): item is Record<string, unknown> => isRecord(item) && isString(item.chat))
        .map((item) => ({
          chat: item.chat as string,
          product: isString(item.product) ? item.product : undefined,
          contour: isString(item.contour) ? item.contour : undefined,
        }))
    : undefined;
  return { kind: 'ai', id: value.id, title: value.title, card: value.card, curator: value.curator, instances: instances?.length ? instances : undefined };
}

/**
 * Только нужные поля, лишнее отбрасывается (`decides`, `note` и будущие поля
 * на сайт не идут). Человек или AI — строго по `kind`: запись без него или с
 * чужим `kind` в своём списке пропускается.
 */
export function parseOwners(value: unknown): Owners | null {
  if (!isRecord(value) || !Array.isArray(value.people)) {
    return null;
  }
  return {
    people: value.people.map(toPerson).filter((person): person is OwnerPerson => person !== null),
    agents: Array.isArray(value.agents) ? value.agents.map(toAgent).filter((agent): agent is OwnerAgent => agent !== null) : [],
  };
}

export function isOwners(value: unknown): value is Owners {
  return isRecord(value) && Array.isArray(value.people) && Array.isArray(value.agents);
}

export async function loadOwners(fetchImpl: typeof fetch = fetch): Promise<Owners | null> {
  const response = await fetchImpl(OWNERS_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    console.error(`team: owners.json ответил ${response.status}`);
    return null;
  }
  return parseOwners(await response.json().catch(() => null));
}
