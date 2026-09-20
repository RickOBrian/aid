import { DsPageHeader } from './DsPageHeader';
import { DS_CHANGELOG_TABLE_STYLE, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { ChangelogTable } from './ChangelogTable';
import { loadGuideChangelog } from './loadGuideChangelog';
import { resolveProductId } from './productRegistry';
import { HUB_ROUTES } from './hubData';
import guideRegistry from './guide-registry.json';

/**
 * "Версионность" guide review page — built from `docs/semver-guide.md`
 * (source of truth for content). Structure mirrors the source file 1:1:
 * artifact table → version format → MAJOR/MINOR/PATCH rules → dependencies →
 * version-as-contract → examples → changelog. This page is a rendered view,
 * not a duplicate source — update `docs/semver-guide.md` first, then mirror
 * the change here.
 */

const guideMeta = guideRegistry.guides.find((guide) => guide.guideId === 'versioning')!;
const versioningChangelog = loadGuideChangelog('versioning');

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_TOKEN_TABLE_STYLE}
.dsvg,
.dsvg *,
.dsvg *::before,
.dsvg *::after {
  box-sizing: border-box;
}
.dsvg {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dsvg-shell {
  max-width: 760px;
  margin: 0 auto;
}
.dsvg-meta {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px 16px;
  font-size: 13px;
  line-height: 20px;
  margin: 0 0 40px;
  padding: 16px 20px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
}
.dsvg-meta dt {
  color: rgba(0, 0, 0, 0.54);
}
.dsvg-meta dd {
  margin: 0;
}
.dsvg-source-link {
  color: var(--ds-accent);
  text-decoration: none;
  font-size: 13px;
}
.dsvg-source-link:hover {
  text-decoration: underline;
}
.dsvg-source-link:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
.dsvg-version-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  background: #f5f5f5;
  border: 1px solid #ebedf0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.54);
}
.dsvg-lede {
  margin: 0 0 48px;
  font-size: 16px;
  line-height: 26px;
  color: rgba(0, 0, 0, 0.7);
}
.dsvg-section {
  margin-bottom: 48px;
}
.dsvg-section h2 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.dsvg-section h3 {
  margin: 24px 0 8px;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}
