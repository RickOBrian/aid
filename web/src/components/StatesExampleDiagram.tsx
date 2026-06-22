import type { ReactNode } from 'react'
import { GuideButton } from './GuideButton'
import './StatesExampleDiagram.css'

interface StateExampleProps {
  token: string
  caption: string
  hex: string
  color: string
  children: ReactNode
  connectorSrc: string
}

function StateExample({
  token,
  caption,
  hex,
  color,
  children,
  connectorSrc,
}: StateExampleProps) {
  return (
    <div className="states-example-diagram__example">
      <p className="states-example-diagram__token">{token}</p>
      <div className="states-example-diagram__ui-row">
        {children}
        <img
          className="states-example-diagram__connector"
          src={connectorSrc}
          alt=""
          aria-hidden="true"
        />
        <div className="states-example-diagram__swatch-group">
          <div
            className="states-example-diagram__swatch"
            style={{ background: color }}
          />
          <span className="states-example-diagram__hex">{hex}</span>
        </div>
      </div>
      <p className="states-example-diagram__caption">{caption}</p>
    </div>
  )
}

function GuideToggle({ variant }: { variant: 'active' | 'disabled' }) {
  return (
    <div
      className={`guide-toggle guide-toggle--${variant}`}
      role="presentation"
      aria-hidden="true"
    >
      <span className="guide-toggle__knob" />
    </div>
  )
}

export function StatesExampleDiagram() {
  return (
    <div className="states-example-diagram">
      <div className="states-example-diagram__card">
        <StateExample
          token="bg-accent-main"
          caption="Обычное состояние"
          hex="#2C64E3"
          color="#2c64e3"
          connectorSrc="/assets/vector65.svg"
        >
          <GuideButton variant="default" label="Добавить" />
        </StateExample>
        <StateExample
          token="bg-accent-state-main-pressed"
          caption="При тапе"
          hex="#1039B1"
          color="#1039b1"
          connectorSrc="/assets/vector66.svg"
        >
          <GuideButton variant="pressed" label="Добавить" />
        </StateExample>
      </div>

      <div className="states-example-diagram__card">
        <StateExample
          token="bg-component-states-control-egypt-main-actived"
          caption="Обычное состояние"
          hex="#FEAC15"
          color="#feac15"
          connectorSrc="/assets/vector67.svg"
        >
          <GuideToggle variant="active" />
        </StateExample>
        <StateExample
          token="bg-component-states-control-disabled"
          caption="Неактивное"
          hex="#EBEBEB"
          color="#ebebeb"
          connectorSrc="/assets/vector68.svg"
        >
          <GuideToggle variant="disabled" />
        </StateExample>
      </div>
    </div>
  )
}
