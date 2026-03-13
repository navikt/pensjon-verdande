import { Link } from '@navikt/ds-react'

export function linkifyText(text?: string | null): React.ReactNode[] {
  if (!text) return []

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable order from string split
        <Link key={`link-${i}-${part}`} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </Link>
      )
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: stable order from string split
    return <span key={`span-${i}-${part}`}>{part}</span>
  })
}
