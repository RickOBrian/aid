import './FigmaSectionImage.css'

interface FigmaSectionImageProps {
  src: string
  alt: string
  wide?: boolean
}

export function FigmaSectionImage({ src, alt, wide = false }: FigmaSectionImageProps) {
  return (
    <div className={`figma-section-image ${wide ? 'figma-section-image--wide' : ''}`}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  )
}
