import {
  CategoriesDiagramBg,
  CategoriesDiagramIcon,
  CategoriesDiagramLine,
  CategoriesDiagramText,
} from '../components/CategoriesDiagram'
import {
  TokenSample,
  TokenSampleHighlight,
} from '../components/FolderTreeDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section04Categories.css'

const CATEGORIES = [
  {
    id: 'bg',
    title: 'bg',
    description:
      'Категория для цветов фона. Используется для карточек, компонентов, фона страницы и т.п.',
    Diagram: CategoriesDiagramBg,
  },
  {
    id: 'text',
    title: 'text',
    description:
      'Категория для цветов текста. Используется для текста в компонентах, гиперссылок и для простого некликабельного текста на странице',
    Diagram: CategoriesDiagramText,
  },
  {
    id: 'icon',
    title: 'icon',
    description: 'Цвета для иконок из набора Base',
    Diagram: CategoriesDiagramIcon,
  },
  {
    id: 'line',
    title: 'line',
    description:
      'Цвета для разделяющих линий, обводок в компонентах, подчеркиваний текста и т.п.',
    Diagram: CategoriesDiagramLine,
  },
] as const

export function Section04Categories() {
  return (
    <GuideFrame id="section-04" wide>
      <GuideHeader title="Категории" numbered number="1" />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenSample>
            <TokenSampleHighlight>bg-</TokenSampleHighlight>
            accent-status-attention-main-secondary-static
          </TokenSample>
          <GuideLead>
            Любой цвет элемента интерфейса относится к одной из категорий: фон (bg),
            текст (text), иконки (icon) или линии и обводки (line)
          </GuideLead>
        </GuideBlock>

        <GuideBlock className="section-categories__list">
          {CATEGORIES.map(({ id, title, description, Diagram }, index) => (
            <div
              key={id}
              className={`section-categories__row ${index < CATEGORIES.length - 1 ? 'section-categories__row--bordered' : ''}`}
            >
              <div className="section-categories__copy">
                <h2 className="section-categories__title">{title}</h2>
                <GuideText>
                  <p>{description}</p>
                </GuideText>
              </div>
              <Diagram />
            </div>
          ))}
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
