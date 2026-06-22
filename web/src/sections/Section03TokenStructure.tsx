import type { ReactNode } from 'react'
import { buildTokenSegments, TokenName } from '../components/TokenName'
import {
  GuideBlock,
  GuideFrame,
  GuideHeader,
  GuideLead,
  GuideText,
} from '../components/GuideFrame'
import './Section03TokenStructure.css'

const SAMPLE_TOKEN = 'bg-accent-status-attention-main-secondary-static'

const TOKEN_ZONES = [
  { label: 'bg-accent-status', tone: 'folder' as const },
  { label: 'attention', tone: 'color' as const },
  { label: 'main-secondary-static', tone: 'setting' as const },
]

const LEGEND = [
  { tone: 'folder' as const, label: 'Папка' },
  { tone: 'color' as const, label: 'Цвет' },
  { tone: 'setting' as const, label: 'Настройка' },
]

function TokenBreakdownRow({
  number,
  name,
  linkTone,
  children,
  examples,
}: {
  number: number
  name: string
  linkTone?: 'orange' | 'blue' | 'pink'
  children: ReactNode
  examples: ReactNode
}) {
  return (
    <div className="token-breakdown__row">
      <div className="token-breakdown__content">
        <p className="token-breakdown__title">
          <strong>
            {number}. {name} (
          </strong>
          {linkTone ? (
            <a className={`token-breakdown__link token-breakdown__link--${linkTone}`} href="#">
              подробнее →
            </a>
          ) : null}
          <strong>)</strong>
        </p>
        <div className="token-breakdown__body">{children}</div>
      </div>
      <div className="token-breakdown__examples">{examples}</div>
    </div>
  )
}

