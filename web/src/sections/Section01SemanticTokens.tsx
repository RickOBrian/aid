import { FormationDiagram } from '../components/FormationDiagram'
import { UsageDiagram } from '../components/UsageDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideText,
} from '../components/GuideFrame'

export function Section01SemanticTokens() {
  return (
    <GuideFrame id="section-01">
      <GuideHeader title="Что такое Semantic Color Tokens" />

      <div className="guide-frame__container">
        <GuideBlock>
          <p className="guide-frame__lead">
            Семантические токены цвета используются в&nbsp;макетах, учитывая
            контекст применения
          </p>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>Когда используется</GuideHeading>
          <GuideText>
            <p>
              Применяем для компонентов и блоков, чтобы покрасить в нужный цвет
              и при необходимости показать стейты этого элемента через токены
            </p>
          </GuideText>
          <UsageDiagram />
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>Как формируется</GuideHeading>
          <GuideText>
            <p>
              Все семантические токены ссылаются на Core Color Tokens (палетки
              цветов).
            </p>
            <p>
              Если мы изменим HEX в Core Color Tokens, то автоматически
              обновим альясы семантических токенов
            </p>
          </GuideText>
          <FormationDiagram />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
