import { buildTokenSegments, TokenName } from '../components/TokenName'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideHeading,
  GuideText,
} from '../components/GuideFrame'
import './Section07Shade.css'

const SAMPLE_TOKEN = 'bg-accent-status-attention-main-secondary-static'

const MATRIX_COLUMNS = ['deb', 'helsinki', 'juli', 'pit'] as const

const MATRIX_ROWS = [
  {
    id: 'main',
    cells: [
      { color: '#347CF6', label: '#347CF6' },
      { color: '#FF4B5F', label: '#FF4B5F' },
      { color: '#EB4278', label: '#EB4278' },
      { color: '#FFB038', label: '#FFB038' },
    ],
  },
  {
    id: 'fade',
    cells: [
      { color: '#DDE9FF', label: '#DDE9FF' },
      { color: '#FFEFEE', label: '#FFEFEE' },
      { color: '#FFEEF2', label: '#FFEEF2' },
      { color: '#FFF2DE', label: '#FFF2DE' },
    ],
  },
  {
    id: 'ghost',
    cells: [
      { color: 'rgba(52, 124, 246, 0.25)', label: '#347CF6 25%' },
      { color: 'rgba(255, 75, 95, 0.25)', label: '#FF4B5F 25%' },
      { color: 'rgba(235, 66, 120, 0.25)', label: '#EB4278 25%' },
      { color: 'rgba(255, 176, 56, 0.25)', label: '#FFB038 25%' },
    ],
    checkerboard: true,
  },
  {
    id: 'inverse',
    cells: [
      { color: '#FFFFFF', label: '#FFFFFF' },
      { color: '#FFFFFF', label: '#FFFFFF' },
      { color: '#FFFFFF', label: '#FFFFFF' },
      { color: '#FFFFFF', label: '#FFFFFF' },
    ],
  },
  {
    id: 'component',
    cells: [
      { color: '#347CF6', label: '#347CF6' },
      { color: '#FF4B5F', label: '#FF4B5F' },
      { color: '#EB4278', label: '#EB4278' },
      { color: '#FFB038', label: '#FFB038' },
    ],
  },
] as const

interface ShadeExampleProps {
  tokenLabel: string
  rows: Array<{
    shade: string
    color: string
    label: string
    checkerboard?: boolean
  }>
  width?: number
}

