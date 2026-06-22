import { TokenName } from '../components/TokenName'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section13Platforms.css'

function SelectionTile({
  variant,
}: {
  variant: 'ios-focus' | 'android-ripple'
}) {
  return (
    <div className="section13__demo">
      <div className="section13__demo-stage">
        <div
          className={`section13__tile section13__tile--${variant}`}
          aria-hidden="true"
        >
          {variant === 'ios-focus' ? (
            <span className="section13__ios-focus-ring" />
          ) : (
            <span className="section13__android-ripple" />
          )}
          <span className="section13__radiobox" />
          <span className="section13__tile-label">Label for this pretty tile</span>
          <span className="section13__cursor" />
        </div>
      </div>
    </div>
  )
}

export function Section13Platforms() {
  return (
    <GuideFrame id="section-13">
      <GuideHeader
        numbered
        number="6"
        title={
          <>
            <span className="section13__title-muted">Морфемы / </span>
            Платформы
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenName
            size="lg"
            parts={[
              { text: 'bg-accent-status-attention-states-ripple-pressed-' },
              { text: 'android', highlight: true },
            ]}
          />
          <GuideLead>
            Морфема платформы добавляется, если токен используется только на
            конкретной ОС, либо его значение для разных ОС различается
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>-ios</GuideHeading>
          <GuideText>
            <p>Для токенов, использующихся только на iOS</p>
            <p>Например, фокусное состояние на элементах focused-ios</p>
          </GuideText>
          <SelectionTile variant="ios-focus" />
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>-android</GuideHeading>
          <GuideText>
            <p>Для токенов, использующихся только на Android</p>
            <p>Например, эффект тапа ripple-android</p>
          </GuideText>
          <SelectionTile variant="android-ripple" />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
