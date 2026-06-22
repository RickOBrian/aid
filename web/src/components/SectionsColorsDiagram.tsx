import './SectionsColorsDiagram.css'

import { DiagramCallout } from './DiagramCallout'
import { PhoneMockup } from './PhoneMockup'

function CardLayout({ variant }: { variant: 'main' | 'secondary' }) {
  const cardBg = variant === 'main' ? '#fff' : 'var(--diagram-surface)'

  return (
    <>
      <div className="sections-colors__card sections-colors__card--wide" style={{ background: cardBg }} />
      <div className="sections-colors__card" style={{ background: cardBg }} />
      <div className="sections-colors__card" style={{ background: cardBg }} />
    </>
  )
}

export function SectionsColorsCardDiagram() {
  return (
    <div className="sections-colors-diagram sections-colors-diagram--cards">
      <DiagramCallout
        fadedPrefix="bg-base-"
        label="main-secondary"
        description="Цвета для фона страницы, на котором располагаются все остальные элементы"
        style={{ left: 40, top: 176 }}
      />
      <DiagramCallout
        fadedPrefix="bg-base-"
        label="main"
        style={{ left: 40, top: 215 }}
      />
      <DiagramCallout
        fadedPrefix="bg-base-card"
        label="-main"
        description="Цвета для карточек, блоков или островков"
        style={{ left: 40, top: 474 }}
      />
      <DiagramCallout
        fadedPrefix="bg-base-card"
        label="-main-secondary"
        style={{ left: 40, top: 516 }}
      />

      <div className="sections-colors-diagram__phones">
        <PhoneMockup scale={0.42} bg="var(--diagram-surface)">
          <div className="sections-colors__screen">
            <CardLayout variant="main" />
          </div>
        </PhoneMockup>
        <PhoneMockup scale={0.42} bg="#fff">
          <div className="sections-colors__screen">
            <CardLayout variant="secondary" />
          </div>
        </PhoneMockup>
      </div>
    </div>
  )
}

function RowItem({ pressed = false }: { pressed?: boolean }) {
  return (
    <div className={`sections-colors__row ${pressed ? 'sections-colors__row--pressed' : ''}`}>
      <span className="sections-colors__row-title">Title</span>
      <span className="sections-colors__row-chevron" aria-hidden="true">
        ›
      </span>
    </div>
  )
}

export function SectionsColorsClickabilityDiagram() {
  const steps = [
    'Создаем карточку',
    'Размещаем в ней Row',
    'При тапе будет работать состояние pressed для Row, а не для карточки',
    'Та же карточка, но с двумя Row',
  ]

  return (
    <div className="sections-colors-diagram sections-colors-diagram--steps">
      <div className="sections-colors-diagram__step-grid">
        {steps.map((caption, index) => (
          <div key={caption} className="sections-colors-diagram__step">
            <p className="sections-colors-diagram__step-caption">{caption}</p>
            <PhoneMockup scale={0.28} bg="var(--diagram-surface)">
              <div className="sections-colors__screen sections-colors__screen--step">
                <div className="sections-colors__card sections-colors__card--step">
                  {index === 1 ? <RowItem /> : null}
                  {index === 2 ? <RowItem pressed /> : null}
                  {index === 3 ? (
                    <>
                      <RowItem />
                      <RowItem />
                    </>
                  ) : null}
                </div>
              </div>
            </PhoneMockup>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SectionsColorsModalDiagram() {
  return (
    <div className="sections-colors-diagram sections-colors-diagram--modal">
      <DiagramCallout
        label="bg-base-overlay-..."
        sublabel="main"
        description="Цвета для оверлея. Оверлей затемняет или осветляет страницу позади модальных окон"
        style={{ left: 76, top: 176 }}
      />
      <DiagramCallout
        label="bg-base-modal-..."
        sublabel="main"
        description="Цвета для модальных окон"
        style={{ left: 76, top: 474 }}
      />
      <DiagramCallout
        direction="right"
        label="bg-base-modal-..."
        sublabel="main-secondary"
        style={{ right: 76, top: 474 }}
      />

      <div className="sections-colors-diagram__phones">
        <PhoneMockup scale={0.42} bg="transparent">
          <div className="sections-colors__overlay-screen">
            <div className="sections-colors__overlay" />
            <div className="sections-colors__sheet" />
          </div>
        </PhoneMockup>
        <PhoneMockup scale={0.42} bg="transparent">
          <div className="sections-colors__overlay-screen">
            <div className="sections-colors__overlay" />
            <div className="sections-colors__modal">
              <button type="button" className="sections-colors__modal-close" aria-label="Закрыть">
                ×
              </button>
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  )
}

export function SectionsColorsWarning() {
  return (
    <div className="sections-colors-warning">
      <span className="sections-colors-warning__icon" aria-hidden="true">
        ⚠
      </span>
      <p className="sections-colors-warning__text">
        Токены в разделе bg-base-... не имеют состояний (hovered, pressed и т.п.). Имеют
        состояния компоненты, которые лежат поверх них
      </p>
    </div>
  )
}
