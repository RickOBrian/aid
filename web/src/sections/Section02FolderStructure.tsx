import { FolderTreeDiagram } from '../components/FolderTreeDiagram'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'

export function Section02FolderStructure() {
  return (
    <GuideFrame id="section-02" wide>
      <GuideHeader title="Структура папок" />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideLead>
            Все токены хранятся в своей папке, исходя из логики применения
          </GuideLead>
          <GuideText>
            <p>Текущая схема структуры папок приведена ниже:</p>
          </GuideText>
          <FolderTreeDiagram />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
