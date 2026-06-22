import './TypeDiagram.css'

import { DiagramCallout } from './DiagramCallout'
import { GuideButton } from './GuideButton'
import { PhoneMockup } from './PhoneMockup'

export function TypeBaseDiagram() {
  return (
    <div className="type-diagram">
      <DiagramCallout
        className="type-diagram__callout type-diagram__callout--bg-secondary"
        label="main-secondary"
        fadedPrefix="bg-base-"
        style={{ left: 179, top: 86 }}
      />
      <DiagramCallout
        className="type-diagram__callout type-diagram__callout--text-main"
        label="text-base-main"
        style={{ left: 287, top: 179 }}
      />
      <DiagramCallout
        className="type-diagram__callout type-diagram__callout--line"
        label="line-base-main-secondary"
        style={{ left: 168, top: 268 }}
      />
      <DiagramCallout
        className="type-diagram__callout type-diagram__callout--bg-card"
        label="bg-base-card-main"
        style={{ left: 244, top: 364 }}
      />
      <DiagramCallout
        className="type-diagram__callout type-diagram__callout--icon"
        direction="right"
        label="icon-base-main"
        style={{ right: 180, top: 380 }}
      />

      <div className="type-diagram__phone-wrap">
        <PhoneMockup scale={0.55} bg="var(--diagram-surface)">
          <div className="type-diagram__base-screen">
            <p className="type-diagram__headline">Привет!</p>
            <p className="type-diagram__body">
              Я некликабельный текст, написанный просто, чтобы меня прочитали
            </p>
            <div className="type-diagram__divider" />
            <p className="type-diagram__body type-diagram__body--second">
              Я некликабельный текст, написанный просто, чтобы меня прочитали
            </p>
            <div className="type-diagram__info-card">
              <p className="type-diagram__card-text">
                Здесь вы найдете полезную информацию о вашем профиле, настройках и
                использовании приложения.
              </p>
              <span className="type-diagram__info-icon" aria-hidden="true">
                i
              </span>
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  )
}

export function TypeAccentDiagram() {
  return (
    <div className="type-diagram type-diagram--tall">
      <DiagramCallout
        className="type-diagram__callout"
        label="icon-accent-additional-kenya-..."
        sublabel="main"
        style={{ left: 80, top: 121 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="text-accent-additional-kenya-..."
        sublabel="main"
        style={{ left: 80, top: 259 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="bg-accent-..."
        sublabel="ghost"
        style={{ left: 288, top: 343 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="bg-accent-..."
        sublabel="main"
        style={{ left: 288, top: 593 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        direction="right"
        label="text-accent-..."
        sublabel="main-static"
        style={{ right: 120, top: 290 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        direction="right"
        label="text-accent-..."
        sublabel="inverse-static"
        style={{ right: 120, top: 592 }}
      />

      <div className="type-diagram__phone-wrap">
        <PhoneMockup scale={0.55} bg="var(--diagram-surface)">
          <div className="type-diagram__accent-screen">
            <div className="type-diagram__section-card">
              <div className="type-diagram__section-header">
                <span className="type-diagram__section-title">Дополнительно</span>
                <a className="type-diagram__section-link" href="#">
                  Посмотреть все
                </a>
              </div>
              <div className="type-diagram__list-row type-diagram__list-row--ghost">
                <span className="type-diagram__list-icon" aria-hidden="true">
                  ✉
                </span>
                <span className="type-diagram__list-label">Email</span>
                <span className="type-diagram__chevron" aria-hidden="true">
                  ›
                </span>
              </div>
              <div className="type-diagram__list-row">
                <span className="type-diagram__list-icon" aria-hidden="true">
                  ↻
                </span>
                <span className="type-diagram__list-label">История</span>
                <span className="type-diagram__chevron" aria-hidden="true">
                  ›
                </span>
              </div>
            </div>
            <div className="type-diagram__button-wrap">
              <GuideButton label="Подробнее" />
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  )
}

export function TypeComponentDiagram() {
  return (
    <div className="type-diagram type-diagram--tall">
      <DiagramCallout
        className="type-diagram__callout"
        label="bg-component-..."
        sublabel="control-accent-inverse"
        style={{ left: 80, top: 140 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="icon-component-..."
        sublabel="form-kenya-main"
        style={{ left: 80, top: 280 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="text-component-..."
        sublabel="form-kenya-main-tertiary"
        style={{ left: 80, top: 360 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        label="line-component-..."
        sublabel="form-attention-main"
        style={{ left: 80, top: 440 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        direction="right"
        label="bg-component-states-..."
        sublabel="control-accent-main-active"
        style={{ right: 120, top: 500 }}
      />
      <DiagramCallout
        className="type-diagram__callout"
        direction="right"
        label="bg-component-..."
        sublabel="form-kenya-fade"
        style={{ right: 120, top: 200 }}
      />

      <div className="type-diagram__phone-wrap">
        <PhoneMockup scale={0.55} bg="var(--diagram-surface)">
          <div className="type-diagram__component-screen">
            <div className="type-diagram__segmented">
              <span className="type-diagram__segment type-diagram__segment--active">Отзывы</span>
              <span className="type-diagram__segment">Напишут</span>
            </div>
            <div className="type-diagram__input">
              <span className="type-diagram__input-icon" aria-hidden="true">
                ✎
              </span>
              <span className="type-diagram__input-placeholder">Написать комментарий</span>
            </div>
            <div className="type-diagram__input type-diagram__input--error">
              <span className="type-diagram__input-placeholder">Поле с ошибкой</span>
            </div>
            <div className="type-diagram__toggle-row">
              <span className="type-diagram__toggle-label">Уведомления</span>
              <span className="type-diagram__toggle type-diagram__toggle--on" aria-hidden="true" />
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  )
}
