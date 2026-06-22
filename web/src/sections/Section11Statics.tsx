import { GuideTokenExample } from '../components/GuideTokenExample'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import { StaticMorphemeDiagram } from '../components/StaticMorphemeDiagram'
import { StaticThemePreview } from '../components/StaticThemePreview'
import {
  StaticWmDiagramJapan,
  StaticWmDiagramRussia,
  StaticWmDiagramStaticCompare,
} from '../components/StaticWmDiagram'
import './guide-section-shared.css'

export function Section11Statics() {
  return (
    <GuideFrame id="section-11" wide>
      <GuideHeader
        title={
          <>
            Морфемы / <span className="guide-mono">Статики</span>
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideTokenExample
            parts={[
              { text: 'bg-accent-status-attention-main-secondary' },
              { text: '-', morpheme: true },
              { text: 'static', morpheme: true },
            ]}
          />
          <GuideLead>
            Статики (статичные цвета) — не меняют цвет в других модах
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>
            <span className="guide-mono">-static</span>
          </GuideHeading>
          <GuideText>
            <p>
              Статичные токены имеют один и тот же оттенок цвета в light и dark
              modes
            </p>
            <p>
              Токены с морфемой <span className="guide-mono">-static</span>{' '}
              создаются только если уже существует какой-то оттенок с таким же
              оттенком в light mode, но который меняется в dark mode
            </p>
          </GuideText>
          <StaticMorphemeDiagram />
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>
            <span className="guide-mono">-staticwm</span>
          </GuideHeading>
          <GuideText>
            <p>
              Это морфемы для статичных цветов в модах Wealth Management
            </p>
          </GuideText>
          <GuideText>
            <ol className="guide-numbered-list">
              <li>
                Мы используем морфему <span className="guide-mono">-staticwm</span>
                , если цвет light мода совпадает в WM модах
              </li>
            </ol>
          </GuideText>
          <StaticWmDiagramRussia />
          <GuideText>
            <ol className="guide-numbered-list" start={2}>
              <li>
                Нам неважно что происходит в dark моде у{' '}
                <span className="guide-mono">-staticwm</span>, поэтому опираемся
                на wm темы
              </li>
            </ol>
          </GuideText>
          <StaticWmDiagramJapan />
          <GuideText>
            <ol className="guide-numbered-list" start={3}>
              <li>
                Если цвет light мода повторяется во всех других модах, то тогда
                это просто <span className="guide-mono">-static</span>
              </li>
            </ol>
          </GuideText>
          <StaticWmDiagramStaticCompare />
        </GuideBlock>

        <GuideBlock>
          <GuideText>
            <p>Пример как работают статичные токены на разных темах</p>
          </GuideText>
          <StaticThemePreview />
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
