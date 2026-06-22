import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section14Additional.css'

const RUBELLITE_CORE = [
  { step: '55', color: '#DF3168', hex: '#DF3168', highlight: true },
  { step: '60', color: '#C72A5C' },
  { step: '65', color: '#A62E54' },
  { step: '70', color: '#872E4B' },
  { step: '75', color: '#692D41' },
  { step: '80', color: '#542434' },
  { step: '85', color: '#3F1B27' },
  { step: '90', color: '#2A121A' },
] as const

interface AdditionalFormationDiagramProps {
  semanticToken: string
  alias: string
}

function AdditionalFormationDiagram({
  semanticToken,
  alias,
}: AdditionalFormationDiagramProps) {
  return (
    <div className="additional-formation">
      <div className="additional-formation__core">
        <p className="additional-formation__core-title">rubellite (Core)</p>
        <div className="additional-formation__palette">
          {RUBELLITE_CORE.map((item) => (
            <div key={item.step} className="additional-formation__palette-row">
              <span className="additional-formation__step">{item.step}</span>
              <div
                className={`additional-formation__core-swatch ${'highlight' in item && item.highlight ? 'additional-formation__core-swatch--highlight' : ''}`}
                style={{ background: item.color }}
              >
                {'hex' in item && item.hex ? (
                  <span className="additional-formation__hex">{item.hex}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <img
        className="additional-formation__connector"
        src="/assets/vector67.svg"
        alt=""
        aria-hidden="true"
      />

      <div className="additional-formation__semantic">
        <p className="additional-formation__semantic-title">collection (Semantic)</p>
        <p className="additional-formation__token">{semanticToken}</p>
        <div
          className="additional-formation__swatch"
          style={{ background: '#DF3168' }}
        />
        <p className="additional-formation__alias">{alias}</p>
      </div>
    </div>
  )
}

const PRODUCT_CARDS = [
  {
    title: 'Страхование',
    usage: 'Использует insurance',
    accent: '#56C08F',
    gradient: ['#EAFFEE', '#07100C'],
    icon: 'insurance',
  },
  {
    title: 'Программа лояльности',
    usage: 'Использует pl',
    accent: '#FFC122',
    gradient: ['#FFF9E9', '#1A0F03'],
    icon: 'pl',
  },
  {
    title: '«Всё и везде»',
    usage: 'Использует viv',
    accent: '#9059FF',
    gradient: ['#F5F0FF', '#161319'],
    icon: 'viv',
  },
] as const

export function Section14Additional() {
  return (
    <GuideFrame id="section-14">
      <GuideHeader title="Подраздел Additional" />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideLead>
            Additional&nbsp;— это дополнительные акцентные цвета для общей
            и&nbsp;продуктовой инфографики
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <h2 className="guide-frame__heading guide-frame__heading--lg">Общая инфографика</h2>
          <GuideText>
            <p>Используется для дополнительных акцентов и&nbsp;визуального разнообразия</p>
          </GuideText>

          <div className="additional-subsection">
            <GuideHeading>Когда используется</GuideHeading>
            <GuideText>
              <p>В&nbsp;статистике, легендах на&nbsp;интерактивных картах, графиках и&nbsp;т.п.</p>
            </GuideText>

            <div className="additional-usage">
              <div className="additional-usage__panel">
                <div className="hall-diagram" aria-hidden="true">
                  <p className="hall-diagram__stage">СЦЕНА</p>
                  <div className="hall-diagram__zone">
                    <span>VIP зона</span>
                    <div className="hall-diagram__seats hall-diagram__seats--vip" />
                  </div>
                  <div className="hall-diagram__zone">
                    <span>Партер</span>
                    <div className="hall-diagram__seats hall-diagram__seats--parter" />
                  </div>
                </div>
                <p className="additional-usage__caption">Легенда на&nbsp;схеме зала</p>
              </div>

              <div className="additional-usage__panel">
                <ul className="icon-blocks">
                  <li className="icon-blocks__item">
                    <span className="icon-blocks__icon icon-blocks__icon--purple" />
                    <span>Счет для погашения</span>
                  </li>
                  <li className="icon-blocks__item">
                    <span className="icon-blocks__icon icon-blocks__icon--orange" />
                    <span>Акции</span>
                  </li>
                  <li className="icon-blocks__item">
                    <span className="icon-blocks__icon icon-blocks__icon--green" />
                    <span>Автоплатежи</span>
                  </li>
                </ul>
                <p className="additional-usage__caption">Разноцветные иконки в&nbsp;блоках</p>
              </div>
            </div>
          </div>

          <div className="additional-subsection">
            <GuideHeading>Как формируется</GuideHeading>
            <GuideText>
              <p>Цвета формируются из Core Color Tokens</p>
            </GuideText>
            <AdditionalFormationDiagram
              semanticToken="...-additional-netherlands-main"
              alias="rubellite/rubellite-55"
            />
          </div>
        </GuideBlock>

        <GuideBlock>
          <h2 className="guide-frame__heading guide-frame__heading--lg">Продуктовая инфографика</h2>
          <GuideText>
            <p>
              Дополнительные цвета, которые закреплены под второстепенные продукты
              или сервисы
            </p>
          </GuideText>

          <div className="additional-subsection">
            <GuideHeading>Когда используется</GuideHeading>
            <GuideText>
              <p>
                Используем продуктовую инфографику для цветовой ассоциации с&nbsp;конкретными
                продуктами. Например, Страхование или Программа лояльности
              </p>
            </GuideText>

            <div className="product-cards">
              {PRODUCT_CARDS.map((card) => (
                <article key={card.title} className="product-card">
                  <div className="product-card__top">
                    <span
                      className={`product-card__icon product-card__icon--${card.icon}`}
                      aria-hidden="true"
                    />
                    <div
                      className="product-card__gradient"
                      style={{
                        background: `linear-gradient(180deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)`,
                      }}
                    />
                  </div>
                  <h3 className="product-card__title">{card.title}</h3>
                  <p className="product-card__usage">{card.usage}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="additional-subsection">
            <GuideHeading>Как формируется</GuideHeading>
            <GuideText>
              <p>Цвета формируются из Core Color Tokens</p>
            </GuideText>
            <AdditionalFormationDiagram
              semanticToken="...-product-prodzero-main"
              alias="rubellite/rubellite-55"
            />
          </div>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
