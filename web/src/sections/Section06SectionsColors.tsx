import {
  TokenSample,
  TokenSampleHighlight,
} from '../components/FolderTreeDiagram'
import {
  SectionsColorsCardDiagram,
  SectionsColorsClickabilityDiagram,
  SectionsColorsModalDiagram,
  SectionsColorsWarning,
} from '../components/SectionsColorsDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section06SectionsColors.css'

export function Section06SectionsColors() {
  return (
    <GuideFrame id="section-06" wide>
      <GuideHeader title="Разделы и цвета" numbered number="4" />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenSample>
            bg-accent-
            <TokenSampleHighlight>status-attention-</TokenSampleHighlight>
            main-secondary-static
          </TokenSample>
          <GuideLead>
            Разделы необходимы для группировки токенов в типах. Например, чтобы отделить
            product от additional
          </GuideLead>
        </GuideBlock>

        <GuideBlock className="section-sections-colors__block">
          <h2 className="section-sections-colors__heading">
            Раздел <span className="section-sections-colors__muted">Bg/Base/</span>Card
          </h2>
          <GuideText>
            <p>Card — базовые цвета карточек и островков</p>
          </GuideText>
          <SectionsColorsCardDiagram />
          <GuideText>
            <p>Как работает кликабельность в карточках и на элементах</p>
          </GuideText>
          <SectionsColorsClickabilityDiagram />
        </GuideBlock>

        <GuideBlock className="section-sections-colors__block">
          <h2 className="section-sections-colors__heading">
            Разделы <span className="section-sections-colors__muted">Bg/Base/</span>Modal,{' '}
            <span className="section-sections-colors__muted">Bg/Base/</span>Overlay
          </h2>
          <p className="section-sections-colors__subheading">bg-base-modal и bg-base-overlay</p>
          <GuideText>
            <p>Цвета для фона шторок, модальных окон и оверлеев</p>
          </GuideText>
          <SectionsColorsModalDiagram />
          <SectionsColorsWarning />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
