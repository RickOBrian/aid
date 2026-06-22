import { CollectionComparisonDiagram } from '../components/CollectionComparisonDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './StaticCollectionsSection.css'

export function StaticCollectionsSection() {
  return (
    <GuideFrame id="section-15">
      <GuideHeader
        title={
          <>
            Коллекции <span className="guide-mono">static-lm</span>,{' '}
            <span className="guide-mono">static-dm</span>
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideLead>
            Коллекции повторяют стандартную семантическую, но у них только один
            mode (light или dark)
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>Пример</GuideHeading>
          <GuideText>
            <p>
              Если токен surface-main в стандартной коллекции перекрашивается в
              зависимости от mode, то в коллекции static-lm будет только его
              значение из light mode, а в static-dm значение из dark mode
            </p>
          </GuideText>
          <CollectionComparisonDiagram />
        </GuideBlock>

        <GuideBlock>
          <h2 className="guide-frame__heading guide-frame__heading--lg">
            Переключение коллекций
          </h2>
          <div className="plugin-card">
            <img
              className="plugin-card__cover"
              src="/guide/plugin-cover.png"
              alt=""
              aria-hidden="true"
            />
            <div className="plugin-card__content">
              <p className="plugin-card__title">Variable Collection Switcher</p>
              <a
                className="plugin-card__link"
                href="https://www.figma.com/community/plugin/1578025826116736633/variable-collection-switcher"
                target="_blank"
                rel="noreferrer"
              >
                Перейти к плагину
              </a>
            </div>
          </div>
          <GuideText>
            <p>
              Для смены коллекции в секциях, фреймах и т.п. мы используем
              плагин Variable Collection Switcher. Подробнее про использования
              плагина{' '}
              <a
                href="https://www.figma.com/community/plugin/1578025826116736633/variable-collection-switcher"
                target="_blank"
                rel="noreferrer"
              >
                описано здесь
              </a>
            </p>
          </GuideText>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
