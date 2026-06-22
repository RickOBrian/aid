import './CategoriesDiagram.css'

import { PhoneMockup } from './PhoneMockup'

const ICON_COLORS = [
  '#2c64e3',
  '#0d2b81',
  '#12b76a',
  '#f79009',
  '#f04438',
  '#ee46bc',
  '#1d252f',
  '#5a6574',
]

export function CategoriesDiagramBg() {
  return (
    <div className="categories-diagram categories-diagram--compact">
      <PhoneMockup scale={0.42} bg="var(--diagram-surface)">
        <div className="categories-diagram__cards">
          <div className="categories-diagram__card categories-diagram__card--wide" />
          <div className="categories-diagram__card" />
          <div className="categories-diagram__card" />
        </div>
      </PhoneMockup>
    </div>
  )
}

export function CategoriesDiagramText() {
  return (
    <div className="categories-diagram categories-diagram--compact">
      <PhoneMockup scale={0.42} bg="#fff">
        <div className="categories-diagram__text-screen">
          <p className="categories-diagram__headline">Привет!</p>
          <p className="categories-diagram__body">
            Я текст, написанный просто, чтобы меня прочитали
          </p>
          <a className="categories-diagram__link" href="#">
            Ссылка
          </a>
        </div>
      </PhoneMockup>
    </div>
  )
}

export function CategoriesDiagramIcon() {
  return (
    <div className="categories-diagram categories-diagram--icons">
      <div className="categories-diagram__icon-row">
        {ICON_COLORS.map((color) => (
          <span key={color} className="categories-diagram__icon-x" style={{ color }}>
            ✕
          </span>
        ))}
      </div>
    </div>
  )
}

export function CategoriesDiagramLine() {
  return (
    <div className="categories-diagram categories-diagram--compact">
      <PhoneMockup scale={0.42} bg="var(--diagram-surface)">
        <div className="categories-diagram__line-screen">
          <div className="categories-diagram__line-card">
            <div className="categories-diagram__line-row" />
            <div className="categories-diagram__line-row" />
            <div className="categories-diagram__line-row" />
          </div>
        </div>
      </PhoneMockup>
    </div>
  )
}
