import type { ReactNode } from 'react'
import './PluginCard.css'

interface PluginCardProps {
  title: string
  href: string
  iconSrc?: string
}

export function PluginCard({
  title,
  href,
  iconSrc = '/guide/plugin-cover.png',
}: PluginCardProps) {
  return (
    <div className="plugin-card">
      <img
        className="plugin-card__cover"
        src={iconSrc}
        alt=""
        aria-hidden="true"
      />
      <div className="plugin-card__content">
        <p className="plugin-card__title">{title}</p>
        <a className="plugin-card__link" href={href} target="_blank" rel="noreferrer">
          Перейти к плагину
        </a>
      </div>
    </div>
  )
}

interface PluginSectionProps {
  title: ReactNode
  description: ReactNode
  plugin: PluginCardProps
  children?: ReactNode
}

export function PluginSection({ title, description, plugin, children }: PluginSectionProps) {
  return (
    <div className="plugin-section">
      <h2 className="guide-frame__heading guide-frame__heading--lg">{title}</h2>
      <div className="plugin-section__block">
        <PluginCard {...plugin} />
        <div className="guide-frame__text">{description}</div>
      </div>
      {children}
    </div>
  )
}
