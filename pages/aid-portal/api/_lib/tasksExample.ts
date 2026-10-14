import type { Task, TaskBoard } from './tasks.js';

/**
 * Примерные задачи для превью PR и локальной разработки (AID-16). Вымышленные:
 * люди — `engineer-1…4`, названия начинаются с «Пример». На основном сайте не
 * показываются никогда — там только сервис задач.
 */

const at = (day: number, hour = 10) => `2026-10-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00Z`;

function task(partial: Partial<Task> & Pick<Task, 'product' | 'number' | 'title' | 'status'>): Task {
  return {
    id: `${partial.product}-${partial.number}`,
    description: 'Пример задачи: описание появится, когда подключится сервис задач Team.',
    author: 'engineer-1',
    assignees: ['engineer-2'],
    relatedProducts: [],
    waitingOn: null,
    links: [],
    createdAt: at(1),
    updatedAt: at(5),
    history: [{ at: at(1), by: 'engineer-1', field: 'status', from: null, to: 'new' }],
    ...partial,
  };
}

export const EXAMPLE_BOARD: TaskBoard = {
  example: true,
  people: {
    'engineer-1': { displayName: 'Инженер 1' },
    'engineer-2': { displayName: 'Инженер 2' },
    'engineer-3': { displayName: 'Инженер 3' },
  },
  tasks: [
    task({ product: 'presentbook', number: 1, title: 'Пример: страница задач', status: 'in_progress', assignees: ['engineer-2', 'engineer-3'], relatedProducts: ['team'],
      description: 'Пример. Канбан задач команды и **карточка задачи**.\n\n- колонки по статусам\n- фильтры по продукту и человеку',
      links: [{ type: 'pr', url: 'https://github.com/RickOBrian/aid/pulls', title: 'Пример PR' }],
      history: [
        { at: at(1), by: 'engineer-1', field: 'status', from: null, to: 'new' },
        { at: at(2, 14), by: 'engineer-2', field: 'status', from: 'new', to: 'in_progress', note: 'Пример заметки' },
      ] }),
    task({ product: 'bot-request', number: 13, title: 'Пример: уведомления о новых задачах', status: 'new', assignees: ['engineer-3'] }),
    task({ product: 'team', number: 2, title: 'Пример: выдача ключей командой /team-key', status: 'waiting', waitingOn: 'pd', assignees: ['engineer-1'], relatedProducts: ['hub'],
      history: [
        { at: at(1), by: 'engineer-1', field: 'status', from: null, to: 'new' },
        { at: at(3), by: 'engineer-1', field: 'status', from: 'new', to: 'in_progress' },
        { at: at(4, 16), by: 'engineer-1', field: 'status', from: 'in_progress', to: 'waiting', note: 'Нужно решение PD' },
      ] }),
    task({ product: 'token-comparator', number: 1, title: 'Пример: релиз плагина', status: 'review', assignees: ['engineer-2'], waitingOn: 'engineer-1',
      links: [{ type: 'pr', url: 'https://github.com/RickOBrian/aid/pulls', title: 'Пример PR' }, { type: 'issue', url: 'https://github.com/RickOBrian/aid/issues', title: 'Пример issue' }] }),
    task({ product: 'standards', number: 4, title: 'Пример: правило состояний компонента', status: 'done', assignees: ['engineer-1', 'engineer-2'] }),
    task({ product: 'hub', number: 2, title: 'Пример: отменённая задача', status: 'cancelled', assignees: ['engineer-3'] }),
  ],
};
