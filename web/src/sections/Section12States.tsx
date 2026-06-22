import { GuideTokenExample } from '../components/GuideTokenExample'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import { StatesExampleDiagram } from '../components/StatesExampleDiagram'
import { StatesPlatformTable } from '../components/StatesPlatformTable'
import './guide-section-shared.css'

export function Section12States() {
  return (
    <GuideFrame id="section-12" wide>
      <GuideHeader
        title={
          <>
            Морфемы / <span className="guide-mono">Стейты</span>
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideTokenExample
            parts={[
              { text: 'bg-accent-status-attention' },
              { text: '-', morpheme: true },
              { text: 'states-', morpheme: true },
              { text: 'main-' },
              { text: 'pressed', morpheme: true },
            ]}
          />
          <GuideLead>
            Стейты — это морфемы для состояний. Например,{' '}
            <span className="guide-mono">-hovered</span>,{' '}
            <span className="guide-mono">-pressed</span>. Всегда находятся в
            подпапке <span className="guide-mono">...-states-...</span>
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>
            <span className="guide-mono">-states</span>
          </GuideHeading>
          <GuideText>
            <p>Стейты используются для разделов accent и components</p>
          </GuideText>
          <StatesExampleDiagram />
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>Виды стейтов</GuideHeading>
          <GuideText>
            <p>Шпаргалка по названиям стейтов на разных платформах</p>
          </GuideText>
          <StatesPlatformTable />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
