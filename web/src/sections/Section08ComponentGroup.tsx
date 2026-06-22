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
import './Section08ComponentGroup.css'

function TextFieldPreview() {
  return (
    <div className="section08__text-field" aria-hidden="true">
      <span className="section08__text-field-label">Текстовое поле</span>
    </div>
  )
}

function CheckboxPreview() {
  return (
    <div className="section08__checkbox" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#2c64e3" />
        <path
          d="M7 12.5L10.5 16L17 9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Section08ComponentGroup() {
  return (
    <GuideFrame id="section-08">
      <GuideHeader
        numbered
        number="5"
        title={
          <>
            <span className="section08__title-muted">Оттенок / </span>
            Название группы компонентов
          </>
        }
      />

      <div className="guide-frame__container">
        <GuideBlock>
          <TokenName
            parts={[
              { text: 'bg-component-' },
              { text: 'form-kenya-fade', highlight: true },
            ]}
          />
          <GuideLead>
            В component перед названием цвета и его оттенка нужно указать
            группу компонентов
          </GuideLead>
        </GuideBlock>

        <GuideBlock>
          <GuideHeading>
            Название группы компонентов (form, control, ...)
          </GuideHeading>
          <GuideText>
            <p>
              Для токенов в component добавляется название группы компонентов
              где они применяются, например, control (кнопки, чекбоксы и т.п.)
              или form (text field, code field, amount).
            </p>
            <p>
              После группы компонентов идёт цвет. Например, если для фона
              чекбокса (группа control), в его активном состоянии
              (states/actived) используется основной цвет продукта (accent),
              то название токена будет:
            </p>
            <p>
              <strong>bg-component-states-control-accent-active</strong>
            </p>
            <p>
              Мы не пишем весь путь до семантического токена, например для
              серого цвета достаточно использовать ...-kenya-fade, вместо
              ...-accent-additional-kenya-fade
            </p>
          </GuideText>

          <DiagramCard title="...-component-...">
            <TokenRow
              token="form-kenya-fade"
              color="var(--form-kenya-fade)"
              hex="#F6F7F8"
              trailing={<TextFieldPreview />}
            />
            <TokenRow
              token="states-control-accent-active"
              color="#2c64e3"
              hex="#2C64E3"
              trailing={<CheckboxPreview />}
            />
          </DiagramCard>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
