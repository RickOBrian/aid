import { useEffect, useState } from 'react';
import { isOwners, loadOwners, type OwnerAgent, type OwnerPerson, type Owners } from './api/_lib/owners';
import { isTaskBoard, type TaskBoard } from './api/_lib/tasks';
import { apiUrl, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { personName } from './tasksModel';
import { agentSummary, agentTags, personTags } from './teamModel';

/**
 * «Управление → Команда» — `aidteam.pro/manage/team` (team-3, ADR-047).
 * Карточки всех инженеров: люди (`kind: human`) и AI-инженеры (`kind: ai`,
 * бейдж «AI» рядом с именем). Данные — `docs/hub/owners.json` с main через
 * `/api/team`; «Имя Ф.» — из сервиса задач, если он подключён, иначе логин.
 * Без ссылки в меню, только после входа.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_PRODUCT_ACCENT_STYLE}
.tm, .tm *, .tm *::before, .tm *::after { box-sizing: border-box; }
.tm { font: var(--pf-font-body-m); color: ${T.textPrimary}; background: ${T.surface}; min-height: 100vh; padding: ${T.pagePaddingDesktop}; }
.tm-shell { max-width: 1200px; margin: 0 auto; display: grid; gap: var(--pf-spacing-32); }
.tm-shell > * { min-width: 0; }
.tm h1, .tm h2, .tm h3 { margin: 0; font-weight: var(--pf-type-weight-500); }
.tm h1 { font: var(--pf-font-heading-l); letter-spacing: var(--pf-tracking-heading-l); }
.tm h2 { font: var(--pf-font-heading-m); }
.tm-eyebrow { font: var(--pf-font-label-xs-caps); letter-spacing: var(--pf-tracking-label-xs-caps); text-transform: uppercase; color: ${T.textSecondary}; }
.tm-eyebrow a { color: inherit; text-decoration: none; }
.tm-eyebrow a:hover { text-decoration: underline; }
.tm-head { display: grid; gap: var(--pf-spacing-8); }
.tm-muted { color: ${T.textSecondary}; }
.tm-section { display: grid; gap: var(--pf-spacing-12); }
.tm-section-head { display: flex; align-items: baseline; gap: var(--pf-spacing-8); }
.tm-section-head span { font: var(--pf-font-body-s); color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--pf-spacing-12); margin: 0; padding: 0; list-style: none; }
.tm-card { display: grid; align-content: start; gap: var(--pf-spacing-8); height: 100%; padding: var(--pf-spacing-16); background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m); }
.tm-name { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-6) var(--pf-spacing-8); }
.tm-name h3 { font: var(--pf-font-heading-s); }
.tm-login { font: var(--pf-font-code-s); color: ${T.textSecondary}; }
/* Бейдж «менеджер» — Badge Neutral; «AI» — Badge Vivid Soft */
.tm-badge {
  display: inline-flex; align-items: center; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s); background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
}
.tm-badge-ai { background: var(--pf-bg-accent-vivid-fade); color: var(--pf-text-accent-vivid); }
.tm-summary { margin: 0; color: ${T.textSecondary}; }
.tm-tags { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-4); }
/* Тег — Badge Neutral */
.tm-tag {
  display: inline-flex; align-items: center; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s); background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
}
.tm-meta { display: grid; gap: var(--pf-spacing-2); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.tm-meta b { font-weight: var(--pf-type-weight-500); color: ${T.textPrimary}; }
.tm-links { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-4) var(--pf-spacing-16); margin-top: var(--pf-spacing-4); font: var(--pf-font-body-s); }
.tm-links a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
.tm-links a:hover { text-decoration: underline; }
.tm a:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; border-radius: var(--pf-radius-s); }
.tm-status { max-width: 560px; margin: 80px auto; }
.tm-status a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
@media (max-width: 767px) {
  .tm { padding: ${T.pagePaddingMobile}; }
}
`;

type LoadState = { kind: 'loading' } | { kind: 'ready'; owners: Owners } | { kind: 'unauthorized' } | { kind: 'unavailable' };

function useOwners(): LoadState {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    if (import.meta.env.DEV) {
      // Локально функций нет — owners.json прямо с main.
      loadOwners()
        .then((owners) => setState(owners ? { kind: 'ready', owners } : { kind: 'unavailable' }))
        .catch(() => setState({ kind: 'unavailable' }));
      return () => controller.abort();
    }
    fetch(apiUrl('/api/team'), { signal: controller.signal, credentials: 'same-origin' })
      .then(async (response) => {
        if (response.status === 401) {
          return setState({ kind: 'unauthorized' });
        }
        const body: unknown = response.ok ? await response.json() : null;
        setState(isOwners(body) ? { kind: 'ready', owners: body } : { kind: 'unavailable' });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ kind: 'unavailable' });
        }
      });
    return () => controller.abort();
  }, []);
  return state;
}

/** «Имя Ф.» из сервиса задач; нет сервиса или пример — пусто, показываем логины. */
function usePeopleNames(): TaskBoard['people'] {
  const [people, setPeople] = useState<TaskBoard['people']>({});
  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }
    const controller = new AbortController();
    fetch(apiUrl('/api/tasks'), { signal: controller.signal, credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        if (isTaskBoard(body) && !body.example) {
          setPeople(body.people);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return people;
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div className="tm-tags" aria-label="Инструмент и продукты">
      {tags.map((tag) => (
        <span className="tm-tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function TasksLink({ login }: { login: string }) {
  return (
    <div className="tm-links">
      <a href={withBase(`/manage/tasks?person=${encodeURIComponent(login)}`)}>Задачи</a>
    </div>
  );
}

function PersonCard({ person, people }: { person: OwnerPerson; people: TaskBoard['people'] }) {
  const name = personName(person.github, people);
  return (
    <article className="tm-card">
      <div className="tm-name">
        <h3>{name}</h3>
        {person.manager && <span className="tm-badge">менеджер</span>}
      </div>
      {name !== person.github && <span className="tm-login">{person.github}</span>}
      <Tags tags={personTags(person)} />
      <TasksLink login={person.github} />
    </article>
  );
}

function AgentCard({ agent, people }: { agent: OwnerAgent; people: TaskBoard['people'] }) {
  const summary = agentSummary(agent);
  return (
    <article className="tm-card">
      <div className="tm-name">
        <h3>{agent.title}</h3>
        <span className="tm-badge tm-badge-ai" title="AI-инженер">
          AI
        </span>
      </div>
      {summary && <p className="tm-summary">{summary}</p>}
      <Tags tags={agentTags(agent)} />
      <div className="tm-meta">
        <span>
          Куратор: <b>{personName(agent.curator, people)}</b>
        </span>
      </div>
      <TasksLink login={agent.id} />
    </article>
  );
}

export function TeamPage() {
  const state = useOwners();
  const people = usePeopleNames();
  useEffect(() => {
    document.title = 'Команда · AID';
  }, []);

  return (
    <div className="tm">
      <style>{PAGE_STYLE}</style>
      <main className="tm-shell">
        <header className="tm-head">
          <div className="tm-eyebrow">
            <a href={withBase('/manage')}>Управление</a>
          </div>
          <h1>Команда</h1>
          <p className="tm-muted">Живые инженеры и AI-инженеры AID. У каждого AI-инженера есть куратор — живой инженер, без его «да» задача не мержится.</p>
        </header>
        {state.kind === 'ready' ? (
          <>
            <section className="tm-section" aria-labelledby="tm-people">
              <div className="tm-section-head">
                <h2 id="tm-people">Люди</h2>
                <span>{state.owners.people.length}</span>
              </div>
              <ul className="tm-grid">
                {state.owners.people.map((person) => (
                  <li key={person.github}>
                    <PersonCard person={person} people={people} />
                  </li>
                ))}
              </ul>
            </section>
            <section className="tm-section" aria-labelledby="tm-agents">
              <div className="tm-section-head">
                <h2 id="tm-agents">AI-инженеры</h2>
                <span>{state.owners.agents.length}</span>
              </div>
              <ul className="tm-grid">
                {state.owners.agents.map((agent) => (
                  <li key={agent.id}>
                    <AgentCard agent={agent} people={people} />
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <div className="tm-status" role="status">
            {state.kind === 'loading' && <p className="tm-muted">Загружаем команду…</p>}
            {state.kind === 'unauthorized' && (
              <p className="tm-muted">
                Сессия закончилась. <a href={withBase('/login')}>Войти снова</a>
              </p>
            )}
            {state.kind === 'unavailable' && <p className="tm-muted">Список команды сейчас недоступен. Попробуйте обновить страницу позже.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
