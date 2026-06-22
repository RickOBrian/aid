import { GuideButton } from './GuideButton'
import './UsageDiagram.css'

export function UsageDiagram() {
  return (
    <div className="usage-diagram">
      <p className="usage-diagram__col usage-diagram__col--left">collection (Semantic)</p>
      <p className="usage-diagram__col usage-diagram__col--right">component</p>

      <div className="usage-diagram__row usage-diagram__row--top">
        <p className="usage-diagram__token">bg/accent/main</p>
        <div className="usage-diagram__swatch usage-diagram__swatch--65" />
        <p className="usage-diagram__alias">blue/blue-65</p>
        <img
          className="usage-diagram__connector usage-diagram__connector--top"
          src="/assets/vector65.svg"
          alt=""
          aria-hidden="true"
        />
        <GuideButton variant="default" />
      </div>

      <div className="usage-diagram__row usage-diagram__row--bottom">
        <p className="usage-diagram__token">bg/accent/states/main-pressed</p>
        <div className="usage-diagram__swatch usage-diagram__swatch--85" />
        <p className="usage-diagram__alias">blue/blue-85</p>
        <img
          className="usage-diagram__connector usage-diagram__connector--bottom"
          src="/assets/vector66.svg"
          alt=""
          aria-hidden="true"
        />
        <GuideButton variant="pressed" />
      </div>
    </div>
  )
}
