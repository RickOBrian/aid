import { DiagramCard } from '../components/DiagramCard'
import { TokenName } from '../components/TokenName'
import { TokenRow } from '../components/TokenRow'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section09Hierarchy.css'

export function Section09Hierarchy() {
  return (
    <GuideFrame id="section-09" wide>
      <GuideHeader
        numbered
        number="5"
        title={
          <>
            <span className="section09__title-muted">Оттенок / </span>
            Иерархия (-primary, -secondary)
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenName
            parts={[
              { text: 'bg-accent-status-attention-main-' },
              { text: 'secondary-', highlight: true },
              { text: 'static' },
            ]}
          />
          <GuideLead>Порядок в иерархии для оттенков</GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideText>
            <p>
              При составлении иерархии цветов мы обращаем внимание на их
              физический оттенок:
            </p>
          </GuideText>

          <ul className="section09__list">
            <li>Main строятся от тёмного к светлому</li>
          </ul>

          <DiagramCard
            title="bg-accent-..."
            className="diagram-card--compact diagram-card--narrow"
          >
            <TokenRow token="main" color="#2c64e3" hex="#2C64E3" />
            <TokenRow
              token="main-secondary"
              color="#3888ff"
              hex="#3888FF"
            />
            <TokenRow token="main-tertiary" color="#83b0f4" hex="#83B0F4" />
          </DiagramCard>

          <ul className="section09__list">
            <li>Fade строятся от светлого к тёмному</li>
          </ul>

          <DiagramCard
            title="bg-accent-..."
            className="diagram-card--compact diagram-card--narrow"
          >
            <TokenRow token="fade" color="#eef2ff" hex="#EEF2FF" />
            <TokenRow
              token="fade-secondary"
              color="#cedaff"
              hex="#CEDAFF"
            />
            <TokenRow token="fade-tertiary" color="#b1c4ff" hex="#B1C4FF" />
          </DiagramCard>

          <ul className="section09__list">
            <li>Ghost так же как и Main от тёмного к светлому</li>
          </ul>

          <DiagramCard
            title="bg-accent-..."
            className="diagram-card--compact diagram-card--narrow"
          >
            <TokenRow
              token="ghost"
              color="rgba(44, 100, 227, 0.2)"
              hex="#2C64E3 20%"
            />
            <TokenRow
              token="ghost-secondary"
              color="rgba(44, 100, 227, 0.1)"
              hex="#2C64E3 10%"
            />
          </DiagramCard>

          <ul className="section09__list">
            <li>Inverse не имеет иерархии</li>
          </ul>

          <div className="section09__comparison">
            <DiagramCard
              title="bg-accent-..."
              variant="dont"
              className="diagram-card--compact"
            >
              <TokenRow
                token="inverse"
                color="#ffffff"
                hex="#FFFFFF"
                badgeVariant="error"
              />
              <TokenRow
                token="inverse-secondary"
                color="#f5f5f5"
                hex="#F5F5F5"
                badgeVariant="error"
              />
            </DiagramCard>

            <DiagramCard
              title="bg-accent-..."
              variant="do"
              className="diagram-card--compact"
            >
              <TokenRow
                token="inverse"
                color="#ffffff"
                hex="#FFFFFF"
                badgeVariant="success"
              />
              <TokenRow
                token="fade"
                color="#f5f5f5"
                hex="#F5F5F5"
                badgeVariant="success"
              />
            </DiagramCard>
          </div>

          <div className="section09__callout">
            <span className="section09__callout-icon" aria-hidden="true">
              i
            </span>
            <p>
              <strong>В некоторых случаях допускаются исключения</strong>
              <br />
              <br />
              Например, если светлый оттенок используется гораздо чаще
              тёмного (более 80% ситуаций), то тёмный назначается как
              secondary
            </p>
          </div>

          <div className="section09__exceptions">
            <DiagramCard
              title="...-accent-additional-..."
              variant="okay"
              className="diagram-card--compact diagram-card--medium"
              footer="В данном примере мы допускаем что желтый additional используется чаще, поэтому его темный аналог становится secondary"
            >
              <TokenRow
                token="egypt-main"
                color="#ffc122"
                alias="citrine/citrine-25"
              />
              <TokenRow
                token="egypt-main-secondary"
                color="#4f2f0a"
                alias="citrine/citrine-80"
              />
            </DiagramCard>

            <DiagramCard
              title="bg-base-..."
              variant="okay"
              className="diagram-card--compact diagram-card--medium"
              footer="Для surface не работают стандартные правила, чтобы было проще выбрать нужный оттенок для фона"
            >
              <TokenRow token="main" color="#ffffff" hex="#FFFFFF" />
              <TokenRow token="secondary" color="#f3f3f3" hex="#F3F3F3" />
            </DiagramCard>
          </div>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
