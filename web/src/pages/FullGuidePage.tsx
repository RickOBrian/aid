import type { ComponentType } from 'react'
import { GuideSidebar } from '../components/GuideSidebar'
import { guideSections } from '../data/guideSections'
import { ImageSection } from '../sections/ImageSection'
import { Section01SemanticTokens } from '../sections/Section01SemanticTokens'
import { Section02FolderStructure } from '../sections/Section02FolderStructure'
import { Section03TokenStructure } from '../sections/Section03TokenStructure'
import { Section04Categories } from '../sections/Section04Categories'
import { Section05Type } from '../sections/Section05Type'
import { Section06SectionsColors } from '../sections/Section06SectionsColors'
import { Section07Shade } from '../sections/Section07Shade'
import { Section08ComponentGroup } from '../sections/Section08ComponentGroup'
import { Section09Hierarchy } from '../sections/Section09Hierarchy'
import { Section10Morphemes } from '../sections/Section10Morphemes'
import { Section11Statics } from '../sections/Section11Statics'
import { Section12States } from '../sections/Section12States'
import { Section13Platforms } from '../sections/Section13Platforms'
import { Section14Additional } from '../sections/Section14Additional'
import { Section16Plugins } from '../sections/Section16Plugins'
import { StaticCollectionsSection } from '../sections/StaticCollectionsSection'
import './FullGuidePage.css'

const REACT_SECTIONS: Record<string, ComponentType> = {
  '01': Section01SemanticTokens,
  '02': Section02FolderStructure,
  '03': Section03TokenStructure,
  '04': Section04Categories,
  '05': Section05Type,
  '06': Section06SectionsColors,
  '07': Section07Shade,
  '08': Section08ComponentGroup,
  '09': Section09Hierarchy,
  '10': Section10Morphemes,
  '11': Section11Statics,
  '12': Section12States,
  '13': Section13Platforms,
  '14': Section14Additional,
  '15': StaticCollectionsSection,
  '16': Section16Plugins,
}

export function FullGuidePage() {
  const navItems = guideSections.map((s) => ({
    id: s.id,
    number: s.number,
    label: s.navLabel,
  }))

  return (
    <div className="full-guide">
      <GuideSidebar items={navItems} />

      <main className="full-guide__main">
        {guideSections.map((section) => {
          const ReactSection = REACT_SECTIONS[section.id]
          if (ReactSection) {
            return <ReactSection key={section.id} />
          }
          if (section.type === 'image') {
            return <ImageSection key={section.id} section={section} />
          }
          return null
        })}
      </main>
    </div>
  )
}
