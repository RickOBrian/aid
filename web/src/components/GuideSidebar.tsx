import './GuideSidebar.css'

export interface NavItem {
  id: string
  number: string
  label: string
}

interface GuideSidebarProps {
  items: NavItem[]
  activeId?: string
}

export function GuideSidebar({ items, activeId }: GuideSidebarProps) {
  return (
    <aside className="guide-sidebar">
      <div className="guide-sidebar__brand">
        <span className="guide-sidebar__logo" aria-hidden="true">
          ⚛️
        </span>
        <div>
          <p className="guide-sidebar__system">Souz DS</p>
          <p className="guide-sidebar__subtitle">Semantic Colors Guide</p>
        </div>
      </div>

      <nav className="guide-sidebar__nav" aria-label="Разделы гайда">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#section-${item.id}`}
                className={`guide-sidebar__link ${activeId === item.id ? 'guide-sidebar__link--active' : ''}`}
              >
                <span className="guide-sidebar__num">{item.number}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
