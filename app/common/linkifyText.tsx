import { Link } from '@navikt/ds-react'

export function linkifyText(text?: string | null): React.ReactNode[] {
  if (!text) return []

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <Link key={`link-${i}-${part}`} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </Link>
      )
    }
    return <span key={`span-${part}`}>{part}</span>
  })
}
