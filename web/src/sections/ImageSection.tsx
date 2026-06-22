import { FigmaSectionImage } from '../components/FigmaSectionImage'
import { GuideFrame } from '../components/GuideFrame'
import type { GuideSectionMeta } from '../data/guideSections'

interface ImageSectionProps {
  section: GuideSectionMeta
}

export function ImageSection({ section }: ImageSectionProps) {
  if (!section.image) return null

  return (
    <GuideFrame id={`section-${section.id}`} wide={section.wide} className="guide-frame--image">
      <FigmaSectionImage src={section.image} alt={section.title} wide={section.wide} />
    </GuideFrame>
  )
}