function ShadeExampleCard({ tokenLabel, rows, width }: ShadeExampleProps) {
  return (
    <div className="shade-example" style={width ? { maxWidth: width } : undefined}>
      <p className="shade-example__token">{tokenLabel}</p>
      {rows.map((row) => (
        <div key={row.shade} className="shade-example__row">
          <span className="shade-example__shade">{row.shade}</span>
          <div className="shade-example__swatch-wrap">
            <span
              className={`shade-example__swatch ${row.checkerboard ? 'shade-example__swatch--checkerboard' : ''}`}
              style={{ background: row.color }}
            />
            <span className="shade-example__hex">{row.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function InverseButton({
  background,
  color,
  outline = false,
}: {
  background: string
  color: string
  outline?: boolean
}) {
  return (
    <div
      className={`shade-inverse__button ${outline ? 'shade-inverse__button--outline' : ''}`}
      style={
        outline
          ? { background: '#fff', color }
          : { background, color: '#fff' }
      }
    >
      Добавить
    </div>
  )
}

export function Section07Shade() {
  return (
    <GuideFrame id="section-07">
      <GuideHeader title="Оттенок" numbered number="5" />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenName
            variant="inline"
            className="section07-token"
            segments={buildTokenSegments(SAMPLE_TOKEN, 'main-')}
          />
        </GuideBlock>

        <GuideBlock>
          <div className="shade-matrix">
            <p className="shade-matrix__corner">bg-accent-product-...</p>
            <div className="shade-matrix__headers">
              {MATRIX_COLUMNS.map((column) => (
                <span key={column} className="shade-matrix__header">
                  {column}
                </span>
              ))}
            </div>
            {MATRIX_ROWS.map((row) => (
              <div key={row.id} className="shade-matrix__row">
                <span className="shade-matrix__row-label">{row.id}</span>
                {row.cells.map((cell, index) => (
                  <div key={`${row.id}-${MATRIX_COLUMNS[index]}`} className="shade-matrix__cell">
                    <span
                      className={`shade-matrix__swatch ${'checkerboard' in row && row.checkerboard ? 'shade-matrix__swatch--checkerboard' : ''}`}
                      style={{ background: cell.color }}
                    />
                    <span className="shade-matrix__hex">{cell.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="shade-subsection">
            <GuideHeading>main</GuideHeading>
            <GuideText>
              <p>Main создан для насыщенных оттенков цветов</p>
            </GuideText>
            <div className="shade-subsection__cards">
              <ShadeExampleCard
                tokenLabel="bg-accent-..."
                rows={[{ shade: 'main', color: '#347CF6', label: '#347CF6' }]}
                width={260}
              />
              <ShadeExampleCard
                tokenLabel="bg-accent-additional-netherlands-..."
                rows={[{ shade: 'main', color: '#FD6D9B', label: '#FD6D9B' }]}
                width={315}
              />
            </div>
          </div>

          <div className="shade-subsection">
            <GuideHeading>fade</GuideHeading>
            <GuideText>
              <p>Fade создан для пастельных оттенков цветов</p>
            </GuideText>
            <div className="shade-subsection__cards">
              <ShadeExampleCard
                tokenLabel="bg-accent-additional-kenya-..."
                rows={[
                  { shade: 'main', color: '#363636', label: '#363636' },
                  { shade: 'fade', color: '#EEEEEE', label: '#EEEEEE' },
                ]}
                width={260}
              />
              <ShadeExampleCard
                tokenLabel="bg-accent-additional-japan-..."
                rows={[
                  { shade: 'main', color: '#9059FF', label: '#9059FF' },
                  { shade: 'fade', color: '#F5F0FF', label: '#F5F0FF' },
                ]}
                width={270}
              />
            </div>
          </div>

          <div className="shade-subsection">
            <GuideHeading>Ghost</GuideHeading>
            <GuideText>
              <p>Ghost создан для полупрозрачных цветов</p>
            </GuideText>
            <div className="shade-subsection__cards">
              <ShadeExampleCard
                tokenLabel="bg-accent-attention-..."
                rows={[
                  { shade: 'main', color: '#F04438', label: '#CF63A7' },
                  {
                    shade: 'ghost',
                    color: 'rgba(240, 68, 56, 0.2)',
                    label: '#F0443833',
                    checkerboard: true,
                  },
                ]}
                width={265}
              />
              <ShadeExampleCard
                tokenLabel="bg-accent-additional-vietnam-..."
                rows={[
                  { shade: 'main', color: '#CF63A7', label: '#CF63A7' },
                  {
                    shade: 'ghost',
                    color: 'rgba(207, 99, 167, 0.16)',
                    label: '#CF63A729',
                    checkerboard: true,
                  },
                ]}
                width={288}
              />
            </div>
          </div>

          <div className="shade-subsection">
            <GuideHeading>inverse</GuideHeading>
            <GuideText>
              <p>Inverse превращает любой main оттенок на&nbsp;акцентных элементах в&nbsp;белый</p>
            </GuideText>

            <div className="shade-inverse">
              <p className="shade-inverse__caption">Каждый accent токен в&nbsp;inverse это белый</p>
              <div className="shade-inverse__mapping">
                <div className="shade-inverse__lane">
                  <span className="shade-inverse__lane-label">main</span>
                  <div className="shade-inverse__pairs">
                    {[
                      { main: '#2C64E3', inverse: '#FFFFFF' },
                      { main: '#223044', inverse: '#FFFFFF' },
                      { main: '#12B76A', inverse: '#FFFFFF' },
                    ].map((pair, index) => (
                      <div key={index} className="shade-inverse__pair">
                        <div className="shade-inverse__pair-col">
                          <span
                            className="shade-example__swatch"
                            style={{ background: pair.main }}
                          />
                          <span className="shade-example__hex">#FD6D9B</span>
                        </div>
                        <div className="shade-inverse__pair-col">
                          <span
                            className="shade-example__swatch"
                            style={{ background: pair.inverse, border: '1px solid rgba(0,0,0,0.08)' }}
                          />
                          <span className="shade-example__hex">#FFFFFF</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="shade-inverse__lane-label">inverse</span>
                </div>
              </div>

              <p className="shade-inverse__caption">Покажем нагляднее на&nbsp;примере условных кнопок</p>
              <div className="shade-inverse__buttons">
                <div className="shade-inverse__button-col">
                  <InverseButton background="#2C64E3" color="#fff" />
                  <InverseButton background="#2C64E3" color="#2C64E3" outline />
                </div>
                <div className="shade-inverse__button-col">
                  <InverseButton background="#223044" color="#fff" />
                  <InverseButton background="#223044" color="#192433" outline />
                </div>
                <div className="shade-inverse__button-col">
                  <InverseButton background="#12B76A" color="#fff" />
                  <InverseButton background="#12B76A" color="#12B76A" outline />
                </div>
              </div>

              <div className="shade-inverse__callout">
                <span className="shade-inverse__callout-icon" aria-hidden="true">
                  i
                </span>
                <div className="shade-inverse__callout-body">
                  <p>
                    <strong>Почему бы не&nbsp;использовать один общий белый цвет?</strong>
                  </p>
                  <p>
                    Мы&nbsp;используем правило inverse, чтобы не&nbsp;потерять контекст токена.
                    Это правило можно сравнить с&nbsp;лысыми людьми, мы&nbsp;не&nbsp;знаем
                    какой у&nbsp;них изначальный цвет волос (inverse), пока они не&nbsp;отрастят
                    волосы (main)
                  </p>
                  <div className="shade-inverse__analogy" aria-hidden="true">
                    <div className="shade-inverse__analogy-card">
                      <div className="shade-inverse__analogy-photo shade-inverse__analogy-photo--main" />
                      <span>jason_statham-main</span>
                    </div>
                    <div className="shade-inverse__analogy-card">
                      <div className="shade-inverse__analogy-photo shade-inverse__analogy-photo--inverse" />
                      <span>jason_statham-inverse</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
