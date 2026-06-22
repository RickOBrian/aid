import './CollectionComparisonDiagram.css'

interface CollectionCardProps {
  title: string
  prefix: string
  token: string
  lightHex: string
  darkHex: string
  lightColor: string
  darkColor: string
}

function CollectionCard({
  title,
  prefix,
  token,
  lightHex,
  darkHex,
  lightColor,
  darkColor,
}: CollectionCardProps) {
  return (
    <div className="collection-card">
      <p className="collection-card__title">{title}</p>
      <p className="collection-card__prefix">{prefix}</p>
      <div className="collection-card__row">
        <div className="collection-card__token">{token}</div>
        <div className="collection-card__modes">
          <div className="collection-card__mode">
            <span className="collection-card__mode-label">light</span>
            <div
              className="collection-card__swatch"
              style={{ background: lightColor }}
            />
            <span className="collection-card__hex">{lightHex}</span>
          </div>
          <div className="collection-card__mode">
            <span className="collection-card__mode-label">dark</span>
            <div
              className="collection-card__swatch"
              style={{ background: darkColor }}
            />
            <span className="collection-card__hex">{darkHex}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CollectionComparisonDiagram() {
  return (
    <div className="collection-comparison">
      <CollectionCard
        title="Color Collection"
        prefix="bg-base-"
        token="main"
        lightHex="#DFDFDF"
        darkHex="#313131"
        lightColor="#dfdfdf"
        darkColor="#313131"
      />
      <CollectionCard
        title="Color Collection Static-LM"
        prefix="bg-base-"
        token="main"
        lightHex="#DFDFDF"
        darkHex="#DFDFDF"
        lightColor="#dfdfdf"
        darkColor="#dfdfdf"
      />
      <CollectionCard
        title="Color Collection Static-DM"
        prefix="bg-base-"
        token="main"
        lightHex="#313131"
        darkHex="#313131"
        lightColor="#313131"
        darkColor="#313131"
      />
    </div>
  )
}