.dsvg-section > p {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.7);
}
.dsvg-section ul,
.dsvg-section ol {
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.7);
}
.dsvg-section li {
  margin-bottom: 4px;
}
.dsvg-section li:last-child {
  margin-bottom: 0;
}
.dsvg-code {
  margin: 0 0 16px;
  padding: 14px 18px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 20px;
  color: #2d2c2e;
}
.dsvg-code-label {
  display: block;
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
}
.dsvg-table {
  min-width: 480px;
}
.dsvg-table-col-1 {
  min-width: 160px;
  font-weight: 500;
}
.dsvg-example {
  margin-bottom: 20px;
}
.dsvg-example:last-child {
  margin-bottom: 0;
}
.dsvg-example-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #2d2c2e;
}
@media (max-width: 767px) {
  .dsvg {
    padding: 20px 16px 40px;
  }
  .dsvg-meta {
    grid-template-columns: 1fr;
  }
}
`;

const ARTIFACT_TABLE: { artifact: string; examples: string }[] = [
  {
    artifact: 'Токены и стили',
    examples:
      'Colors/Core, Colors/Semantic, Spacing/Core, Spacing/Semantic, Radius/Core, Radius/Semantic, Typography/Core, Typography/Semantic',
  },
  { artifact: 'Компоненты', examples: 'ButtonText, BadgeStatus, FieldCheckbox' },
  { artifact: 'Графика', examples: 'Icons, Pictograms, Logos, Avatars' },
  { artifact: 'Гайды', examples: 'Архитектурный гайд, SemVer-гайд, Component Spec' },
];

const ASSIGNMENT_TABLE: { moment: string; action: string }[] = [
  { moment: 'Дизайн-архитектор завершил спеку', action: 'Версия фиксируется в спеке и задаче' },
  { moment: 'Разработка берёт задачу', action: 'Версия не меняется' },
  {
    moment: 'В процессе появляется новая версия',
    action: 'Создаётся новая задача, текущая не трогается',
  },
  { moment: 'QA принимает артефакт', action: 'Версия фиксируется как Released в log-файле' },
  {
    moment: 'Обнаружена ошибка после релиза',
    action: 'Создаётся patch-версия как новая задача',
  },
];

const EXAMPLES: { title: string; lines: string[] }[] = [
  { title: 'BadgeStatus: добавлен новый цвет-вариант', lines: ['v1.0.0 → v1.1.0   (MINOR: новый вариант, старые не затронуты)'] },
  { title: 'ButtonText: переименован prop type → variant', lines: ['v1.1.0 → v2.0.0   (MAJOR: потребители обязаны обновить код)'] },
  { title: 'Colors/Core: исправлен неверный hex', lines: ['v1.2.0 → v1.2.1   (PATCH: исправление без изменения структуры)'] },
  { title: 'Icons: добавлены 10 новых иконок', lines: ['v2.0.0 → v2.1.0   (MINOR: добавление без удаления существующих)'] },
  {
    title: 'FieldCheckbox после breaking change в Checkbox',
    lines: ['Checkbox:      v1.0.0 → v2.0.0   (MAJOR)', 'FieldCheckbox: v1.2.0 → v2.0.0   (MAJOR, синхронно)'],
  },
  {
    title: 'Colors/Semantic после breaking change в Colors/Core',
    lines: ['Colors/Core:     v1.0.0 → v2.0.0   (MAJOR)', 'Colors/Semantic: v1.3.0 → v2.0.0   (MAJOR, синхронно)'],
  },
];

export function VersioningGuidePage() {
  const currentProductId = resolveProductId(window.location.pathname);

  return (
    <div className="dsvg">
      <style>{PAGE_STYLE}</style>
      <div className="dsvg-shell">
        <DsPageHeader
          title="Версионность"
          backHref={`/${currentProductId}${HUB_ROUTES.guides}`}
          backAriaLabel="Назад к Guides"
          showSearch={false}
        />

        <dl className="dsvg-meta">
          <dt>Версия</dt>
          <dd>
            <span className="dsvg-version-badge">v{guideMeta.version}</span>
          </dd>
          <dt>Группа</dt>
          <dd>{guideMeta.guidesGroup}</dd>
          <dt>Источник</dt>
          <dd>
            <a
              className="dsvg-source-link"
              href={guideMeta.sourceDownloadUrl}
              download={guideMeta.sourceDownloadFileName}
            >
              {guideMeta.sourceDownloadFileName}
            </a>
          </dd>
        </dl>

        <p className="dsvg-lede">
          Единые правила версионирования артефактов дизайн-системы. Версия — это контракт между
          дизайном, разработкой и QA. Она фиксирует что именно реализуется, что тестируется и что
          ожидают потребители артефакта.
        </p>

        <section className="dsvg-section" aria-labelledby="dsvg-artifacts">
          <h2 id="dsvg-artifacts">Артефакты с версионностью</h2>
          <p>
            Версионируются четыре категории артефактов. Каждый артефакт получает собственную
            версию независимо от других.
          </p>
          <div className="ds-token-table-wrap">
            <table className="ds-token-table dsvg-table">
              <thead>
                <tr>
                  <th className="dsvg-table-col-1">Артефакт</th>
                  <th>Примеры единиц версионирования</th>
                </tr>
              </thead>
              <tbody>
                {ARTIFACT_TABLE.map((row) => (
                  <tr key={row.artifact}>
                    <td className="dsvg-table-col-1">{row.artifact}</td>
                    <td>{row.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 16, marginBottom: 0 }}>
            Паттерны и виджеты версионируются как компоненты — отдельной категории не образуют.
            Моды отображения (Light Mode, Dark Mode, System Mode) не являются самостоятельным
            артефактом: добавление поддержки Dark Mode — это изменение версии{' '}
            <code>Colors/Semantic</code>.
          </p>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-format">
          <h2 id="dsvg-format">Формат версии</h2>
          <pre className="dsvg-code">MAJOR.MINOR.PATCH</pre>
          <p style={{ marginBottom: 0 }}>
            Все три цифры обязательны для всех артефактов, включая гайды. Первая версия любого
            артефакта — <code>1.0.0</code>.
          </p>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-rules">
          <h2 id="dsvg-rules">Правила изменения версии</h2>

          <h3>MAJOR — breaking change</h3>
          <p>
            Увеличивается когда изменение ломает существующих потребителей. Потребитель обязан
            обновить свой код при переходе на новый major.
          </p>
          <ul>
            <li>Удалён или переименован компонент, токен, иконка</li>
            <li>Изменён обязательный prop или его тип</li>
            <li>Удалён вариант (variant) или состояние (state)</li>
            <li>Изменена структура слотов (переименован leading → start)</li>
            <li>Токен удалён или переименован на любом уровне</li>
            <li>Изменена геометрия иконки, если она используется как data-атрибут</li>
          </ul>

          <h3>MINOR — новая функциональность</h3>
          <p>
            Увеличивается когда добавляется новое без поломки существующего. Потребитель может
            обновиться без изменений в своём коде.
          </p>
          <ul>
            <li>Добавлен новый опциональный prop</li>
            <li>Добавлен новый вариант или состояние</li>
            <li>Добавлена поддержка нового слота</li>
            <li>Добавлена новая иконка или пиктограмма</li>
            <li>Добавлен новый токен на любом уровне</li>
            <li>Токены получили поддержку Dark Mode</li>
          </ul>

          <h3>PATCH — исправление</h3>
          <p style={{ marginBottom: 8 }}>
            Увеличивается при исправлениях, не меняющих поведение и API.
          </p>
          <ul style={{ marginBottom: 0 }}>
            <li>Исправлена визуальная ошибка (неправильный отступ, цвет)</li>
            <li>Исправлена ошибка доступности без изменения API</li>
            <li>Обновлена документация или комментарии в коде</li>
            <li>Исправлена опечатка в гайде</li>
          </ul>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-deps">
          <h2 id="dsvg-deps">Зависимости между артефактами</h2>
          <p>Изменения в одном артефакте могут обязывать обновить версию другого.</p>

          <h3>Core → Semantic</h3>
          <p>
            Токены Semantic ссылаются на Core. Если Core получает breaking change (major),
            Semantic того же типа обязан получить major в той же итерации.
          </p>
          <pre className="dsvg-code">{`Colors/Core:     v1.0.0 → v2.0.0   (MAJOR: удалён primitive-цвет)
