import './GuideButton.css'

interface GuideButtonProps {
  variant?: 'default' | 'pressed'
  label?: string
}

export function GuideButton({ variant = 'default', label = 'Подробнее' }: GuideButtonProps) {
  return (
    <div
      className={`guide-button guide-button--${variant}`}
      role="presentation"
      aria-hidden="true"
    >
      {label}
    </div>
  )
}
