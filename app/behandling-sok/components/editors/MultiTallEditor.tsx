import { Chips, TextField } from '@navikt/ds-react'
import { useState } from 'react'

type Props = {
  label: string
  prioriteter: number[]
  onChange: (nye: number[]) => void
  feil?: string
  min?: number
  max?: number
}

/**
 * Chip-input for tall (HAR_PRIORITET). Aksepterer heltall i range.
 */
export function MultiTallEditor({ label, prioriteter, onChange, feil, min = 0, max = 100 }: Props) {
  const [input, setInput] = useState('')
  const [lokalFeil, setLokalFeil] = useState<string | null>(null)

  function leggTil(s: string) {
    const trimmed = s.trim()
    if (!trimmed) return
    const n = Number(trimmed)
    if (!Number.isInteger(n) || n < min || n > max) {
      setLokalFeil(`Verdi må være heltall mellom ${min} og ${max}`)
      return
    }
    if (prioriteter.includes(n)) {
      setLokalFeil(`${n} er allerede lagt til`)
      return
    }
    onChange([...prioriteter, n])
    setInput('')
    setLokalFeil(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-8)' }}>
      <TextField
        label={label}
        size="small"
        description={`Trykk Enter eller komma for å legge til (${min}–${max})`}
        value={input}
        onChange={(e) => {
          const v = e.target.value
          if (v.endsWith(',')) {
            leggTil(v.slice(0, -1))
          } else {
            setInput(v)
            setLokalFeil(null)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            leggTil(input)
          }
        }}
        error={lokalFeil ?? feil}
      />
      {prioriteter.length > 0 && (
        <Chips>
          {prioriteter.map((p) => (
            <Chips.Removable key={p} onClick={() => onChange(prioriteter.filter((x) => x !== p))}>
              {String(p)}
            </Chips.Removable>
          ))}
        </Chips>
      )}
    </div>
  )
}