Colors/Semantic: v1.3.0 → v2.0.0   (MAJOR: обязательно, синхронно)`}</pre>
          <p>Это правило работает для всех типов токенов: Spacing, Radius, Typography и других.</p>

          <h3>Компонент → Компонент</h3>
          <p>
            Если компонент A зависит от компонента B, и B получает breaking change — A обязан
            получить major в той же итерации.
          </p>
          <pre className="dsvg-code">{`Checkbox:      v1.0.0 → v2.0.0   (MAJOR: изменён API)
FieldCheckbox: v1.2.0 → v2.0.0   (MAJOR: обязательно, синхронно)`}</pre>
          <p style={{ marginBottom: 0 }}>
            Цепочку зависимостей нужно проверять при каждом major-изменении до начала разработки.
          </p>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-contract">
          <h2 id="dsvg-contract">Версия как контракт задачи</h2>
          <p>
            Версия артефакта фиксируется в задаче в момент её создания и не меняется до
            завершения.
          </p>
          <p>
            <strong>Задача создаётся на конкретную версию.</strong> Если в процессе работы над
            ButtonText v1.0.0 появляется ButtonText v1.1.0 с новой функциональностью — это отдельная
            задача. Текущий спринт, оценка и объём работ не пересматриваются.
          </p>
          <p>
            <strong>QA тестирует строго зафиксированную версию.</strong> Тестировщик проверяет
            ButtonText v1.0.0 по спеке этой версии и не учитывает изменения из v1.1.0. Появление
            новой версии во время тестирования не является основанием для расширения скоупа.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Новая версия — новая задача.</strong> ButtonText v1.1.0 создаётся как отдельная
            задача с отдельной спекой, отдельной оценкой и отдельным циклом QA. Она может быть
            взята в следующий спринт или поставлена в очередь — независимо от статуса v1.0.0.
          </p>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-assignment">
          <h2 id="dsvg-assignment">Когда присваивается версия</h2>
          <div className="ds-token-table-wrap">
            <table className="ds-token-table dsvg-table">
              <thead>
                <tr>
                  <th className="dsvg-table-col-1">Момент</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {ASSIGNMENT_TABLE.map((row) => (
                  <tr key={row.moment}>
                    <td className="dsvg-table-col-1">{row.moment}</td>
                    <td>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-examples">
          <h2 id="dsvg-examples">Примеры</h2>
          {EXAMPLES.map((example) => (
            <div key={example.title} className="dsvg-example">
              <p className="dsvg-example-title">{example.title}</p>
              <pre className="dsvg-code" style={{ marginBottom: 0 }}>
                {example.lines.join('\n')}
              </pre>
            </div>
          ))}
        </section>

        <section className="dsvg-section" aria-labelledby="dsvg-changelog-format">
          <h2 id="dsvg-changelog-format">Версионирование и changelog</h2>
          <p>Каждый артефакт ведёт changelog. Минимальный формат:</p>
          <pre className="dsvg-code">{`## v1.1.0 — 2026-06-21
### Added
- Поддержка слота leading для иконки слева от текста

## v1.0.0 — 2026-05-10
### Added
- Первый релиз компонента`}</pre>
          <p style={{ marginBottom: 0 }}>
            При major-версии в changelog явно указывается: что сломалось и как мигрировать.
          </p>
        </section>

        {versioningChangelog ? <ChangelogTable data={versioningChangelog} /> : null}
      </div>
    </div>
  );
}
