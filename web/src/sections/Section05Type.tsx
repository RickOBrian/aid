import type { ComponentType } from 'react'
import {
  TokenSample,
  TokenSampleHighlight,
} from '../components/FolderTreeDiagram'
import {
  TypeAccentDiagram,
  TypeBaseDiagram,
  TypeComponentDiagram,
} from '../components/TypeDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section05Type.css'

const TYPE_SECTIONS: Array<{
  id: string
  title: string
  bullets?: string[]
  description?: string
  Diagram: ComponentType
}> = [
  {
    id: 'base',
    title: '...-base',
    bullets: ['Неакцентные цвета', 'Не имеет стейтов'],
    Diagram: TypeBaseDiagram,
  },
  {
    id: 'accent',
    title: '...-accent',
    bullets: [
      'Для акцентных элементов',
      'Кликабельные элементы (Button, Tag, Link и т.д.)',
      'Некликабельные (Badge, Counter, IconView и т.д.)',
    ],
    Diagram: TypeAccentDiagram,
  },
  {
    id: 'component',
    title: '...-component',
    description:
      'Токены для отдельных компонентов, которым требуется дополнительная настройка цветов элементов',
    Diagram: TypeComponentDiagram,
  },
] 

export function Section05Type() {
  return (
    <GuideFrame id="section-05" wide>
      <GuideHeader title="Тип" numbered number="2" />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenSample>
            bg-
            <TokenSampleHighlight>accent-</TokenSampleHighlight>
            status-attention-main-secondary-static
          </TokenSample>
          <GuideLead>
            Типы делят категории на 3 части: базовые (base), акцентные (accent) и для
            отдельных компонентов (component)
          </GuideLead>
        </GuideBlock>

        {TYPE_SECTIONS.map(({ id, title, bullets, description, Diagram }) => (
          <GuideBlock key={id} className="section-type__block">
            <div className="section-type__copy">
              <h2 className="section-type__title">{title}</h2>
              {bullets ? (
                <ul className="section-type__list">
                  {bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {description ? (
                <GuideText>
                  <p>{description}</p>
                </GuideText>
              ) : null}
            </div>
            <Diagram />
          </GuideBlock>
        ))}
      </div>
    </GuideFrame>
  )
}