export function Section03TokenStructure() {
  return (
    <GuideFrame id="section-03" wide>
      <GuideHeader title="Структура имени токена" />

      <div className="guide-frame__container">
        <GuideBlock>
          <GuideLead>
            В&nbsp;имени токена мы&nbsp;указываем весь его путь, начиная с&nbsp;категории,
            заканчивая морфемой
          </GuideLead>

          <div className="token-overview">
            <p className="token-overview__label">Название токена</p>
            <div className="token-overview__diagram">
              <div className="token-overview__zones">
                {TOKEN_ZONES.map((zone) => (
                  <span
                    key={zone.label}
                    className={`token-overview__zone token-overview__zone--${zone.tone}`}
                  >
                    {zone.label}
                  </span>
                ))}
              </div>
              <p className="token-overview__token">{SAMPLE_TOKEN}</p>
            </div>
            <ol className="token-overview__legend">
              {LEGEND.map((item, index) => (
                <li key={item.label}>
                  <span
                    className={`token-overview__legend-swatch token-overview__legend-swatch--${item.tone}`}
                    aria-hidden="true"
                  />
                  {index + 1}. {item.label}
                </li>
              ))}
            </ol>
          </div>

          <GuideText>
            <p>Каждый токен имеет имя согласно структуре.</p>
            <p>
              Структура это записанный путь токена через дефис
              <br />
              вместе с&nbsp;его классом и&nbsp;морфемой.
            </p>
          </GuideText>
        </GuideBlock>

        <GuideBlock className="token-breakdown">
          <div className="token-breakdown__group token-breakdown__group--folder">
            <TokenBreakdownRow
              number={1}
              name="Категория"
              linkTone="orange"
              examples={
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'bg-')} />
              }
            >
              <p>
                В&nbsp;начале имени токена хранится его основная категория. Категория&nbsp;—
                это базовое определение токена по&nbsp;его месту в&nbsp;интерфейсе.
              </p>
              <p>Существуют 4 категории:</p>
              <ul>
                <li>bg&nbsp;— цвета фонов экрана и&nbsp;тех блоков, на&nbsp;которых могут располагаться другие элементы</li>
                <li>text&nbsp;— цвета текста</li>
                <li>icon&nbsp;— цвета иконок</li>
                <li>line&nbsp;— цвета обводок и&nbsp;линий</li>
              </ul>
            </TokenBreakdownRow>

            <TokenBreakdownRow
              number={2}
              name="Тип"
              linkTone="orange"
              examples={
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'accent-')} />
              }
            >
              <p>
                После категории в&nbsp;имени токена хранится название его типа. Типы нужны
                для более точной сортировки токенов.
              </p>
              <p>Существуют 3 вида типа:</p>
              <ul>
                <li>base&nbsp;— базовые, не&nbsp;имеют состояний</li>
                <li>accent&nbsp;— акцентные, могут иметь состояния</li>
                <li>component&nbsp;— уникальные цвета для компонентов</li>
              </ul>
            </TokenBreakdownRow>

            <TokenBreakdownRow
              number={3}
              name="Раздел"
              linkTone="orange"
              examples={
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'status-')} />
              }
            >
              <p>
                После типа в&nbsp;имени токена хранится название его раздела. Разделы
                необходимы для более точной сортировки токенов, например, чтобы отделить
                product цвета от&nbsp;additional.
              </p>
              <p>Примеры разделов:</p>
              <ul>
                <li>
                  Для bg:
                  <ul>
                    <li>card</li>
                    <li>overlay</li>
                    <li>modal</li>
                  </ul>
                </li>
                <li>
                  Для accent:
                  <ul>
                    <li>product</li>
                    <li>status</li>
                    <li>additional</li>
                  </ul>
                </li>
              </ul>
            </TokenBreakdownRow>
          </div>

          <div className="token-breakdown__group token-breakdown__group--color">
            <TokenBreakdownRow
              number={4}
              name="Цвет"
              linkTone="blue"
              examples={
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'attention-')} />
              }
            >
              <p>Цвет&nbsp;— основное название токена</p>
              <p>Примеры классов:</p>
              <ul>
                <li>
                  Для product:
                  <ul>
                    <li>wm</li>
                    <li>viv</li>
                    <li>pl</li>
                  </ul>
                </li>
                <li>
                  Для status:
                  <ul>
                    <li>attention</li>
                    <li>warning</li>
                    <li>success</li>
                    <li>info</li>
                  </ul>
                </li>
              </ul>
            </TokenBreakdownRow>
          </div>

          <div className="token-breakdown__group token-breakdown__group--setting">
            <TokenBreakdownRow
              number={5}
              name="Оттенок"
              linkTone="pink"
              examples={
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'main-')} />
              }
            >
              <p>Существуют следующие оттенки цветов:</p>
              <ul>
                <li>main&nbsp;— основной насыщенный оттенок</li>
                <li>fade&nbsp;— пастельный оттенок</li>
                <li>ghost&nbsp;— цвет с&nbsp;прозрачностью</li>
                <li>inverse&nbsp;— инверсивный цвет</li>
                <li>transparent&nbsp;— полностью прозрачный</li>
              </ul>
            </TokenBreakdownRow>

            <div className="token-breakdown__row token-breakdown__row--no-border">
              <div className="token-breakdown__content">
                <p className="token-breakdown__subheading">
                  <strong>Иерархия (</strong>
                  <a className="token-breakdown__link token-breakdown__link--pink" href="#">
                    подробнее →
                  </a>
                  <strong>)</strong>
                </p>
                <div className="token-breakdown__body">
                  <p>
                    Порядок для оттенка, начиная с&nbsp;-primary.
                    <br />
                    <br />В&nbsp;основном используются такие обозначения иерархии:
                  </p>
                  <ul>
                    <li>-primary&nbsp;— главный</li>
                    <li>-secondary&nbsp;— вторичный</li>
                    <li>-tertiary&nbsp;— третичный</li>
                    <li>и&nbsp;так далее...</li>
                  </ul>
                  <p className="token-breakdown__note">Не&nbsp;указываем -primary, чтобы сэкономить место</p>
                </div>
              </div>
              <div className="token-breakdown__examples">
                <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, 'secondary')} />
              </div>
            </div>

            <TokenBreakdownRow
              number={6}
              name="Морфема"
              linkTone="pink"
              examples={
                <>
                  <TokenName segments={buildTokenSegments(SAMPLE_TOKEN, '-static')} />
                  <TokenName
                    segments={[
                      { text: 'bg-accent-status-attention-' },
                      { text: 'states--', highlight: true },
                      { text: 'main-' },
                      { text: 'pressed', highlight: true },
                    ]}
                  />
                </>
              }
            >
              <p>Модификация текущего токена.</p>
              <p>Это может быть:</p>
              <ol className="token-breakdown__alpha">
                <li>
                  Обозначение статичного цвета (-static, -staticwm){' '}
                  <a className="token-breakdown__link token-breakdown__link--pink" href="#">
                    подробнее →
                  </a>
                </li>
                <li>
                  Указание состояния (-pressed, -hovered, -disabled и&nbsp;т.д.){' '}
                  <a className="token-breakdown__link token-breakdown__link--pink" href="#">
                    подробнее →
                  </a>
                </li>
              </ol>
            </TokenBreakdownRow>
          </div>
        </GuideBlock>
      </div>
    </GuideFrame>
  )
}
