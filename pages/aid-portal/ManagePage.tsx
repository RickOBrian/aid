import { useEffect } from 'react';
import { withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';

/**
 * «Управление» — `aidteam.pro/manage`: оглавление раздела (ADR-046). Как и
 * весь раздел, без ссылки в меню и только после входа.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_PRODUCT_ACCENT_STYLE}
.mng, .mng * { box-sizing: border-box; }
.mng { font: var(--pf-font-body-m); color: ${T.textPrimary}; background: ${T.surface}; min-height: 100vh; padding: ${T.pagePaddingDesktop}; }
.mng-shell { max-width: 760px; margin: 0 auto; display: grid; gap: var(--pf-spacing-24); }
.mng h1 { margin: 0; font: var(--pf-font-heading-l); letter-spacing: var(--pf-tracking-heading-l); }
.mng-list { display: grid; gap: var(--pf-spacing-12); margin: 0; padding: 0; list-style: none; }
/* Карточка-ссылка — IslandLink (§7.2): line-default → line-hover, radius-m */
.mng-item {
  display: grid; gap: var(--pf-spacing-4); padding: var(--pf-spacing-16) var(--pf-spacing-20); background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
  color: inherit; text-decoration: none; transition: border-color 150ms ease;
}
a.mng-item:hover { border-color: ${T.borderHover}; }
a.mng-item:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.mng-item b { font: var(--pf-font-heading-s); }
.mng-item span { font: var(--pf-font-body-m); color: ${T.textSecondary}; }
.mng-soon { background: ${T.surfaceZebra}; }
@media (max-width: 767px) { .mng { padding: ${T.pagePaddingMobile}; } }
`;

export function ManagePage() {
  useEffect(() => {
    document.title = 'Управление · AID';
  }, []);
  return (
    <div className="mng">
      <style>{PAGE_STYLE}</style>
      <main className="mng-shell">
        <h1>Управление</h1>
        <ul className="mng-list">
          <li>
            <a className="mng-item" href={withBase('/manage/tasks')}>
              <b>Задачи</b>
              <span>Канбан задач команды из сервиса задач Team</span>
            </a>
          </li>
          <li>
            <a className="mng-item" href={withBase('/manage/team')}>
              <b>Команда</b>
              <span>Живые инженеры и AI-инженеры AID</span>
            </a>
          </li>
          <li>
            <div className="mng-item mng-soon">
              <b>Роудмап</b>
              <span>Скоро</span>
            </div>
          </li>
        </ul>
      </main>
    </div>
  );
}
