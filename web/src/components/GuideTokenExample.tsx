import './GuideTokenExample.css'

interface GuideTokenExampleProps {
  parts: Array<{ text: string; morpheme?: boolean }>
}

export function GuideTokenExample({ parts }: GuideTokenExampleProps) {
  return (
    <p className="guide-token-example">
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.morpheme ? 'guide-token-example__morpheme' : undefined}
        >
          {part.text}
        </span>
      ))}
    </p>
  )
}
