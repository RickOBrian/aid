import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSafeLinkUrl, isTaskBoard, type Task, type TaskBoard } from './api/_lib/tasks';
import { apiUrl, currentAppPath, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { ProductAccentScope } from './ProductAccentScope';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import { parseReleaseNotes, type NoteInline } from './releaseNotes';
import {
  ALL,
  STATUS_LABEL,
  filterOptions,
  filtersFromSearch,
  formatTaskTime,
  groupByStatus,
  historyText,
  personName,
  productLabel,
  taskIdFromPath,
  type TaskFilters,
} from './tasksModel';

/**
 * «Управление → Задачи» — `aidteam.pro/manage/tasks` (team-2, ADR-046).
 * Без ссылки в меню, только после входа. Задачи — из сервиса задач Team
 * через `/api/tasks`; на превью и локально — примерные, с плашкой «Пример».
 * Открытая страница обновляется раз в минуту.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;
const REFRESH_MS = 60_000;

const PAGE_STYLE = `
${DS_PRODUCT_ACCENT_STYLE}
.tsk, .tsk *, .tsk *::before, .tsk *::after { box-sizing: border-box; }
.tsk {
  font-family: ${T.fontFamily}; color: ${T.textPrimary}; background: ${T.surface};
  min-height: 100vh; padding: ${T.pagePaddingDesktop}; font-size: 14px; line-height: 20px;
}
.tsk-shell { max-width: 1440px; margin: 0 auto; display: grid; gap: 24px; }
.tsk-shell > * { min-width: 0; }
.tsk h1, .tsk h2, .tsk h3 { margin: 0; font-weight: 500; }
.tsk h1 { font-size: 32px; line-height: 40px; }
.tsk-eyebrow { font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: ${T.tableHeadLetterSpacing}; text-transform: uppercase; color: ${T.textSecondary}; }
.tsk-eyebrow a { color: inherit; text-decoration: none; }
.tsk-eyebrow a:hover { text-decoration: underline; }
.tsk-muted { color: ${T.textSecondary}; }
.tsk-head { display: grid; gap: 8px; }
.tsk-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.tsk-example { padding: 3px 8px; border: 1px dashed ${T.textSecondary}; border-radius: 4px; font-size: 12px; line-height: 16px; color: ${T.textSecondary}; }
.tsk-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
.tsk-filters label { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: ${T.textSecondary}; }
.tsk select {
  min-height: 36px; max-width: 100%; padding: 6px 10px; font: inherit; font-size: 14px;
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius};
}
.tsk input[type='checkbox'] { accent-color: var(--ds-accent); width: 16px; height: 16px; }
.tsk-updated { margin-left: auto; font-size: 12px; color: ${T.textSecondary}; }
.tsk-board { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(250px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 8px; }
.tsk-col { display: grid; align-content: start; gap: 8px; padding: 12px; border-radius: ${T.tableWrapRadius}; background: ${T.surfaceZebra}; border: 1px solid ${T.border}; min-height: 160px; }
.tsk-col-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 0 4px 4px; }
.tsk-col-head h2 { font-size: 14px; line-height: 20px; }
.tsk-col-head span { font-size: 12px; color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tsk-empty { padding: 8px 4px; font-size: 13px; color: ${T.textSecondary}; }
.tsk-card {
  display: grid; gap: 6px; width: 100%; padding: 12px; text-align: left; font: inherit; color: inherit; cursor: pointer;
  background: ${T.surface}; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius};
}
.tsk-card:hover { border-color: var(--ds-accent); }
.tsk-card:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }
.tsk-id { font-size: 12px; line-height: 16px; color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tsk-card-title { font-size: 14px; line-height: 20px; font-weight: 500; }
.tsk-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tsk-tag { padding: 2px 6px; border-radius: 4px; background: ${T.surfaceMuted}; color: ${T.textSecondary}; font-size: 11px; line-height: 16px; font-weight: 500; }
.tsk-tag-main { background: var(--ds-accent-bg); color: var(--ds-accent); }
.tsk-meta { display: grid; gap: 2px; font-size: 12px; line-height: 16px; color: ${T.textSecondary}; }
.tsk-meta b { font-weight: 500; color: ${T.textPrimary}; }
.tsk-waiting { color: ${T.textPrimary}; }
.tsk-status { max-width: 560px; margin: 80px auto; display: grid; gap: 12px; }
.tsk-status a { color: var(--ds-accent); }
.tsk dialog {
  width: min(720px, calc(100vw - 32px)); max-height: calc(100vh - 64px); padding: 0;
  border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius}; color: ${T.textPrimary}; background: ${T.surface};
}
.tsk dialog::backdrop { background: color-mix(in srgb, ${T.toastBackground} 40%, transparent); }
.tsk-dialog { display: grid; gap: 16px; padding: 24px; }
.tsk-dialog-head { display: flex; justify-content: space-between; align-items: start; gap: 16px; }
.tsk-dialog-head h2 { font-size: 22px; line-height: 28px; }
.tsk-close {
  flex: 0 0 auto; min-width: 44px; min-height: 44px; padding: 0 12px; font: inherit; font-size: 14px; cursor: pointer;
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius};
}
.tsk-close:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }
.tsk-fields { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; font-size: 14px; }
.tsk-fields dt { color: ${T.textSecondary}; }
.tsk-fields dd { margin: 0; }
.tsk-desc p, .tsk-desc ul, .tsk-desc ol { margin: 0 0 8px; }
.tsk-desc ul, .tsk-desc ol { padding-left: 20px; }
.tsk-desc h3 { margin: 12px 0 6px; font-size: 15px; }
.tsk-desc code { padding: 1px 4px; border-radius: 4px; background: ${T.surfaceMuted}; font-size: 13px; }
.tsk-section h3 { margin: 0 0 8px; font-size: 15px; }
.tsk-links { margin: 0; padding-left: 20px; }
.tsk-links a { color: var(--ds-accent); }
.tsk-history { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 13px; }
.tsk-history time { color: ${T.textSecondary}; font-variant-numeric: tabular-nums; margin-right: 8px; }
@media (max-width: 768px) {
  .tsk { padding: ${T.pagePaddingMobile}; }
  .tsk h1 { font-size: 26px; line-height: 32px; }
  .tsk-updated { margin-left: 0; }
  .tsk-fields { grid-template-columns: 1fr; gap: 2px; }
  .tsk-fields dd { margin-bottom: 8px; }
}
`;

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; board: TaskBoard; loadedAt: Date }
  | { kind: 'unauthorized' }
  | { kind: 'not-configured' }
  | { kind: 'unavailable' };

async function loadBoard(signal: AbortSignal): Promise<LoadState> {
  if (import.meta.env.DEV) {
    // Локально функций нет — примерные задачи.
    const { EXAMPLE_BOARD } = await import('./api/_lib/tasksExample');
    return { kind: 'ready', board: EXAMPLE_BOARD, loadedAt: new Date() };
  }
  const response = await fetch(apiUrl('/api/tasks'), { signal, credentials: 'same-origin' });
  if (response.status === 401) {
    return { kind: 'unauthorized' };
  }
  if (response.status === 503) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return body?.error === 'not configured' ? { kind: 'not-configured' } : { kind: 'unavailable' };
  }
  if (!response.ok) {
    return { kind: 'unavailable' };
  }
  const body: unknown = await response.json();
  return isTaskBoard(body) ? { kind: 'ready', board: body, loadedAt: new Date() } : { kind: 'unavailable' };
}

/** Задачи с обновлением раз в минуту; во фоновой вкладке не обновляет. */
function useTaskBoard(): LoadState {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  useEffect(() => {
    let controller = new AbortController();
    const refresh = () => {
      controller.abort();
      controller = new AbortController();
      const { signal } = controller;
      loadBoard(signal)
        .then((next) => {
          // Обновление не стирает уже показанные задачи из-за разовой ошибки сети.
          setState((previous) => (next.kind === 'unavailable' && previous.kind === 'ready' ? previous : next));
        })
        .catch(() => {
          if (!signal.aborted) {
            setState((previous) => (previous.kind === 'ready' ? previous : { kind: 'unavailable' }));
          }
        });
    };
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }, REFRESH_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return state;
}

/** Открытая задача — в адресе (`/manage/tasks/<id>`), чтобы ссылку можно было переслать. */
function useSelectedTask(): [string | null, (id: string | null) => void] {
  const [selected, setSelected] = useState<string | null>(() => taskIdFromPath(currentAppPath()));
  useEffect(() => {
    const onPop = () => setSelected(taskIdFromPath(currentAppPath()));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const select = useCallback((id: string | null) => {
    const path = id ? `/manage/tasks/${id}` : '/manage/tasks';
    if (currentAppPath() !== path) {
      window.history.pushState(null, '', withBase(path));
    }
    setSelected(id);
  }, []);
  return [selected, select];
}

function Inline({ parts }: { parts: NoteInline[] }) {
  return <>{parts.map((part, index) => (part.kind === 'code' ? <code key={index}>{part.text}</code> : part.text))}</>;
}

function Description({ markdown }: { markdown: string }) {
  const blocks = parseReleaseNotes(markdown);
  if (blocks.length === 0) {
    return <p className="tsk-muted">Описания нет.</p>;
  }
  return (
    <div className="tsk-desc">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h3 key={index}>
              <Inline parts={block.inline} />
            </h3>
          );
        }
        if (block.kind === 'paragraph') {
          return (
            <p key={index}>
              <Inline parts={block.inline} />
            </p>
          );
        }
        const List = block.ordered ? 'ol' : 'ul';
        return (
          <List key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline parts={item} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

function names(logins: string[], people: TaskBoard['people']): string {
  return logins.length > 0 ? logins.map((login) => personName(login, people)).join(', ') : '—';
}

function TaskCard({ task, people, onOpen }: { task: Task; people: TaskBoard['people']; onOpen: (id: string) => void }) {
  return (
    <button type="button" className="tsk-card" onClick={() => onOpen(task.id)} aria-haspopup="dialog">
      <span className="tsk-id">{task.id}</span>
      <span className="tsk-card-title">{task.title}</span>
      <span className="tsk-tags">
        <span className="tsk-tag tsk-tag-main">{productLabel(task.product)}</span>
        {task.relatedProducts.map((product) => (
          <span className="tsk-tag" key={product}>
            {productLabel(product)}
          </span>
        ))}
      </span>
      <span className="tsk-meta">
        <span>
          Исполнители: <b>{names(task.assignees, people)}</b>
        </span>
        {task.waitingOn && (
          <span className="tsk-waiting">
            Висит на: <b>{personName(task.waitingOn, people)}</b>
          </span>
        )}
        {task.curator && (
          <span>
            Куратор: <b>{personName(task.curator, people)}</b>
          </span>
        )}
      </span>
    </button>
  );
}

function TaskDialog({ task, taskId, people, onClose }: { task: Task | undefined; taskId: string; people: TaskBoard['people']; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    returnFocus.current = document.activeElement;
    if (!dialog.open && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
    return () => {
      if (returnFocus.current instanceof HTMLElement) {
        returnFocus.current.focus();
      }
    };
  }, []);

  const history = task?.history ?? [];
  const titleId = 'tsk-dialog-title';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Клик по подложке закрывает окно.
        if (event.target === ref.current) {
          onClose();
        }
      }}
    >
      <div className="tsk-dialog">
        <div className="tsk-dialog-head">
          <div>
            <div className="tsk-id">{taskId}</div>
            <h2 id={titleId}>{task ? task.title : 'Задача не найдена'}</h2>
          </div>
          <button type="button" className="tsk-close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        {task ? (
          <>
            <dl className="tsk-fields">
              <dt>Статус</dt>
              <dd>{STATUS_LABEL[task.status]}</dd>
              {task.waitingOn && (
                <>
                  <dt>Висит на</dt>
                  <dd>{personName(task.waitingOn, people)}</dd>
                </>
              )}
              <dt>Исполнители</dt>
              <dd>{names(task.assignees, people)}</dd>
              {task.curator && (
                <>
                  <dt>Куратор</dt>
                  <dd>{personName(task.curator, people)}</dd>
                </>
              )}
              <dt>Продукт</dt>
              <dd>{productLabel(task.product)}</dd>
              {task.relatedProducts.length > 0 && (
                <>
                  <dt>Связанные</dt>
                  <dd>{task.relatedProducts.map(productLabel).join(', ')}</dd>
                </>
              )}
              <dt>Автор</dt>
              <dd>{personName(task.author, people)}</dd>
              <dt>Создана</dt>
              <dd>{formatTaskTime(task.createdAt)}</dd>
              <dt>Изменена</dt>
              <dd>{formatTaskTime(task.updatedAt)}</dd>
            </dl>
            <section className="tsk-section" aria-label="Описание">
              <Description markdown={task.description} />
            </section>
            {task.links.length > 0 && (
              <section className="tsk-section">
                <h3>Ссылки</h3>
                <ul className="tsk-links">
                  {/* Схема проверена при разборе ответа; здесь — ещё раз, на случай других путей данных. */}
                  {task.links.filter((link) => isSafeLinkUrl(link.url)).map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer noopener">
                        {link.title ?? (link.type === 'pr' ? 'PR' : link.type === 'issue' ? 'Issue' : link.url)}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {history.length > 0 && (
              <section className="tsk-section">
                <h3>История</h3>
                <ol className="tsk-history">
                  {[...history].reverse().map((entry, index) => (
                    <li key={index}>
                      <time dateTime={entry.at}>{formatTaskTime(entry.at)}</time>
                      {personName(entry.by, people)}: {historyText(entry, people)}
                      {entry.note && <span className="tsk-muted"> — {entry.note}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        ) : (
          <p className="tsk-muted">Такой задачи нет в сервисе задач — возможно, она переименована или удалена.</p>
        )}
      </div>
    </dialog>
  );
}

function Board({ board, loadedAt }: { board: TaskBoard; loadedAt: Date }) {
  const [filters, setFilters] = useState<TaskFilters>(() => filtersFromSearch(window.location.search));
  const [selected, select] = useSelectedTask();
  const options = useMemo(() => filterOptions(board), [board]);
  const columns = groupByStatus(board.tasks, filters);
  const selectedTask = board.tasks.find((task) => task.id === selected);
  const update = (patch: Partial<TaskFilters>) => setFilters((current) => ({ ...current, ...patch }));

  return (
    <>
      <div className="tsk-filters">
        <label>
          Продукт
          <select value={filters.product} onChange={(event) => update({ product: event.target.value })}>
            <option value={ALL}>Все</option>
            {options.products.map((product) => (
              <option key={product} value={product}>
                {productLabel(product)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Человек
          <select value={filters.person} onChange={(event) => update({ person: event.target.value })}>
            <option value={ALL}>Все</option>
            {/* Человек из адреса, у которого пока нет задач, — тоже в списке. */}
            {filters.person !== ALL && !options.people.includes(filters.person) && <option value={filters.person}>{personName(filters.person, board.people)}</option>}
            {options.people.map((login) => (
              <option key={login} value={login}>
                {personName(login, board.people)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={filters.showCancelled} onChange={(event) => update({ showCancelled: event.target.checked })} />
          Показать отменённые
        </label>
        <span className="tsk-updated" aria-live="polite">
          обновлено в {loadedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="tsk-board">
        {columns.map((column) => (
          <section className="tsk-col" key={column.status} aria-labelledby={`tsk-col-${column.status}`}>
            <div className="tsk-col-head">
              <h2 id={`tsk-col-${column.status}`}>{STATUS_LABEL[column.status]}</h2>
              <span>{column.tasks.length}</span>
            </div>
            {column.tasks.length === 0 ? (
              <div className="tsk-empty">Нет задач</div>
            ) : (
              column.tasks.map((task) => <TaskCard key={task.id} task={task} people={board.people} onOpen={select} />)
            )}
          </section>
        ))}
      </div>
      {selected && <TaskDialog key={selected} taskId={selected} task={selectedTask} people={board.people} onClose={() => select(null)} />}
    </>
  );
}

function Status({ state }: { state: Exclude<LoadState, { kind: 'ready' }> }) {
  if (state.kind === 'loading') {
    return (
      <p className="tsk-status tsk-muted" role="status">
        Загружаем задачи…
      </p>
    );
  }
  return (
    <div className="tsk-status" role="status">
      {state.kind === 'unauthorized' && (
        <p className="tsk-muted">
          Сессия закончилась. <a href={withBase('/login')}>Войти снова</a>
        </p>
      )}
      {state.kind === 'not-configured' && <p className="tsk-muted">Сервис задач ещё не подключён к сайту.</p>}
      {state.kind === 'unavailable' && <p className="tsk-muted">Сервис задач сейчас недоступен. Страница попробует снова через минуту.</p>}
    </div>
  );
}

export function TasksPage() {
  const state = useTaskBoard();
  useEffect(() => {
    document.title = 'Задачи · AID';
  }, []);

  return (
    <ProductAccentScope productId={DEFAULT_PRODUCT_ID}>
      <div className="tsk">
        <style>{PAGE_STYLE}</style>
        <main className="tsk-shell">
          <header className="tsk-head">
            <div className="tsk-eyebrow">
              <a href={withBase('/manage')}>Управление</a>
            </div>
            <div className="tsk-title-row">
              <h1>Задачи</h1>
              {state.kind === 'ready' && state.board.example && (
                <span className="tsk-example">Пример — вымышленные задачи, настоящие появятся после подключения сервиса задач</span>
              )}
            </div>
          </header>
          {state.kind === 'ready' ? <Board board={state.board} loadedAt={state.loadedAt} /> : <Status state={state} />}
        </main>
      </div>
    </ProductAccentScope>
  );
}
