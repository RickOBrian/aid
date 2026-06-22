import { GuideBadge } from '../components/GuideBadge'
import { GuideCallout } from '../components/GuideCallout'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import { PluginSection } from '../components/PluginCard'
import './guide-section-shared.css'

const COLLECTION_SWITCHER_URL =
  'https://www.figma.com/community/plugin/1578025826116736633/variable-collection-switcher'

const VARIABLES_TO_TABLES_URL =
  'https://www.figma.com/community/plugin/1578030538088686225/variables-to-tables'

export function Section16Plugins() {
  return (
    <GuideFrame id="section-16">
      <GuideHeader title="Плагины" />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideLead>
            Используем для быстрой работы с переменными в Figma
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <PluginSection
            title="Переключение коллекций"
            plugin={{
              title: 'Variable Collection Switcher',
              href: COLLECTION_SWITCHER_URL,
            }}
            description={
              <p>
                Для смены коллекции в секциях, фреймах и т.п. мы используем
                плагин Variable Collection Switcher
              </p>
            }
          >
            <div className="plugin-section__steps">
              <p className="plugin-section__steps-title">Как использовать</p>
              <ol className="plugin-section__list">
                <li>Отрисуйте флоу на основе одной коллекции</li>
                <li>Скопируйте флоу</li>
                <li>Выделите все копии и запустите плагин</li>
              </ol>
              <ol className="plugin-section__list" start={4}>
                <li>
                  Затем в плагине выберите текущую коллекцию в выпадающем
                  списке{' '}
                  <span className="plugin-section__marker">●</span> “Source
                  collection (from)” и потом выберите коллекцию на которую
                  хотите переключить{' '}
                  <span className="plugin-section__marker plugin-section__marker--blue">
                    ●
                  </span>{' '}
                  “Target collection (to)”
                </li>
              </ol>
              <ol className="plugin-section__list" start={5}>
                <li>Нажмите на кнопку “Switch” и готово</li>
              </ol>
              <GuideCallout>
                <p>
                  Выделенные экран должны использовать дефолтный Appearance.
                </p>
                <p>
                  Переключайте dark/light mode для нужных экранов уже после
                  применения плагина перекраски.
                </p>
                <div className="guide-callout__cards">
                  <div className="guide-callout__mini-card guide-callout__mini-card--dont">
                    <span className="guide-callout__mini-card-title">
                      <GuideBadge variant="dont" />
                    </span>
                    <p>
                      Не задавайте Appearance на выделенных фреймах до
                      переключения коллекции через плагин.
                    </p>
                  </div>
                  <div className="guide-callout__mini-card guide-callout__mini-card--do">
                    <span className="guide-callout__mini-card-title">
                      <GuideBadge variant="do" />
                    </span>
                    <p>
                      Оставьте дефолтный Appearance, переключите коллекцию, а
                      затем настройте light/dark mode.
                    </p>
                  </div>
                </div>
              </GuideCallout>
            </div>
          </PluginSection>
        </GuideBlock>

        <GuideBlock>
          <PluginSection
            title="[Для ДС] Обновление, создание таблиц с токенами"
            plugin={{
              title: 'Variables To Tables',
              href: VARIABLES_TO_TABLES_URL,
            }}
            description={
              <p>
                Создаём, обновляем таблицы с токенами без хардворка. Сначала
                проведите работу в интерфейсе Figma в коллекциях
              </p>
            }
          >
            <div className="plugin-section__steps">
              <p className="plugin-section__steps-title">Как использовать</p>
              <p className="plugin-section__steps-subtitle">
                Если появилась новая коллекция
              </p>
              <ol className="plugin-section__list">
                <li>Запустите плагин и выберите коллекцию из списка</li>
              </ol>
              <ol className="plugin-section__list" start={2}>
                <li>
                  Нажмите “Generate Tables”, дождитесь окончания работы и
                  сформируются таблицы. Затем останется фреймы с таблицами
                  аккуратно подвинуть на свои места
                </li>
              </ol>

              <p className="plugin-section__steps-subtitle">
                Если обновилась текущая коллекция
              </p>
              <GuideText>
                <p>
                  Когда мы добавили новый, изменили или переименовали текущий
                  Global или Semantic Token, то:
                </p>
                <ol className="guide-numbered-list">
                  <li>Запустите плагин</li>
                  <li>Выберите фрейм: “Variables Table — name”</li>
                  <li>
                    Затем в плагине нажмите на кнопку “Update Tables”.
                    Дождитесь пока плагин отредактирует выбранные таблицы на
                    новые значения
                  </li>
                </ol>
              </GuideText>

              <GuideCallout>
                <p>
                  Коллекция должна соответствовать структуре, описанной в
                  гайдах справа
                </p>
              </GuideCallout>
            </div>
          </PluginSection>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
