import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSafeLinkUrl, isTaskBoard, type Task, type TaskBoard } from './api/_lib/tasks';
import { apiUrl, currentAppPath, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { parseReleaseNotes, type NoteInline } from './releaseNotes';
import {
  STATUS_LABEL,
  assigneeOptions,
  filtersFromSearch,
  formatTaskTime,
  groupByStatus,
  historyText,
  personName,
  productLabel,
  productOptions,
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
  font: var(--pf-font-body-m); color: ${T.textPrimary}; background: ${T.surface};
  min-height: 100vh; padding: ${T.pagePaddingDesktop};
}
.tsk-shell { max-width: 1440px; margin: 0 auto; display: grid; gap: var(--pf-spacing-24); }
.tsk-shell > * { min-width: 0; }
.tsk h1, .tsk h2, .tsk h3 { margin: 0; font-weight: var(--pf-type-weight-500); }
.tsk h1 { font: var(--pf-font-heading-l); letter-spacing: var(--pf-tracking-heading-l); }
.tsk-eyebrow { font: var(--pf-font-label-xs-caps); letter-spacing: var(--pf-tracking-label-xs-caps); text-transform: uppercase; color: ${T.textSecondary}; }
.tsk-eyebrow a { color: inherit; text-decoration: none; }
.tsk-eyebrow a:hover { text-decoration: underline; }
.tsk-eyebrow a:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.tsk-muted { color: ${T.textSecondary}; }
.tsk-head { display: grid; gap: var(--pf-spacing-8); }
.tsk-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-8) var(--pf-spacing-12); }
/* «Пример» — Badge Neutral (без пунктира) */
.tsk-example {
  display: inline-flex; align-items: center; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s); background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
}
.tsk-filters { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-8) var(--pf-spacing-16); }
.tsk-filters label { display: inline-flex; align-items: center; gap: var(--pf-spacing-8); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
/* Поле выбора — FieldSelect (§7.2): line-default → line-hover, radius-m */
.tsk select {
  min-height: 36px; max-width: 100%; padding: var(--pf-spacing-6) var(--pf-spacing-10);
  font: var(--pf-font-body-m); font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
  transition: border-color 150ms ease;
}
.tsk select:hover { border-color: ${T.borderHover}; }
.tsk select:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.tsk input[type='checkbox'] { accent-color: var(--ds-accent); width: 16px; height: 16px; margin: 0; }
.tsk-filter-label { font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.tsk-picker { position: relative; display: inline-flex; align-items: center; gap: var(--pf-spacing-8); }
.tsk-picker-button {
  display: inline-flex; align-items: center; gap: var(--pf-spacing-8); min-height: 36px; padding: var(--pf-spacing-6) var(--pf-spacing-10); cursor: pointer;
  font: var(--pf-font-body-m); font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
  transition: border-color 150ms ease;
}
.tsk-picker-button[aria-expanded='true'], .tsk-picker-button:hover { border-color: ${T.borderHover}; }
.tsk-picker-chevron { font-size: 10px; color: var(--pf-icon-secondary); }
.tsk-picker-button:hover .tsk-picker-chevron { color: var(--pf-icon-primary); }
.tsk-picker-panel {
  position: absolute; top: calc(100% + var(--pf-spacing-4)); left: 0; z-index: 10; display: grid; gap: var(--pf-spacing-2); min-width: 220px; max-height: 320px; overflow-y: auto;
  padding: var(--pf-spacing-6); background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m); box-shadow: ${T.shadow1};
}
.tsk-picker-option { display: flex; align-items: center; gap: var(--pf-spacing-8); min-height: 32px; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-s); cursor: pointer; font: var(--pf-font-body-s); color: ${T.textPrimary}; }
.tsk-picker-option:hover { background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */ }
.tsk-picker-reset { margin-top: var(--pf-spacing-4); padding: var(--pf-spacing-6) var(--pf-spacing-8); font: var(--pf-font-body-s); text-align: left; cursor: pointer; color: var(--ds-accent); text-decoration: var(--ds-link-decoration); background: none; border: 0; border-top: 1px solid ${T.border}; }
.tsk-picker-reset:hover { text-decoration: underline; }
/* Чипы исполнителей — Chip (§7.2) */
.tsk-chips { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-6); }
.tsk-chip {
  display: inline-flex; align-items: center; gap: var(--pf-spacing-6); min-height: 32px; padding: var(--pf-spacing-4) var(--pf-spacing-10); font: var(--pf-font-body-s); cursor: pointer;
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-pill);
  transition: background-color 150ms ease;
}
.tsk-chip:hover { background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */ }
.tsk-chip[aria-pressed='true'] { background: var(--ds-selected-bg); border-color: var(--ds-selected-bg); color: var(--ds-selected-text); }
.tsk-chip-count { font: var(--pf-font-body-s); font-size: 12px; line-height: 16px; /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tsk-chip[aria-pressed='true'] .tsk-chip-count { color: inherit; }
.tsk-picker-button:focus-visible, .tsk-chip:focus-visible, .tsk-picker-reset:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.tsk-updated { margin-left: auto; font: var(--pf-font-body-s); font-size: 12px; line-height: 16px; /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; }
/* Колонка канбана */
.tsk-board { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(250px, 1fr); gap: var(--pf-spacing-12); overflow-x: auto; padding-bottom: var(--pf-spacing-8); }
.tsk-col { display: grid; align-content: start; gap: var(--pf-spacing-8); padding: var(--pf-spacing-12); border-radius: var(--pf-radius-m); background: ${T.surfaceZebra}; border: 1px solid ${T.border}; min-height: 160px; }
.tsk-col-head { display: flex; justify-content: space-between; align-items: baseline; gap: var(--pf-spacing-8); padding: 0 var(--pf-spacing-4) var(--pf-spacing-4); }
.tsk-col-head h2 { font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */ }
.tsk-col-head span { font: var(--pf-font-body-s); color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tsk-empty { padding: var(--pf-spacing-8) var(--pf-spacing-4); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
/* Карточка задачи — IslandLink (§7.2) */
.tsk-card {
  display: grid; gap: var(--pf-spacing-6); width: 100%; padding: var(--pf-spacing-12); text-align: left; font: inherit; color: inherit; cursor: pointer;
  background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
  transition: border-color 150ms ease;
}
.tsk-card:hover { border-color: ${T.borderHover}; }
.tsk-card:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.tsk-id { font: var(--pf-font-code-s); color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tsk-card-title { font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */ }
.tsk-tags { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-4); }
/* Теги — Badge Neutral; главный — Badge Vivid Soft */
.tsk-tag {
  display: inline-flex; align-items: center; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s); background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
}
.tsk-tag-main { background: var(--pf-bg-accent-vivid-fade); color: var(--pf-text-accent-vivid); }
.tsk-meta { display: grid; gap: var(--pf-spacing-2); font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; }
.tsk-meta b { font-weight: var(--pf-type-weight-500); color: ${T.textPrimary}; }
.tsk-waiting { color: ${T.textPrimary}; }
.tsk-status { max-width: 560px; margin: 80px auto; display: grid; gap: var(--pf-spacing-12); }
.tsk-status a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
/* Диалог задачи — Dialog (§7.2) */
.tsk dialog {
  width: min(720px, calc(100vw - 32px)); max-height: calc(100vh - 64px); padding: 0;
  border: 1px solid ${T.border}; border-radius: var(--pf-radius-xl); box-shadow: ${T.shadow2}; color: ${T.textPrimary}; background: ${T.surface};
}
.tsk dialog::backdrop { background: color-mix(in srgb, ${T.toastBackground} 40%, transparent); /* pf-gap: bg-overlay */ }
.tsk-dialog { display: grid; gap: var(--pf-spacing-16); padding: var(--pf-spacing-24); }
.tsk-dialog-head { display: flex; justify-content: space-between; align-items: start; gap: var(--pf-spacing-16); }
.tsk-dialog-head h2 { font: var(--pf-font-heading-m); }
.tsk-close {
  flex: 0 0 auto; min-width: 44px; min-height: 44px; padding: 0 var(--pf-spacing-12); cursor: pointer;
  font: var(--pf-font-body-m); font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
}
.tsk-close:hover { background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */ }
.tsk-close:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.tsk-fields { display: grid; grid-template-columns: max-content 1fr; gap: var(--pf-spacing-6) var(--pf-spacing-16); margin: 0; font: var(--pf-font-body-m); }
.tsk-fields dt { color: ${T.textSecondary}; }
.tsk-fields dd { margin: 0; }
.tsk-desc p, .tsk-desc ul, .tsk-desc ol { margin: 0 0 var(--pf-spacing-8); }
.tsk-desc ul, .tsk-desc ol { padding-left: var(--pf-spacing-20); }
.tsk-desc h3 { margin: var(--pf-spacing-12) 0 var(--pf-spacing-6); font: var(--pf-font-heading-s); }
.tsk-desc code { padding: var(--pf-spacing-2) var(--pf-spacing-4); border-radius: var(--pf-radius-s); background: ${T.surfaceMuted}; font: var(--pf-font-code-s); }
.tsk-section h3 { margin: 0 0 var(--pf-spacing-8); font: var(--pf-font-heading-s); }
.tsk-links { margin: 0; padding-left: var(--pf-spacing-20); }
.tsk-links a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
.tsk-history { margin: 0; padding: 0; list-style: none; display: grid; gap: var(--pf-spacing-6); font: var(--pf-font-body-s); }
.tsk-history time { color: ${T.textSecondary}; font-variant-numeric: tabular-nums; margin-right: var(--pf-spacing-8); }
@media (max-width: 767px) {
  .tsk { padding: ${T.pagePaddingMobile}; }
  .tsk-updated { margin-left: 0; }
  .tsk-fields { grid-template-columns: 1fr; gap: var(--pf-spacing-2); }
  .tsk-fields dd { margin-bottom: var(--pf-spacing-8); }
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

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Выпадающий список продуктов с чекбоксами; ничего не отмечено — все. */
function ProductPicker({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (next: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = 'tsk-products-panel';

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Продукт из адреса, у которого сейчас нет задач, — тоже в списке.
  const all = [...options, ...selected.filter((product) => !options.includes(product))];
  const summary =
    selected.length === 0 ? 'Все' : selected.length === 1 ? productLabel(selected[0]) : `${productLabel(selected[0])} +${selected.length - 1}`;

  return (
    <div className="tsk-picker" ref={rootRef}>
      <span className="tsk-filter-label" id="tsk-products-label">
        Продукт
      </span>
      <button
        type="button"
        ref={buttonRef}
        className="tsk-picker-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby="tsk-products-label tsk-products-value"
        onClick={() => setOpen((value) => !value)}
      >
        <span id="tsk-products-value">{summary}</span>
        <span className="tsk-picker-chevron" aria-hidden="true">
          ▼
        </span>
      </button>
      {open && (
        <div className="tsk-picker-panel" id={panelId} role="group" aria-labelledby="tsk-products-label">
          {all.map((product) => (
            <label className="tsk-picker-option" key={product}>
              <input type="checkbox" checked={selected.includes(product)} onChange={() => onChange(toggle(selected, product))} />
              {productLabel(product)}
            </label>
          ))}
          {selected.length > 0 && (
            <button type="button" className="tsk-picker-reset" onClick={() => onChange([])}>
              Сбросить
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Исполнители тегами: логин GitHub и число задач на нём; нажатый тег — фильтр. */
function AssigneeChips({ options, selected, onChange }: { options: { login: string; count: number }[]; selected: string[]; onChange: (next: string[]) => void }) {
  // Человек из адреса, у которого пока нет задач, — тоже тегом, с нулём.
  const all = [...options, ...selected.filter((login) => !options.some((option) => option.login === login)).map((login) => ({ login, count: 0 }))];
  return (
    <div className="tsk-chips" role="group" aria-labelledby="tsk-assignees-label">
      <span className="tsk-filter-label" id="tsk-assignees-label">
        Исполнитель
      </span>
      {all.map(({ login, count }) => (
        <button
          type="button"
          key={login}
          className="tsk-chip"
          aria-pressed={selected.includes(login)}
          aria-label={`${login}, задач: ${count}`}
          onClick={() => onChange(toggle(selected, login))}
        >
          {login}
          <span className="tsk-chip-count">{count}</span>
        </button>
      ))}
    </div>
  );
}

function Board({ board, loadedAt }: { board: TaskBoard; loadedAt: Date }) {
  const [filters, setFilters] = useState<TaskFilters>(() => filtersFromSearch(window.location.search));
  const [selected, select] = useSelectedTask();
  const products = useMemo(() => productOptions(board), [board]);
  const assignees = useMemo(() => assigneeOptions(board, filters.products), [board, filters.products]);
  const columns = groupByStatus(board.tasks, filters);
  const selectedTask = board.tasks.find((task) => task.id === selected);
  const update = (patch: Partial<TaskFilters>) => setFilters((current) => ({ ...current, ...patch }));

  return (
    <>
      <div className="tsk-filters">
        <ProductPicker options={products} selected={filters.products} onChange={(next) => update({ products: next })} />
        <span className="tsk-updated" aria-live="polite">
          обновлено в {loadedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <AssigneeChips options={assignees} selected={filters.assignees} onChange={(next) => update({ assignees: next })} />
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
  );
}
