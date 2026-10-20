import type { OwnerAgent, OwnerAgentInstance, OwnerPerson } from './api/_lib/owners';
import { productLabel } from './tasksModel';

/**
 * Подписи для карточек «Управление → Команда» (`/manage/team`, team-3).
 * `owns` в owners.json — коды владения (`site-presentbook`), экземпляры
 * Developer — коды продуктов сервиса задач (`presentbook`), DevOps — контуры.
 */

const OWNS_LABEL: Record<string, string> = {
  hub: 'Штаб',
  'ds-standards': 'Стандарты',
  'site-presentbook': 'Presentbook',
  'plugin-token-comparator': 'Token Comparator',
  'plugin-style-migration': 'Style Migration',
  'plugin-mcp': 'MCP',
  'plugin-library-updater': 'Library Updater',
  'plugin-components-swapper': 'Components Swapper',
  'ops-team': 'Team',
  'bot-request': 'Bot · Request',
};

const CONTOUR_LABEL: Record<string, string> = {
  duty: 'дежурный',
  presentbook: 'Presentbook',
  'token-comparator': 'Token Comparator',
  'registry-api': 'Registry API',
  'team-tasks': 'Team',
  team: 'Team',
};

export function ownsLabel(code: string): string {
  return OWNS_LABEL[code] ?? code;
}

export function instanceLabel(instance: OwnerAgentInstance): string {
  if (instance.product) {
    return productLabel(instance.product);
  }
  if (instance.contour) {
    return CONTOUR_LABEL[instance.contour] ?? instance.contour;
  }
  return instance.chat;
}

export const TOOL_LABEL: Record<string, string> = { claude: 'Claude', cursor: 'Cursor' };

/** Облако тегов живого инженера: инструмент ИИ первым, затем продукты. */
export function personTags(person: OwnerPerson): string[] {
  return [...(person.tool ? [TOOL_LABEL[person.tool] ?? person.tool] : []), ...person.owns.map(ownsLabel)];
}

/**
 * За что отвечает AI-инженер — кратко, человеческим текстом, и его продукты.
 * Пересказ карточек `docs/hub/agents/*.md`: в owners.json такого поля нет.
 * Продукты экземпляров (`instances`) добавляются к тегам сами.
 */
const AGENT_PROFILE: Record<string, { summary: string; tags?: string[] }> = {
  'ai-team': { summary: 'База команды — живые и AI-инженеры, ключи сервиса задач, онбординг новых людей.', tags: ['Team'] },
  'ai-tasks': { summary: 'Ведёт задачи команды: статусы, исполнители, на ком что висит; каждое утро ищет зависшее.', tags: ['Team', 'Штаб'] },
  'ai-requests': { summary: 'Разбирает вопросы и просьбы дизайнеров: отвечает по стандартам или передаёт в задачи.', tags: ['Bot · Request'] },
  'ai-standards': { summary: 'Стандарты AID: гайды, токены, знание о продуктах и замер внедрения в макетах.', tags: ['Стандарты'] },
  'ai-designer': { summary: 'Ревью макетов Driver и Rider по стандартам AID, предложения компонентов и токенов.', tags: ['Driver', 'Rider'] },
  'ai-developer': { summary: 'Пишет код продукта по задаче: ветка, PR, тесты и сборка.' },
  'ai-qa': { summary: 'Проверяет PR до мержа: тесты, сборку, превью и интерактивность.' },
  'ai-devops': { summary: 'Выкладка и инфраструктура контуров, CI, доступность сайтов и сертификаты.' },
  'ai-security': { summary: 'Следит, чтобы наружу не ушли секреты, ключи и личные данные: проверяет PR до мержа.' },
};

export function agentSummary(agent: OwnerAgent): string | null {
  return AGENT_PROFILE[agent.id]?.summary ?? null;
}

/** Теги AI-инженера: продукты из профиля и экземпляров, без повторов и без дежурного чата. */
export function agentTags(agent: OwnerAgent): string[] {
  const fromInstances = (agent.instances ?? []).filter((instance) => instance.product || (instance.contour && instance.contour !== 'duty')).map(instanceLabel);
  return [...new Set([...(AGENT_PROFILE[agent.id]?.tags ?? []), ...fromInstances])];
}
