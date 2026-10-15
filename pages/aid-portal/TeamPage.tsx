import { useEffect, useState } from 'react';
import { isOwners, loadOwners, type OwnerAgent, type OwnerPerson, type Owners } from './api/_lib/owners';
import { isTaskBoard, type TaskBoard } from './api/_lib/tasks';
import { apiUrl, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { ProductAccentScope } from './ProductAccentScope';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import { personName } from './tasksModel';
import { TOOL_LABEL, githubProfileUrl, instanceLabel, ownsLabel, repoFileUrl } from './teamModel';

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
.tm { font-family: ${T.fontFamily}; color: ${T.textPrimary}; background: ${T.surface}; min-height: 100vh; padding: ${T.pagePaddingDesktop}; font-size: 14px; line-height: 20px; }
.tm-shell { max-width: 1200px; margin: 0 auto; display: grid; gap: 32px; }
.tm-shell > * { min-width: 0; }
.tm h1, .tm h2, .tm h3 { margin: 0; font-weight: 500; }
.tm h1 { font-size: 32px; line-height: 40px; }
.tm h2 { font-size: 20px; line-height: 28px; }
.tm-eyebrow { font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: ${T.tableHeadLetterSpacing}; text-transform: uppercase; color: ${T.textSecondary}; }
.tm-eyebrow a { color: inherit; text-decoration: none; }
.tm-eyebrow a:hover { text-decoration: underline; }
.tm-head { display: grid; gap: 8px; }
.tm-muted { color: ${T.textSecondary}; }
.tm-section { display: grid; gap: 12px; }
.tm-section-head { display: flex; align-items: baseline; gap: 8px; }
.tm-section-head span { color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.tm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.tm-card { display: grid; align-content: start; gap: 8px; height: 100%; padding: 16px; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius}; }
.tm-name { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
.tm-name h3 { font-size: 16px; line-height: 24px; }
.tm-login { font-size: 12px; color: ${T.textSecondary}; }
.tm-badge { padding: 1px 6px; border-radius: 4px; font-size: 11px; line-height: 16px; font-weight: 500; background: ${T.surfaceMuted}; color: ${T.textSecondary}; }
.tm-badge-ai { background: var(--ds-accent-bg); color: var(--ds-accent); }
.tm-title { color: ${T.textSecondary}; }
.tm-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tm-tag { padding: 2px 6px; border-radius: 4px; background: ${T.surfaceMuted}; color: ${T.textSecondary}; font-size: 11px; line-height: 16px; font-weight: 500; }
.tm-meta { display: grid; gap: 2px; font-size: 13px; color: ${T.textSecondary}; }
.tm-meta b { font-weight: 500; color: ${T.textPrimary}; }
.tm-instances { margin: 0; padding-left: 18px; font-size: 13px; color: ${T.textSecondary}; }
.tm-links { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 4px; font-size: 13px; }
.tm-links a { color: var(--ds-accent); text-decoration: none; }
.tm-links a:hover { text-decoration: underline; }
.tm a:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; border-radius: 2px; }
.tm-status { max-width: 560px; margin: 80px auto; }
.tm-status a { color: var(--ds-accent); }
@media (max-width: 768px) {
  .tm { padding: ${T.pagePaddingMobile}; }
  .tm h1 { font-size: 26px; line-height: 32px; }
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

function PersonCard({ person, people }: { person: OwnerPerson; people: TaskBoard['people'] }) {
  const name = personName(person.github, people);
  const githubUrl = githubProfileUrl(person.github);
  return (
    <article className="tm-card">
      <div className="tm-name">
        <h3>{name}</h3>
        {person.manager && <span className="tm-badge">менеджер</span>}
        {person.tool && <span className="tm-badge">{TOOL_LABEL[person.tool] ?? person.tool}</span>}
      </div>
      {name !== person.github && <span className="tm-login">{person.github}</span>}
      <span className="tm-title">{person.title}</span>
      {person.owns.length > 0 && (
        <div className="tm-tags" aria-label="Продукты">
          {person.owns.map((code) => (
            <span className="tm-tag" key={code}>
              {ownsLabel(code)}
            </span>
          ))}
        </div>
      )}
      <div className="tm-links">
        <a href={withBase(`/manage/tasks?person=${encodeURIComponent(person.github)}`)}>Задачи</a>
        <a href={githubUrl} target="_blank" rel="noreferrer noopener">
          GitHub
        </a>
      </div>
    </article>
  );
}

function AgentCard({ agent, people }: { agent: OwnerAgent; people: TaskBoard['people'] }) {
  const githubUrl = repoFileUrl(agent.card);
  return (
    <article className="tm-card">
      <div className="tm-name">
        <h3>{agent.title}</h3>
        <span className="tm-badge tm-badge-ai" title="AI-инженер">
          AI
        </span>
      </div>
      <div className="tm-meta">
        <span>
          Куратор: <b>{personName(agent.curator, people)}</b>
        </span>
      </div>
      {agent.instances && (
        <div className="tm-meta">
          <span>Экземпляры:</span>
          <ul className="tm-instances">
            {agent.instances.map((instance) => (
              <li key={instance.chat}>
                {instanceLabel(instance)} — {instance.chat}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="tm-links">
        <a href={withBase(`/manage/tasks?person=${encodeURIComponent(agent.id)}`)}>Задачи</a>
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noreferrer noopener">
            Карточка
          </a>
        )}
      </div>
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
    <ProductAccentScope productId={DEFAULT_PRODUCT_ID}>
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
    </ProductAccentScope>
  );
}
