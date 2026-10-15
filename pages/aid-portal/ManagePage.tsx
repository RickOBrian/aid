import { useEffect } from 'react';
import { withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import { ProductAccentScope } from './ProductAccentScope';
import { DEFAULT_PRODUCT_ID } from './productRegistry';

/**
 * «Управление» — `aidteam.pro/manage`: оглавление раздела (ADR-046). Как и
 * весь раздел, без ссылки в меню и только после входа.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_PRODUCT_ACCENT_STYLE}
.mng, .mng * { box-sizing: border-box; }
.mng { font-family: ${T.fontFamily}; color: ${T.textPrimary}; background: ${T.surface}; min-height: 100vh; padding: ${T.pagePaddingDesktop}; }
.mng-shell { max-width: 760px; margin: 0 auto; display: grid; gap: 24px; }
.mng h1 { margin: 0; font-size: 32px; line-height: 40px; font-weight: 500; }
.mng-list { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.mng-item {
  display: grid; gap: 4px; padding: 16px 20px; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius};
  color: inherit; text-decoration: none;
}
a.mng-item:hover { border-color: var(--ds-accent); }
a.mng-item:focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }
.mng-item b { font-size: 16px; line-height: 24px; font-weight: 500; }
.mng-item span { font-size: 14px; line-height: 20px; color: ${T.textSecondary}; }
.mng-soon { background: ${T.surfaceZebra}; }
@media (max-width: 768px) { .mng { padding: ${T.pagePaddingMobile}; } }
`;

export function ManagePage() {
  useEffect(() => {
    document.title = 'Управление · AID';
  }, []);
  return (
    <ProductAccentScope productId={DEFAULT_PRODUCT_ID}>
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
    </ProductAccentScope>
  );
}
