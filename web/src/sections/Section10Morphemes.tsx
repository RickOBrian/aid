import { GuideButton } from '../components/GuideButton'
import { DiagramCard } from '../components/DiagramCard'
import { TokenName } from '../components/TokenName'
import { TokenRow } from '../components/TokenRow'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section10Morphemes.css'

function SwitchPreview({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`section10__switch ${active ? 'section10__switch--active' : 'section10__switch--disabled'}`}
      aria-hidden="true"
    >
      <span className="section10__switch-knob" />
    </div>
  )
}

function SelectionTilePreview({ ripple = false }: { ripple?: boolean }) {
  return (
    <div className="section10__platform-demo">
      <div className={`section10__selection-tile ${ripple ? 'section10__selection-tile--ripple' : ''}`}>
        {ripple ? <span className="section10__ripple" aria-hidden="true" /> : null}
        <span className="section10__radiobox" aria-hidden="true" />
        <span className="section10__tile-label">Label for this pretty tile</span>
        <span className="section10__cursor" aria-hidden="true" />
      </div>
    </div>
  )
}

export function Section10Morphemes() {
  return (
    <GuideFrame id="section-10">
      <GuideHeader numbered number="6" title="Морфемы" />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenName
            parts={[
              { text: 'bg-accent-status-attention-main-secondary-' },
              { text: 'static', highlight: true },
            ]}
          />
          <GuideLead>Морфема — это правило для токена</GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>-static (статичные цвета)</GuideHeading>
          <GuideText>
            <p>
              Статичные токены имеют один и тот же оттенок цвета в light и
              dark modes
            </p>
          </GuideText>

          <DiagramCard title="bg-accent-additional-...">
            <div className="section10__mode-table">
              <div className="section10__mode-table-header">
                <span className="section10__mode-table-spacer" />
                <span>light</span>
                <span>dark</span>
              </div>
              <div className="section10__mode-row">
                <div className="section10__mode-token">bahamas-main</div>
                <div className="section10__mode-swatch-group">
                  <div
                    className="section10__mode-swatch"
                    style={{ background: '#95e02b' }}
                  />
                  <span>#95E02B</span>
                </div>
                <div className="section10__mode-swatch-group">
                  <div
                    className="section10__mode-swatch"
                    style={{ background: '#bcbcbc' }}
                  />
                  <span>#BCBCBC</span>
                </div>
              </div>
              <div className="section10__mode-row">
                <div className="section10__mode-token">bahamas-main-static</div>
                <div className="section10__mode-swatch-group">
                  <div
                    className="section10__mode-swatch"
                    style={{ background: '#95e02b' }}
                  />
                  <span>#95E02B</span>
                </div>
                <div className="section10__mode-swatch-group">
                  <div
                    className="section10__mode-swatch"
                    style={{ background: '#95e02b' }}
                  />
                  <span>#95E02B</span>
                </div>
              </div>
            </div>
          </DiagramCard>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>-states (состояния)</GuideHeading>
          <GuideText>
            <p>Это морфемы для состояний. Например, -hover, -pressed</p>
          </GuideText>

          <div className="section10__states-stack">
            <DiagramCard title="bg-component-states...">
              <p className="section10__diagram-subtitle">bg-component-states-...</p>
              <TokenRow
                token="control-accent-main-actived"
                color="#2c64e3"
                hex="#2C64E3"
                trailing={<SwitchPreview active />}
              />
              <TokenRow
                token="control-accent-main-disabled"
                color="#a6a6a6"
                hex="#A6A6A6"
                trailing={<SwitchPreview />}
              />
            </DiagramCard>

            <DiagramCard title="bg-accent-...">
              <p className="section10__diagram-subtitle">bg-accent-states-...</p>
              <TokenRow
                token="main"
                color="#668af4"
                hex="#668AF4"
                trailing={<GuideButton label="Добавить" />}
              />
              <TokenRow
                token="main-pressed"
                color="#1039b1"
                hex="#1039B1"
                trailing={
                  <div className="section10__pressed-button">
                    <GuideButton variant="pressed" label="Добавить" />
                    <span className="section10__tap-cursor" aria-hidden="true" />
                  </div>
                }
              />
            </DiagramCard>
          </div>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>-ios, -android (платформы)</GuideHeading>
          <GuideText>
            <p>
              Морфема платформы добавляется, если токен используется только на
              конкретной ОС
            </p>
          </GuideText>
          <SelectionTilePreview ripple />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
