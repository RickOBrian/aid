import type { OwnerAgentInstance } from './api/_lib/owners';
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
  'team-tasks': 'сервис задач',
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
    return `контур ${CONTOUR_LABEL[instance.contour] ?? instance.contour}`;
  }
  return instance.chat;
}

export const TOOL_LABEL: Record<string, string> = { claude: 'Claude', cursor: 'Cursor' };

export function githubProfileUrl(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}`;
}

/** Карточка AI-инженера в репозитории — только путь внутри docs/. */
export function repoFileUrl(path: string): string | null {
  return /^docs\/[\w./-]+\.md$/.test(path) && !path.includes('..') ? `https://github.com/RickOBrian/aid/blob/main/${path}` : null;
}
