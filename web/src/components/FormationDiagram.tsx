import './FormationDiagram.css'

const CORE_STEPS = [
  { step: '55', color: 'var(--sapphire-55)' },
  { step: '60', color: 'var(--sapphire-60)' },
  { step: '65', color: 'var(--sapphire-65)', hex: '#2C64E3', highlight: true },
  { step: '70', color: 'var(--sapphire-70)' },
  { step: '75', color: 'var(--sapphire-75)' },
  { step: '80', color: 'var(--sapphire-80)' },
  { step: '85', color: 'var(--sapphire-85)', hex: '#0D2B81', highlight: true },
  { step: '90', color: 'var(--sapphire-90)' },
] as const

export function FormationDiagram() {
  return (
    <div className="formation-diagram">
      <div className="formation-diagram__core">
        <p className="formation-diagram__core-title">sapphire (Core)</p>
        <div className="formation-diagram__palette">
          {CORE_STEPS.map((item) => (
            <div key={item.step} className="formation-diagram__palette-row">
              <span className="formation-diagram__step">{item.step}</span>
              <div
                className={`formation-diagram__core-swatch ${'highlight' in item && item.highlight ? 'formation-diagram__core-swatch--highlight' : ''}`}
                style={{ background: item.color }}
              >
                {'hex' in item && item.hex ? (
                  <span className="formation-diagram__hex">{item.hex}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="formation-diagram__semantic-title">collection (Semantic)</p>

      <div className="formation-diagram__semantic formation-diagram__semantic--top">
        <p className="formation-diagram__token">/accent/main</p>
        <div className="formation-diagram__swatch formation-diagram__swatch--65" />
        <p className="formation-diagram__alias">blue/blue-65</p>
        <img
          className="formation-diagram__connector formation-diagram__connector--top"
          src="/assets/vector67.svg"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="formation-diagram__semantic formation-diagram__semantic--bottom">
        <p className="formation-diagram__token">/accent/states/main-pressed</p>
        <div className="formation-diagram__swatch formation-diagram__swatch--85" />
        <p className="formation-diagram__alias">blue/blue-85</p>
        <img
          className="formation-diagram__connector formation-diagram__connector--bottom"
          src="/assets/vector68.svg"
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
